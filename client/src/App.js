import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Rides from './pages/Rides';
import RideDetail from './pages/RideDetail';
import CreateRide from './pages/CreateRide';
import Forum from './pages/Forum';
import ForumPost from './pages/ForumPost';
import CreatePost from './pages/CreatePost';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import Members from './pages/Members';
import Messages from './pages/Messages';
import Garage from './pages/Garage';
import NotFound from './pages/NotFound';

// Protected Route
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/members" element={<Members />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/rides" element={<Rides />} />
          <Route path="/rides/:id" element={<RideDetail />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/post/:id" element={<ForumPost />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ListingDetail />} />

          {/* Protected Routes */}
          <Route path="/edit-profile" element={
            <PrivateRoute><EditProfile /></PrivateRoute>
          } />
          <Route path="/garage" element={
            <PrivateRoute><Garage /></PrivateRoute>
          } />
          <Route path="/rides/create" element={
            <PrivateRoute><CreateRide /></PrivateRoute>
          } />
          <Route path="/forum/create" element={
            <PrivateRoute><CreatePost /></PrivateRoute>
          } />
          <Route path="/marketplace/create" element={
            <PrivateRoute><CreateListing /></PrivateRoute>
          } />
          <Route path="/messages" element={
            <PrivateRoute><Messages /></PrivateRoute>
          } />
          <Route path="/messages/:id" element={
            <PrivateRoute><Messages /></PrivateRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
