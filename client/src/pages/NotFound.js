import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { FaMotorcycle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="not-found-page min-vh-100 d-flex align-items-center">
      <Container className="text-center">
        <FaMotorcycle className="text-primary mb-4" size={80} />
        <h1 className="display-1 fw-bold">404</h1>
        <h2 className="mb-4">Road Not Found</h2>
        <p className="text-muted mb-4">
          Looks like you've taken a wrong turn. The page you're looking for doesn't exist.
        </p>
        <Button as={Link} to="/" variant="primary" size="lg">
          Back to Home
        </Button>
      </Container>
    </div>
  );
};

export default NotFound;
