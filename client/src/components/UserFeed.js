import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Feed.css';

const UserFeed = () => {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFeed();
    }
  }, [user]);

  const fetchFeed = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/feed');
      setFeed(res.data);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="feed">
      <div className="container">
        <h1>My Feed</h1>
        <p className="feed-subtitle">Plans from trainers you follow</p>
        
        {feed.length === 0 ? (
          <div className="empty-feed">
            <p>Your feed is empty. Start following trainers to see their plans!</p>
            <Link to="/" className="browse-link">Browse All Plans</Link>
          </div>
        ) : (
          <div className="feed-grid">
            {feed.map(item => (
              <div key={item._id} className="feed-item">
                <h3>{item.title}</h3>
                <p className="trainer-name">
                  by <Link to={`/trainers/${item.trainer._id}`}>{item.trainer.name}</Link>
                </p>
                {item.hasAccess ? (
                  <>
                    <p className="description">{item.description}</p>
                    <div className="feed-meta">
                      <span>${item.price}</span>
                      <span>{item.duration} days</span>
                    </div>
                    {item.isSubscribed && (
                      <span className="subscribed-tag">Subscribed</span>
                    )}
                  </>
                ) : (
                  <>
                    <p className="price-only">${item.price}</p>
                    <p className="preview-note">Subscribe to view details</p>
                  </>
                )}
                <Link to={`/plans/${item._id}`} className="view-link">
                  View Plan
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFeed;

