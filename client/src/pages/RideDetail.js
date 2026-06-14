import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { format } from 'date-fns';
import { FaCalendarAlt, FaMapMarkerAlt, FaRoad, FaUsers } from 'react-icons/fa';
import Loader from '../components/common/Loader';
import { rideAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';

const RideDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [ending, setEnding] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadRide = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await rideAPI.getRide(id);
      setRide(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ride details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRide();
  }, [loadRide]);

  const participantIds = useMemo(
    () => (ride?.participants || []).map(p => p.user?._id),
    [ride]
  );
  const isOrganizer = !!(user && ride && ride.organizer?._id === user._id);
  const isParticipant = !!(user && participantIds.includes(user._id));
  const canJoin = isAuthenticated && ride?.status === 'upcoming' && !isParticipant && !isOrganizer;
  const canLeave = isAuthenticated && ride?.status === 'upcoming' && isParticipant && !isOrganizer;
  const canEndRide = isOrganizer && ['upcoming', 'ongoing'].includes(ride?.status);
  const canReview = isAuthenticated && ride?.status === 'completed' && isParticipant;

  const handleJoin = async () => {
    setJoining(true);
    setError('');
    try {
      await rideAPI.joinRide(id, {});
      await loadRide();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join ride.');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    setError('');
    try {
      await rideAPI.leaveRide(id);
      await loadRide();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave ride.');
    } finally {
      setLeaving(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setError('');
    try {
      await rideAPI.addReview(id, {
        rating: Number(reviewData.rating),
        comment: reviewData.comment.trim()
      });
      setReviewData({ rating: 5, comment: '' });
      await loadRide();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleEndRide = async () => {
    if (!window.confirm('Mark this ride as completed?')) return;
    setEnding(true);
    setError('');
    try {
      await rideAPI.endRide(id, { endDate: new Date().toISOString() });
      await loadRide();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to end ride.');
    } finally {
      setEnding(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="ride-detail-page py-5">
      <Container>
        {error && <Alert variant="danger">{error}</Alert>}
        {!ride ? (
          <Card className="shadow-sm">
            <Card.Body className="text-center py-5">
              <h2>Ride not found</h2>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            <Col lg={8}>
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h2 className="mb-2">{ride.title}</h2>
                      <div className="text-muted">
                        Organized by{' '}
                        <Link to={`/profile/${ride.organizer?._id}`}>
                          {ride.organizer?.name}
                        </Link>
                      </div>
                    </div>
                    <Badge bg={ride.status === 'upcoming' ? 'success' : 'secondary'}>
                      {ride.status}
                    </Badge>
                  </div>

                  <p className="mb-4">{ride.description}</p>

                  <Row className="g-3 text-muted">
                    <Col md={6}>
                      <FaMapMarkerAlt className="me-2" />
                      {ride.startLocation?.name} to {ride.endLocation?.name}
                    </Col>
                    <Col md={6}>
                      <FaCalendarAlt className="me-2" />
                      {ride.startDate ? format(new Date(ride.startDate), 'PPP p') : '-'}
                    </Col>
                    <Col md={6}>
                      <FaRoad className="me-2" />
                      {ride.distance} km
                    </Col>
                    <Col md={6}>
                      <FaUsers className="me-2" />
                      {ride.participantsCount || 0}/{ride.maxRiders} riders
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="shadow-sm mb-4">
                <Card.Header><strong>Participants</strong></Card.Header>
                <Card.Body>
                  {ride.participants?.length ? (
                    <div className="d-flex flex-wrap gap-3">
                      {ride.participants.map(participant => (
                        <div key={participant._id} className="d-flex align-items-center">
                          <img
                            src={getAvatarUrl(participant.user?.avatar)}
                            alt={participant.user?.name}
                            className="rounded-circle me-2"
                            style={{ width: 36, height: 36, objectFit: 'cover' }}
                          />
                          <div>
                            <div className="small fw-semibold">{participant.user?.name}</div>
                            <div className="small text-muted">{participant.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No participants yet.</p>
                  )}
                </Card.Body>
              </Card>

              <Card className="shadow-sm">
                <Card.Header><strong>Reviews</strong></Card.Header>
                <Card.Body>
                  {ride.reviews?.length ? (
                    ride.reviews.map(review => (
                      <div key={review._id} className="mb-3 pb-3 border-bottom">
                        <div className="d-flex justify-content-between">
                          <strong>{review.user?.name}</strong>
                          <Badge bg="warning" text="dark">{review.rating}/5</Badge>
                        </div>
                        {review.comment && <p className="mb-0 mt-2">{review.comment}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted mb-0">No reviews yet.</p>
                  )}

                  {canReview && (
                    <Form onSubmit={handleReviewSubmit} className="mt-4">
                      <Row className="g-2">
                        <Col md={3}>
                          <Form.Select
                            value={reviewData.rating}
                            onChange={(e) => setReviewData(prev => ({ ...prev, rating: e.target.value }))}
                          >
                            {[5, 4, 3, 2, 1].map(v => (
                              <option key={v} value={v}>{v} stars</option>
                            ))}
                          </Form.Select>
                        </Col>
                        <Col md={9}>
                          <Form.Control
                            value={reviewData.comment}
                            onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                            placeholder="Share your experience"
                          />
                        </Col>
                        <Col xs={12}>
                          <Button type="submit" disabled={reviewLoading}>
                            {reviewLoading ? 'Submitting...' : 'Submit Review'}
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Ride Info</h5>
                  <div className="mb-2"><strong>Status:</strong> {ride.status || '-'}</div>
                  <div className="mb-2"><strong>Type:</strong> {ride.rideType || '-'}</div>
                  <div className="mb-2"><strong>Difficulty:</strong> {ride.difficulty || '-'}</div>
                  <div className="mb-2"><strong>Meeting Time:</strong> {ride.meetingTime || '-'}</div>
                  <div className="mb-2"><strong>Start Date:</strong> {ride.startDate ? format(new Date(ride.startDate), 'PPP p') : '-'}</div>
                  <div className="mb-2"><strong>End Date:</strong> {ride.endDate ? format(new Date(ride.endDate), 'PPP p') : '-'}</div>
                  <div className="mb-2"><strong>Privacy:</strong> {ride.isPrivate ? 'Private' : 'Public'}</div>
                  <div className="mb-2"><strong>Min CC:</strong> {ride.minCC || 0}</div>
                  {ride.estimatedBudget ? (
                    <div className="mb-3"><strong>Budget:</strong> INR {ride.estimatedBudget}</div>
                  ) : null}
                  {ride.terrain?.length ? (
                    <div className="mb-3">
                      {ride.terrain.map(item => (
                        <Badge key={item} bg="light" text="dark" className="me-1 mb-1">{item}</Badge>
                      ))}
                    </div>
                  ) : null}
                  {ride.requirements?.length ? (
                    <div className="mb-3">
                      <strong>Requirements:</strong>
                      <ul className="mb-0 mt-1">
                        {ride.requirements.map((item, idx) => (
                          <li key={`${item}-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {ride.tags?.length ? (
                    <div className="mb-3">
                      {ride.tags.map(item => (
                        <Badge key={item} bg="secondary" className="me-1 mb-1">{item}</Badge>
                      ))}
                    </div>
                  ) : null}

                  {canEndRide && (
                    <Button variant="danger" className="w-100 mb-2" onClick={handleEndRide} disabled={ending}>
                      {ending ? 'Ending Ride...' : 'End Ride'}
                    </Button>
                  )}

                  {canJoin && (
                    <Button className="w-100" onClick={handleJoin} disabled={joining}>
                      {joining ? 'Joining...' : 'Join Ride'}
                    </Button>
                  )}
                  {canLeave && (
                    <Button variant="outline-danger" className="w-100" onClick={handleLeave} disabled={leaving}>
                      {leaving ? 'Leaving...' : 'Leave Ride'}
                    </Button>
                  )}
                  {!isAuthenticated && (
                    <Button as={Link} to="/login" className="w-100">Login to Join</Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default RideDetail;
