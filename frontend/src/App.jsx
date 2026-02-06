import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages - Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Pages - User
import Profile from './pages/user/Profile';
import MyTickets from './pages/user/MyTickets';
import OrderConfirmation from './pages/user/OrderConfirmation';
import Notifications from './pages/user/Notifications';

// Pages - Public
import Home from './pages/public/Home';
import Explore from './pages/public/Explore';
import EventDetails from './pages/public/EventDetails';

// Pages - Organizer
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import CheckIn from './pages/organizer/CheckIn';
import EventAnalytics from './pages/organizer/EventAnalytics';

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="events/:id" element={<EventDetails />} />
        
        {/* Auth Routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes - User */}
        <Route path="profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="my-tickets" element={
          <ProtectedRoute>
            <MyTickets />
          </ProtectedRoute>
        } />
        <Route path="order-confirmation" element={
          <ProtectedRoute>
            <OrderConfirmation />
          </ProtectedRoute>
        } />
        <Route path="notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />

        {/* Protected Routes - Organizer */}
        <Route path="organizer">
          <Route path="dashboard" element={
            <ProtectedRoute roles={['organizer', 'admin']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          } />
          <Route path="events/new" element={
            <ProtectedRoute roles={['organizer', 'admin']}>
              <CreateEvent />
            </ProtectedRoute>
          } />
          <Route path="events/edit/:id" element={
            <ProtectedRoute roles={['organizer', 'admin']}>
              <EditEvent />
            </ProtectedRoute>
          } />
          <Route path="check-in/:id" element={
            <ProtectedRoute roles={['organizer', 'admin']}>
              <CheckIn />
            </ProtectedRoute>
          } />
          <Route path="analytics/:id" element={
            <ProtectedRoute roles={['organizer', 'admin']}>
              <EventAnalytics />
            </ProtectedRoute>
          } />
        </Route>

        {/* Protected Routes - Admin */}
        <Route path="admin/dashboard" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

export default App;
