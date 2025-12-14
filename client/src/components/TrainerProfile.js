import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './TrainerProfile.css';

const TrainerProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [trainer, setTrainer] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainer();
  }, [id]);

  const fetchTrainer = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await axios.get(`http://localhost:5000/api/trainers/${id}`, { headers });
      setTrainer(res.data.trainer);
      setPlans(res.data.plans);
      setIsFollowing(res.data.isFollowing);
    } catch (error) {
      console.error('Error fetching trainer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      alert('Please login to follow trainers');
      return;
    }

    try {
      if (isFollowing) {
        await axios.delete(`http://localhost:5000/api/trainers/${id}/follow`);
        setIsFollowing(false);
      } else {
        await axios.post(`http://localhost:5000/api/trainers/${id}/follow`);
        setIsFollowing(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating follow status');
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!trainer) {
    return <div className="container">Trainer not found</div>;
  }

  return (
    <div className="trainer-profile">
      <div className="container">
        <div className="profile-header">
          <div className="profile-info">
            <h1>{trainer.name}</h1>
            <p className="trainer-email">{trainer.email}</p>
            {user && user.role === 'user' && (
              <button 
                onClick={handleFollow} 
                className={isFollowing ? 'follow-btn following' : 'follow-btn'}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <div className="plans-section">
          <h2>Plans ({plans.length})</h2>
          {plans.length === 0 ? (
            <p>No plans available yet.</p>
          ) : (
            <div className="plans-grid">
              {plans.map(plan => (
                <div key={plan._id} className="plan-card">
                  <h3>{plan.title}</h3>
                  <p className="price">${plan.price}</p>
                  <p className="duration">{plan.duration} days</p>
                  <Link to={`/plans/${plan._id}`} className="view-btn">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerProfile;

