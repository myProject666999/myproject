import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from './store/slices/authSlice';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import FlightDetail from './pages/FlightDetail';
import Booking from './pages/Booking';
import UserCenter from './pages/UserCenter';
import Comments from './pages/Comments';
import AdminDashboard from './pages/admin/Dashboard';
import AdminFlights from './pages/admin/Flights';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminComments from './pages/admin/Comments';

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { user, token } = useSelector((state) => state.auth);
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(getProfile());
    }
  }, [token]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<Home />} />
      <Route path="/flights/:id" element={<FlightDetail />} />
      
      <Route
        path="/booking/:flightId"
        element={
          <PrivateRoute>
            <Booking />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/user/*"
        element={
          <PrivateRoute>
            <UserCenter />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/comments"
        element={<Comments />}
      />
      
      <Route
        path="/admin"
        element={
          <PrivateRoute requireAdmin>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/flights"
        element={
          <PrivateRoute requireAdmin>
            <AdminFlights />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <PrivateRoute requireAdmin>
            <AdminOrders />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute requireAdmin>
            <AdminUsers />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/comments"
        element={
          <PrivateRoute requireAdmin>
            <AdminComments />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
