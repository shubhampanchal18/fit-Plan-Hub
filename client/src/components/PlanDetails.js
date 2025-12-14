import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './PlanDetails.css';

const PlanDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    fetchPlan();
    checkSubscription();
  }, [id, user]);

  const fetchPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await axios.get(`http://localhost:5000/api/plans/${id}`, { headers });
      setPlan(res.data);
      setIsSubscribed(res.data.hasAccess);
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      const res = await axios.get('http://localhost:5000/api/subscriptions/my-subscriptions');
      const subscribed = res.data.some(sub => sub.plan._id === id && sub.status === 'active');
      setIsSubscribed(subscribed);
    } catch (error) {
      // Not subscribed
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!window.confirm(`Subscribe to this plan for $${plan.price}?`)) return;

    try {
      await axios.post(`http://localhost:5000/api/subscriptions/${id}`);
      setIsSubscribed(true);
      fetchPlan();
      alert('Successfully subscribed!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error subscribing to plan');
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!plan) {
    return <div className="container">Plan not found</div>;
  }

  return (
    <div className="plan-details">
      <div className="container">
        <div className="plan-details-card">
          <h1>{plan.title}</h1>
          <p className="trainer-link">
            by <Link to={`/trainers/${plan.trainer?._id || plan.trainer}`}>{plan.trainer?.name || 'Trainer'}</Link>
          </p>
          
          {plan.hasAccess ? (
            <>
              <div className="plan-content">
                <p className="description">{plan.description}</p>
                <div className="plan-info">
                  <div className="info-item">
                    <span className="label">Price:</span>
                    <span className="value">${plan.price}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Duration:</span>
                    <span className="value">{plan.duration} days</span>
                  </div>
                </div>
              </div>
              {!isSubscribed && user && (
                <button onClick={handleSubscribe} className="subscribe-btn">
                  Subscribe for ${plan.price}
                </button>
              )}
              {isSubscribed && (
                <div className="subscribed-badge">You are subscribed to this plan</div>
              )}
            </>
          ) : (
            <>
              <div className="plan-preview">
                <p className="price-preview">${plan.price}</p>
                <p className="preview-message">Subscribe to view full plan details</p>
              </div>
              {user ? (
                <button onClick={handleSubscribe} className="subscribe-btn">
                  Subscribe for ${plan.price}
                </button>
              ) : (
                <Link to="/login" className="subscribe-btn">
                  Login to Subscribe
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanDetails;

