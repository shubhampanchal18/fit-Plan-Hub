import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: ''
  });

  useEffect(() => {
    if (user && user.role === 'trainer') {
      fetchMyPlans();
    }
  }, [user]);

  const fetchMyPlans = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/plans');
      const myPlans = res.data.filter(plan => {
        const trainerId = plan.trainer?._id || plan.trainer;
        return trainerId === user.id || trainerId === user._id;
      });
      setPlans(myPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await axios.put(`http://localhost:5000/api/plans/${editingPlan._id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/plans', formData);
      }
      
      setShowForm(false);
      setEditingPlan(null);
      setFormData({ title: '', description: '', price: '', duration: '' });
      fetchMyPlans();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      price: plan.price,
      duration: plan.duration
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/plans/${id}`);
      fetchMyPlans();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting plan');
    }
  };

  if (user?.role !== 'trainer') {
    return <div className="container">Access denied. Trainer only.</div>;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>My Plans</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : 'Create New Plan'}
          </button>
        </div>

        {showForm && (
          <div className="form-card">
            <h2>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="4"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Duration (days)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    min="1"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary">
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>
            </form>
          </div>
        )}

        <div className="plans-list">
          {plans.length === 0 ? (
            <p>No plans created yet. Create your first plan!</p>
          ) : (
            plans.map(plan => (
              <div key={plan._id} className="plan-item">
                <div className="plan-info">
                  <h3>{plan.title}</h3>
                  <p>{plan.description}</p>
                  <div className="plan-meta">
                    <span>${plan.price}</span>
                    <span>{plan.duration} days</span>
                  </div>
                </div>
                <div className="plan-actions">
                  <button onClick={() => handleEdit(plan)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(plan._id)} className="btn-delete">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;

