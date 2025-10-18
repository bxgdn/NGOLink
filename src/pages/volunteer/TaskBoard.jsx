import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { CheckSquare, Clock, Award, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import '../../styles/TaskBoard.css';

const TaskBoard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('available');
  
  const availableTasks = useQuery(api.tasks.getAvailableTasks, {});
  const myTasks = useQuery(
    api.tasks.getTasksForVolunteer,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const claimTask = useMutation(api.tasks.claimTask);
  const submitTask = useMutation(api.tasks.submitTask);

  const [submissionText, setSubmissionText] = useState({});
  const [claimingTask, setClaimingTask] = useState(null);

  const handleClaimTask = async (taskId) => {
    setClaimingTask(taskId);
    try {
      await claimTask({
        taskId,
        userId: currentUser.userId,
      });
    } catch (error) {
      console.error('Error claiming task:', error);
    }
    setClaimingTask(null);
  };

  const handleSubmitTask = async (taskId) => {
    if (!submissionText[taskId]) return;
    
    try {
      await submitTask({
        taskId,
        submissionText: submissionText[taskId],
      });
      setSubmissionText({ ...submissionText, [taskId]: '' });
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  const renderTaskCard = (task, canClaim = false) => (
    <div key={task._id} className="task-card">
      <div className="task-header">
        <div className="task-org">
          <img 
            src={task.ngo?.logo || 'https://via.placeholder.com/40'}
            alt={task.ngo?.name}
          />
          <span>{task.ngo?.name}</span>
        </div>
        <span className={`task-status ${task.status}`}>{task.status}</span>
      </div>

      <h3>{task.title}</h3>
      <p className="task-description">{task.description}</p>

      <div className="task-meta">
        <div className="meta-item">
          <Award size={16} />
          <span>{task.category}</span>
        </div>
        {task.estimatedHours && (
          <div className="meta-item">
            <Clock size={16} />
            <span>{task.estimatedHours}h</span>
          </div>
        )}
        {task.deadline && (
          <div className="meta-item">
            <Calendar size={16} />
            <span>Due {format(task.deadline, 'MMM d')}</span>
          </div>
        )}
      </div>

      {canClaim && (
        <button 
          className="btn btn-primary btn-block"
          onClick={() => handleClaimTask(task._id)}
          disabled={claimingTask === task._id}
        >
          {claimingTask === task._id ? 'Claiming...' : 'Claim Task'}
        </button>
      )}

      {task.status === 'claimed' && (
        <div className="task-submission">
          <textarea
            placeholder="Describe your submission..."
            value={submissionText[task._id] || ''}
            onChange={(e) => setSubmissionText({ 
              ...submissionText, 
              [task._id]: e.target.value 
            })}
            rows="3"
          />
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => handleSubmitTask(task._id)}
            disabled={!submissionText[task._id]}
          >
            Submit Task
          </button>
        </div>
      )}

      {task.status === 'submitted' && (
        <div className="info-box">
          <p>Waiting for NGO review...</p>
        </div>
      )}

      {task.status === 'completed' && task.feedback && (
        <div className="feedback-box">
          <h4>Feedback:</h4>
          <p>{task.feedback}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="task-board">
      <div className="page-header">
        <h1>Task Board</h1>
        <p>Claim tasks and build your skills</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Available Tasks
          {availableTasks && <span className="tab-count">{availableTasks.length}</span>}
        </button>
        <button 
          className={`tab ${activeTab === 'my-tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-tasks')}
        >
          My Tasks
          {myTasks && <span className="tab-count">{myTasks.length}</span>}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'available' && (
          <div className="tasks-grid">
            {!availableTasks || availableTasks.length === 0 ? (
              <div className="empty-state">
                <CheckSquare size={64} />
                <h2>No Available Tasks</h2>
                <p>Check back later for new tasks!</p>
              </div>
            ) : (
              availableTasks.map(task => renderTaskCard(task, true))
            )}
          </div>
        )}

        {activeTab === 'my-tasks' && (
          <div className="tasks-grid">
            {!myTasks || myTasks.length === 0 ? (
              <div className="empty-state">
                <CheckSquare size={64} />
                <h2>No Tasks Yet</h2>
                <p>Claim tasks from the available board to get started!</p>
              </div>
            ) : (
              myTasks.map(task => renderTaskCard(task, false))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskBoard;

