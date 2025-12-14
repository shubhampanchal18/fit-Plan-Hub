import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/Login';
import Signup from './components/Signup';
import TrainerDashboard from './components/TrainerDashboard';
import PlanDetails from './components/PlanDetails';
import UserFeed from './components/UserFeed';
import TrainerProfile from './components/TrainerProfile';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <TrainerDashboard />
                </PrivateRoute>
              } 
            />
            <Route path="/plans/:id" element={<PlanDetails />} />
            <Route 
              path="/feed" 
              element={
                <PrivateRoute>
                  <UserFeed />
                </PrivateRoute>
              } 
            />
            <Route path="/trainers/:id" element={<TrainerProfile />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

