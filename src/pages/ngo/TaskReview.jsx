import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Check, X, Clock, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import '../../styles/TaskReview.css';

const TaskReview = () => {
  const { currentUser } = useAuth();
  const [feedback, setFeedback] = useState({});
  const [activeTab, setActiveTab] = useState('submitted');

  const ngo = useQuery(
    api.ngos.getNGOByUserId,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const tasks = useQuery(
    api.tasks.getTasksForNGO,
    ngo?._id ? { ngoId: ngo._id } : 'skip'
  );

  const reviewTask = useMutation(api.tasks.reviewTask);

  const submittedTasks = tasks?.filter(t => t.status === 'submitted') || [];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];
  const revisionTasks = tasks?.filter(t => t.status === 'revision_requested') || [];

  const handleReview = async (taskId, approve) => {
    try {
      await reviewTask({
        taskId,
        approve,
        feedback: feedback[taskId] || undefined,
      });
      setFeedback({ ...feedback, [taskId]: '' });
    } catch (error) {
      console.error('Error reviewing task:', error);
    }
  };

  const renderTaskCard = (task) => (
    <div key={task._id} className="review-task-card">
      <div className="review-task-header">
        <div className="volunteer-info">
          <img 
            src={task.volunteer?.profilePicture || 'https://via.placeholder.com/50'}
            alt={task.volunteer?.name}
            className="volunteer-avatar"
          />
          <div>
            <h3>{task.title}</h3>
            <p className="volunteer-name">
              <User size={14} />
              {task.volunteer?.name}
            </p>
          </div>
        </div>
        <span className={`task-status-badge ${task.status}`}>
          {task.status === 'submitted' && <Clock size={16} />}
          {task.status === 'completed' && <Check size={16} />}
          {task.status === 'revision_requested' && <X size={16} />}
          {task.status.replace('_', ' ')}
        </span>
      </div>

      <p className="task-description">{task.description}</p>

      <div className="task-meta-info">
        <div className="meta-item">
          <Calendar size={14} />
          <span>Submitted {format(task.submittedAt || task.createdAt, 'MMM d, yyyy')}</span>
        </div>
        {task.estimatedHours && (
          <div className="meta-item">
            <Clock size={14} />
            <span>{task.estimatedHours}h estimated</span>
          </div>
        )}
      </div>

      {task.submissionText && (
        <div className="submission-section">
          <h4>Submission</h4>
          <p>{task.submissionText}</p>
        </div>
      )}

      {task.status === 'submitted' && (
        <div className="review-actions">
          <div className="feedback-input">
            <label>Feedback (optional)</label>
            <textarea
              value={feedback[task._id] || ''}
              onChange={(e) => setFeedback({ ...feedback, [task._id]: e.target.value })}
              placeholder="Provide feedback for the volunteer..."
              rows="3"
            />
          </div>
          <div className="review-buttons">
            <button 
              className="btn btn-danger"
              onClick={() => handleReview(task._id, false)}
            >
              <X size={18} />
              Request Revision
            </button>
            <button 
              className="btn btn-success"
              onClick={() => handleReview(task._id, true)}
            >
              <Check size={18} />
              Approve & Complete
            </button>
          </div>
        </div>
      )}

      {task.status === 'completed' && task.feedback && (
        <div className="feedback-section">
          <h4>Feedback Given</h4>
          <p>{task.feedback}</p>
          <span className="completed-date">
            Completed {format(task.completedAt, 'MMM d, yyyy')}
          </span>
        </div>
      )}

      {task.status === 'revision_requested' && task.feedback && (
        <div className="feedback-section revision">
          <h4>Revision Requested</h4>
          <p>{task.feedback}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="task-review-page">
      <div className="page-header">
        <div>
          <h1>Task Reviews</h1>
          <p>Review and approve volunteer task submissions</p>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'submitted' ? 'active' : ''}`}
          onClick={() => setActiveTab('submitted')}
        >
          Pending Review
          {submittedTasks.length > 0 && <span className="tab-count">{submittedTasks.length}</span>}
        </button>
        <button 
          className={`tab ${activeTab === 'revision' ? 'active' : ''}`}
          onClick={() => setActiveTab('revision')}
        >
          Revision Requested
          {revisionTasks.length > 0 && <span className="tab-count">{revisionTasks.length}</span>}
        </button>
        <button 
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
          {completedTasks.length > 0 && <span className="tab-count">{completedTasks.length}</span>}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'submitted' && (
          <div className="review-tasks-list">
            {submittedTasks.length === 0 ? (
              <div className="empty-state">
                <Clock size={64} />
                <h2>No Pending Reviews</h2>
                <p>Submitted tasks will appear here for review</p>
              </div>
            ) : (
              submittedTasks.map(renderTaskCard)
            )}
          </div>
        )}

        {activeTab === 'revision' && (
          <div className="review-tasks-list">
            {revisionTasks.length === 0 ? (
              <div className="empty-state">
                <X size={64} />
                <h2>No Revision Requests</h2>
                <p>Tasks with requested revisions will appear here</p>
              </div>
            ) : (
              revisionTasks.map(renderTaskCard)
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="review-tasks-list">
            {completedTasks.length === 0 ? (
              <div className="empty-state">
                <Check size={64} />
                <h2>No Completed Tasks</h2>
                <p>Approved tasks will appear here</p>
              </div>
            ) : (
              completedTasks.map(renderTaskCard)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskReview;

