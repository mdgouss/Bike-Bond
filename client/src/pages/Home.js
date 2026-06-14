import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaMotorcycle, FaUsers, FaRoute, FaShieldAlt, FaComments, FaMapMarkedAlt } from 'react-icons/fa';
import { rideAPI } from '../services/api';
import RideCard from '../components/rides/RideCard';

const Home = () => {
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const res = await rideAPI.getRides({ status: 'upcoming', limit: 3 });
        setUpcomingRides(res.data.data);
      } catch (err) {
        console.error('Error fetching rides:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  const features = [
    {
      icon: <FaUsers />,
      title: 'Connect with Riders',
      description: 'Find riding buddies in your city or across India based on your riding style and preferences.'
    },
    {
      icon: <FaRoute />,
      title: 'Plan Group Rides',
      description: 'Create and join group rides, from weekend breakfast runs to epic multi-day tours.'
    },
    {
      icon: <FaMapMarkedAlt />,
      title: 'Live Tracking',
      description: 'Share your location with fellow riders during group rides for safety and coordination.'
    },
    {
      icon: <FaComments />,
      title: 'Community Forum',
      description: 'Discuss routes, gear, maintenance tips, and share your riding experiences.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Verified Riders',
      description: 'Build trust with verified profiles and connect with genuine motorcycle enthusiasts.'
    },
    {
      icon: <FaMotorcycle />,
      title: 'Bike Garage',
      description: 'Showcase your bikes, track modifications, and connect with riders of similar machines.'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <Container className="hero-content">
          <Row className="align-items-center min-vh-100">
            <Col lg={8} className="text-white">
              <h1 className="hero-title">
                India's Premier<br />
                <span className="text-primary">Biking Community</span>
              </h1>
              <p className="hero-subtitle">
                Connect with fellow riders, plan epic rides, and be part of 
                the fastest-growing motorcycle community in India.
              </p>
              <div className="hero-buttons">
                <Button as={Link} to="/register" variant="primary" size="lg" className="me-3">
                  Join Now - It's Free
                </Button>
                <Button as={Link} to="/rides" variant="outline-light" size="lg">
                  Explore Rides
                </Button>
              </div>
              <div className="hero-stats mt-5">
                <div className="stat-item">
                  <span className="stat-number">10,000+</span>
                  <span className="stat-label">Riders</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Rides</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Cities</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">Why Join BikeBond?</h2>
            <p className="section-subtitle text-muted">
              Everything you need to connect, ride, and share your passion
            </p>
          </div>
          <Row>
            {features.map((feature, index) => (
              <Col md={6} lg={4} key={index} className="mb-4">
                <Card className="feature-card h-100 text-center p-4">
                  <div className="feature-icon text-primary mb-3">
                    {feature.icon}
                  </div>
                  <Card.Title>{feature.title}</Card.Title>
                  <Card.Text className="text-muted">{feature.description}</Card.Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Upcoming Rides Section */}
      <section className="upcoming-rides-section py-5 bg-light">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="section-title mb-0">Upcoming Rides</h2>
            <Link to="/rides" className="btn btn-outline-primary">
              View All Rides
            </Link>
          </div>
          <Row>
            {loading ? (
              <Col className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </Col>
            ) : upcomingRides.length > 0 ? (
              upcomingRides.map(ride => (
                <Col md={6} lg={4} key={ride._id} className="mb-4">
                  <RideCard ride={ride} />
                </Col>
              ))
            ) : (
              <Col className="text-center py-5">
                <p className="text-muted">No upcoming rides. Be the first to create one!</p>
                <Link to="/rides/create" className="btn btn-primary">
                  Create a Ride
                </Link>
              </Col>
            )}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <Container className="text-center">
          <h2 className="text-white mb-3">Ready to Hit the Road?</h2>
          <p className="text-white-50 mb-4">
            Join thousands of riders and start your journey today
          </p>
          <Button as={Link} to="/register" variant="light" size="lg">
            Get Started - Free Forever
          </Button>
        </Container>
      </section>
    </div>
  );
};

export default Home;
