import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Award, Trophy, Star } from 'lucide-react';
import { format } from 'date-fns';
import '../../styles/Achievements.css';

const Achievements = () => {
  const { currentUser, user } = useAuth();
  
  const userAchievements = useQuery(
    api.achievements.getUserAchievements,
    currentUser?.userId ? { userId: currentUser.userId } : 'skip'
  );

  const allAchievements = useQuery(api.achievements.getAllAchievements, {});
  const leaderboard = useQuery(api.users.getLeaderboard, { limit: 10 });

  const earnedIds = new Set(userAchievements?.map(ua => ua.achievementId) || []);
  const lockedAchievements = allAchievements?.filter(a => !earnedIds.has(a._id)) || [];

  const medals = userAchievements?.filter(ua => ua.achievement?.type === 'medal') || [];
  const badges = userAchievements?.filter(ua => ua.achievement?.type === 'badge') || [];

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <div>
          <h1>Achievements</h1>
          <p>Your volunteer milestones and recognition</p>
        </div>
        <div className="achievement-stats">
          <div className="stat-item">
            <Trophy size={24} />
            <span>{userAchievements?.length || 0} Earned</span>
          </div>
        </div>
      </div>

      <div className="achievements-content">
        <div className="achievements-main">
          {/* Medals Section */}
          <section className="achievement-section">
            <h2><Award size={24} /> Medals</h2>
            <div className="achievements-grid">
              {medals.length === 0 ? (
                <div className="empty-message">
                  <p>Complete tasks to earn medals!</p>
                </div>
              ) : (
                medals.map(ua => (
                  <div key={ua._id} className="achievement-card earned">
                    <div className="achievement-icon-large">{ua.achievement?.icon}</div>
                    <h3>{ua.achievement?.name}</h3>
                    <p>{ua.achievement?.description}</p>
                    <div className="achievement-tier">{ua.achievement?.tier}</div>
                    <div className="achievement-date">
                      Earned {format(ua.earnedAt, 'MMM d, yyyy')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Badges Section */}
          <section className="achievement-section">
            <h2><Star size={24} /> Skill Badges</h2>
            <div className="achievements-grid">
              {badges.length === 0 ? (
                <div className="empty-message">
                  <p>Complete skill-specific tasks to earn badges!</p>
                </div>
              ) : (
                badges.map(ua => (
                  <div key={ua._id} className="achievement-card earned">
                    <div className="achievement-icon-large">{ua.achievement?.icon}</div>
                    <h3>{ua.achievement?.name}</h3>
                    <p>{ua.achievement?.description}</p>
                    <div className="achievement-category">{ua.achievement?.category}</div>
                    <div className="achievement-date">
                      Earned {format(ua.earnedAt, 'MMM d, yyyy')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <section className="achievement-section">
              <h2>Locked Achievements</h2>
              <div className="achievements-grid">
                {lockedAchievements.map(achievement => (
                  <div key={achievement._id} className="achievement-card locked">
                    <div className="achievement-icon-large locked-icon">🔒</div>
                    <h3>{achievement.name}</h3>
                    <p>{achievement.description}</p>
                    <div className="achievement-progress">
                      {achievement.criteriaType === 'tasks_completed' && (
                        <p>{user?.tasksCompleted || 0} / {achievement.criteriaValue} tasks</p>
                      )}
                      {achievement.criteriaType === 'hours_volunteered' && (
                        <p>{user?.totalHoursVolunteered || 0} / {achievement.criteriaValue} hours</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Leaderboard Sidebar */}
        <div className="achievements-sidebar">
          <div className="leaderboard-card">
            <h3>🏆 Leaderboard</h3>
            <p className="leaderboard-subtitle">Top volunteers this month</p>
            <div className="leaderboard-list">
              {leaderboard?.map((volunteer, index) => (
                <div 
                  key={index} 
                  className={`leaderboard-item ${volunteer.name === user?.name ? 'current-user' : ''}`}
                >
                  <div className="leaderboard-rank">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <img 
                    src={volunteer.profilePicture || 'https://via.placeholder.com/40'}
                    alt={volunteer.name}
                    className="leaderboard-avatar"
                  />
                  <div className="leaderboard-info">
                    <h4>{volunteer.name}</h4>
                    <p>{volunteer.tasksCompleted} tasks • {volunteer.totalHours}h</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="progress-card">
            <h3>Your Progress</h3>
            <div className="progress-stats">
              <div className="progress-stat">
                <h4>{user?.tasksCompleted || 0}</h4>
                <p>Tasks Completed</p>
              </div>
              <div className="progress-stat">
                <h4>{user?.totalHoursVolunteered || 0}h</h4>
                <p>Hours Volunteered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;

