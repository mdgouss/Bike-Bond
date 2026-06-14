import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Tab, Tabs } from 'react-bootstrap';
import { FaMapMarkerAlt, FaMotorcycle, FaEnvelope, FaEdit } from 'react-icons/fa';
import { userAPI } from '../services/api';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const isOwnProfile = user && (user._id === id || user.id === id);

  const fetchProfile = useCallback(async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        userAPI.getUser(id),
        userAPI.getUserStats(id)
      ]);
      setProfile(profileRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return <Loader />;
  if (!profile) return <div className="text-center py-5">User not found</div>;

  const yearsRiding = profile.ridingSince ? new Date().getFullYear() - profile.ridingSince : 0;

  return (
    <div className="profile-page py-5">
      <Container>
        <Row>
          <Col lg={4}>
            <Card className="profile-card shadow-sm mb-4">
              <Card.Body className="text-center">
                <div className="profile-avatar-container mb-3">
                  <img
                    src={getAvatarUrl(profile.avatar)}
                    alt={profile.name}
                    className="profile-avatar rounded-circle"
                    style={{ width: 150, height: 150, objectFit: 'cover' }}
                  />
                  {profile.isVerified && (
                    <Badge bg="success" className="verified-badge">✓ Verified</Badge>
                  )}
                </div>

                <h3>{profile.name}</h3>
                
                <div className="text-muted mb-3">
                  <FaMapMarkerAlt className="me-1" />
                  {profile.city}, {profile.state}
                </div>

                {profile.bio && (
                  <p className="text-muted">{profile.bio}</p>
                )}

                <div className="profile-stats d-flex justify-content-around my-4">
                  <div className="stat text-center">
                    <h4 className="mb-0">{profile.ridesCompleted || 0}</h4>
                    <small className="text-muted">Rides</small>
                  </div>
                  <div className="stat text-center">
                    <h4 className="mb-0">{yearsRiding}+</h4>
                    <small className="text-muted">Years Riding</small>
                  </div>
                  <div className="stat text-center">
                    <h4 className="mb-0">{profile.bikes?.length || 0}</h4>
                    <small className="text-muted">Bikes</small>
                  </div>
                </div>

                {profile.ridingStyles?.length > 0 && (
                  <div className="riding-styles mb-4">
                    {profile.ridingStyles.map((style, i) => (
                      <Badge key={i} bg="primary" className="me-1 mb-1">
                        {style}
                      </Badge>
                    ))}
                  </div>
                )}

                {isOwnProfile ? (
                  <Button as={Link} to="/edit-profile" variant="outline-primary" className="w-100">
                    <FaEdit className="me-2" /> Edit Profile
                  </Button>
                ) : (
                  <Button as={Link} to={`/messages/${profile._id}`} variant="primary" className="w-100">
                    <FaEnvelope className="me-2" /> Send Message
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Tabs defaultActiveKey="garage" className="mb-4">
              <Tab eventKey="garage" title="Garage">
                <Row>
                  {profile.bikes?.length > 0 ? (
                    profile.bikes.map(bike => (
                      <Col md={6} key={bike._id} className="mb-3">
                        <Card className="bike-card h-100">
                          <Card.Body>
                            <div className="d-flex align-items-center">
                              <FaMotorcycle className="text-primary me-3" size={32} />
                              <div>
                                <h6 className="mb-0">
                                  {bike.brand} {bike.model}
                                  {bike.isPrimary && <Badge bg="warning" className="ms-2">Primary</Badge>}
                                </h6>
                                <small className="text-muted">
                                  {bike.year} • {bike.cc}cc
                                </small>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Col className="text-center py-4">
                      <p className="text-muted">No bikes in garage yet</p>
                    </Col>
                  )}
                </Row>
              </Tab>
              <Tab eventKey="rides" title="Rides">
                <Row className="g-3">
                  <Col md={6}>
                    <Card className="h-100">
                      <Card.Body>
                        <h6 className="text-muted mb-2">Completed Rides</h6>
                        <h3 className="mb-0">{stats?.ridesCompleted ?? profile.ridesCompleted ?? 0}</h3>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="h-100">
                      <Card.Body>
                        <h6 className="text-muted mb-2">Total KM Ridden</h6>
                        <h3 className="mb-0">{stats?.totalKmRidden ?? profile.totalKmRidden ?? 0}</h3>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>
              <Tab eventKey="reviews" title="Reviews">
                <Row className="g-3">
                  <Col md={6}>
                    <Card className="h-100">
                      <Card.Body>
                        <h6 className="text-muted mb-2">Average Rating</h6>
                        <h3 className="mb-0">{stats?.rating ?? profile.rating ?? 0}</h3>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="h-100">
                      <Card.Body>
                        <h6 className="text-muted mb-2">Member Since</h6>
                        <h3 className="mb-0">{stats?.memberSince ? new Date(stats.memberSince).getFullYear() : '-'}</h3>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;
