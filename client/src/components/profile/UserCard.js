import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';
import { FaMapMarkerAlt, FaMotorcycle, FaStar } from 'react-icons/fa';
import { getAvatarUrl } from '../../utils/avatar';

const UserCard = ({ user }) => {
  const yearsRiding = user.ridingSince 
    ? new Date().getFullYear() - user.ridingSince 
    : 0;

  return (
    <Card className="user-card h-100 shadow-sm">
      <Card.Body className="text-center">
        <div className="user-avatar-container mb-3">
          <img 
            src={getAvatarUrl(user.avatar)}
            alt={user.name}
            className="user-avatar"
          />
          {user.isVerified && (
            <Badge bg="success" className="verified-badge">✓</Badge>
          )}
        </div>

        <Card.Title as={Link} to={`/profile/${user._id}`} className="user-name">
          {user.name}
        </Card.Title>

        <div className="user-location text-muted mb-2">
          <FaMapMarkerAlt className="me-1" />
          {user.city}, {user.state}
        </div>

        <div className="user-stats d-flex justify-content-center gap-3 mb-3">
          <div className="stat">
            <FaMotorcycle className="text-primary" />
            <span>{yearsRiding}+ yrs</span>
          </div>
          <div className="stat">
            <FaStar className="text-warning" />
            <span>{user.rating?.toFixed(1) || 'New'}</span>
          </div>
        </div>

        {user.ridingStyles && user.ridingStyles.length > 0 && (
          <div className="riding-styles mb-3">
            {user.ridingStyles.slice(0, 3).map((style, index) => (
              <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                {style}
              </Badge>
            ))}
          </div>
        )}

        <Link to={`/profile/${user._id}`} className="btn btn-outline-primary btn-sm w-100">
          View Profile
        </Link>
      </Card.Body>
    </Card>
  );
};

export default UserCard;
