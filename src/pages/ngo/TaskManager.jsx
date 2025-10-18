import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Plus, Check, X } from 'lucide-react';
import '../../styles/TaskManager.css';

const TaskManager = () => {
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    estimatedHours: 1,
  });
  const [feedback, setFeedback] = useState({});

  const ngo = useQuery(
    api.ngos.getNGOByUserId,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const tasks = useQuery(
    api.tasks.getTasksForNGO,
    ngo?._id ? { ngoId: ngo._id } : 'skip'
  );

  const createTask = useMutation(api.tasks.createTask);
  const reviewTask = useMutation(api.tasks.reviewTask);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!ngo?._id) return;

    try {
      await createTask({
        ngoId: ngo._id,
        ...formData,
      });
      
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        estimatedHours: 1,
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

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

  const submittedTasks = tasks?.filter(t => t.status === 'submitted') || [];
  const activeTasks = tasks?.filter(t => t.status !== 'completed' && t.status !== 'submitted') || [];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];

  return (
    <div className="task-manager">
      <div className="page-header">
        <div>
          <h1>Task Management</h1>
          <p>Create and manage volunteer tasks</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Create Task
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Translate a 2-page document"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="4"
                  placeholder="Provide clear instructions and requirements..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    placeholder="e.g., Translation, Design, Writing"
                  />
                </div>

                <div className="form-group">
                  <label>Estimated Hours *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submitted Tasks Needing Review */}
      {submittedTasks.length > 0 && (
        <section className="task-section">
          <h2>Pending Review ({submittedTasks.length})</h2>
          <div className="tasks-list">
            {submittedTasks.map(task => (
              <div key={task._id} className="task-card review-card">
                <div className="task-header">
                  <div>
                    <h3>{task.title}</h3>
                    <p className="task-volunteer">Submitted by {task.volunteer?.name}</p>
                  </div>
                  <span className="status-badge submitted">Submitted</span>
                </div>

                <p className="task-description">{task.description}</p>

                <div className="submission-section">
                  <h4>Volunteer's Submission:</h4>
                  <p className="submission-text">{task.submissionText}</p>
                </div>

                <div className="review-form">
                  <textarea
                    placeholder="Add feedback (optional)..."
                    value={feedback[task._id] || ''}
                    onChange={(e) => setFeedback({ ...feedback, [task._id]: e.target.value })}
                    rows="2"
                  />
                  <div className="review-actions">
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleReview(task._id, false)}
                    >
                      <X size={16} />
                      Request Revision
                    </button>
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleReview(task._id, true)}
                    >
                      <Check size={16} />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Tasks */}
      <section className="task-section">
        <h2>Active Tasks ({activeTasks.length})</h2>
        <div className="tasks-list">
          {activeTasks.length === 0 ? (
            <p className="empty-message">No active tasks</p>
          ) : (
            activeTasks.map(task => (
              <div key={task._id} className="task-card">
                <div className="task-header">
                  <div>
                    <h3>{task.title}</h3>
                    <p className="task-meta">{task.category} • {task.estimatedHours}h</p>
                  </div>
                  <span className={`status-badge ${task.status}`}>{task.status}</span>
                </div>
                <p className="task-description">{task.description}</p>
                {task.volunteer && (
                  <p className="task-volunteer">Assigned to: {task.volunteer.name}</p>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Completed Tasks */}
      <section className="task-section">
        <h2>Completed Tasks ({completedTasks.length})</h2>
        <div className="tasks-list">
          {completedTasks.length === 0 ? (
            <p className="empty-message">No completed tasks yet</p>
          ) : (
            completedTasks.slice(0, 5).map(task => (
              <div key={task._id} className="task-card completed-card">
                <div className="task-header">
                  <div>
                    <h3>{task.title}</h3>
                    <p className="task-volunteer">By {task.volunteer?.name}</p>
                  </div>
                  <span className="status-badge completed">✓ Completed</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default TaskManager;

