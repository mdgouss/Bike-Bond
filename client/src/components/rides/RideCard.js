import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaRoute } from 'react-icons/fa';
import { format } from 'date-fns';
import { getAvatarUrl } from '../../utils/avatar';

const RideCard = ({ ride }) => {
  const participantsCount = typeof ride.participantsCount === 'number'
    ? ride.participantsCount
    : 0;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'moderate': return 'warning';
      case 'challenging': return 'danger';
      case 'extreme': return 'dark';
      default: return 'secondary';
    }
  };

  return (
    <Card className="ride-card h-100 shadow-sm">
      <div className="ride-card-image">
        <img 
          src={ride.coverImage ? `/uploads/rides/${ride.coverImage}` : '/ride-placeholder.jpg'} 
          alt={ride.title}
          className="card-img-top"
        />
        <Badge 
          bg={getDifficultyColor(ride.difficulty)} 
          className="difficulty-badge"
        >
          {ride.difficulty}
        </Badge>
      </div>
      
      <Card.Body>
        <Card.Title as={Link} to={`/rides/${ride._id}`} className="ride-title">
          {ride.title}
        </Card.Title>
        
        <div className="ride-meta">
          <div className="meta-item">
            <FaMapMarkerAlt className="icon" />
            <span>{ride.startLocation?.name}</span>
          </div>
          <div className="meta-item">
            <FaCalendarAlt className="icon" />
            <span>{format(new Date(ride.startDate), 'dd MMM yyyy')}</span>
          </div>
          <div className="meta-item">
            <FaRoute className="icon" />
            <span>{ride.distance} km</span>
          </div>
          <div className="meta-item">
            <FaUsers className="icon" />
            <span>{participantsCount}/{ride.maxRiders} riders</span>
          </div>
        </div>

        <div className="ride-organizer mt-3">
          <img 
            src={getAvatarUrl(ride.organizer?.avatar)}
            alt={ride.organizer?.name}
            className="organizer-avatar"
          />
          <span className="organizer-name">
            {ride.organizer?.name}
            {ride.organizer?.isVerified && <Badge bg="success" className="ms-1">✓</Badge>}
          </span>
        </div>
      </Card.Body>

      <Card.Footer className="bg-white border-top-0">
        <Link to={`/rides/${ride._id}`} className="btn btn-primary btn-sm w-100">
          View Details
        </Link>
      </Card.Footer>
    </Card>
  );
};

export default RideCard;
