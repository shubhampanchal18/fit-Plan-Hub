import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Landing.css';

const Landing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await axios.get('http://localhost:5000/api/plans', { headers });
      setPlans(res.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="landing">
      <div className="hero">
        <h1>Welcome to FitPlanHub</h1>
        <p>Discover personalized fitness plans from certified trainers</p>
      </div>

      <div className="container">
        <h2 className="section-title">Available Plans</h2>
        <div className="plans-grid">
          {plans.length === 0 ? (
            <p>No plans available yet.</p>
          ) : (
            plans.map(plan => (
              <div key={plan._id} className="plan-card">
                <h3>{plan.title}</h3>
                <p className="trainer-name">by {plan.trainer?.name || 'Trainer'}</p>
                <p className="price">${plan.price}</p>
                {plan.hasAccess ? (
                  <p className="description">{plan.description}</p>
                ) : (
                  <p className="preview-text">Subscribe to view full details</p>
                )}
                <Link to={`/plans/${plan._id}`} className="view-btn">
                  View Details
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;

