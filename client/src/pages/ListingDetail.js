import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { formatDistanceToNow } from 'date-fns';
import { FaMapMarkerAlt, FaRupeeSign } from 'react-icons/fa';
import Loader from '../components/common/Loader';
import { marketplaceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';

const ListingDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadListing = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await marketplaceAPI.getListing(id);
      setListing(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load listing.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  const isOwner = !!(user && listing && listing.seller?._id === user._id);
  const isSaved = !!(user && listing?.savedBy?.includes(user._id));

  const handleSave = async () => {
    if (!isAuthenticated) return;
    setActionLoading(true);
    try {
      await marketplaceAPI.toggleSave(id);
      await loadListing();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save listing.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkSold = async () => {
    setActionLoading(true);
    try {
      await marketplaceAPI.markAsSold(id);
      await loadListing();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark listing as sold.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="listing-detail-page py-5">
      <Container>
        {error && <Alert variant="danger">{error}</Alert>}
        {!listing ? (
          <Card className="shadow-sm">
            <Card.Body className="text-center py-5">
              <h2>Listing not found</h2>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            <Col lg={8}>
              <Card className="shadow-sm">
                {listing.photos?.[0] && (
                  <Card.Img
                    variant="top"
                    src={`/uploads/listings/${listing.photos[0]}`}
                    style={{ maxHeight: 380, objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h2 className="mb-0">{listing.title}</h2>
                    <Badge bg={listing.status === 'active' ? 'success' : 'secondary'}>
                      {listing.status}
                    </Badge>
                  </div>
                  <div className="h4 text-success mb-3">
                    <FaRupeeSign className="me-1" />
                    {new Intl.NumberFormat('en-IN').format(listing.price)}
                    {listing.isNegotiable ? ' (Negotiable)' : ''}
                  </div>
                  <p style={{ whiteSpace: 'pre-line' }}>{listing.description}</p>

                  <div className="text-muted mt-3">
                    <div className="mb-1">Category: {listing.category}</div>
                    <div className="mb-1">Condition: {listing.condition}</div>
                    <div className="mb-1">Brand: {listing.brand || 'N/A'}</div>
                    <div>
                      <FaMapMarkerAlt className="me-1" />
                      {listing.location?.city}, {listing.location?.state}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="shadow-sm mb-3">
                <Card.Body>
                  <h5>Seller</h5>
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={getAvatarUrl(listing.seller?.avatar)}
                      alt={listing.seller?.name}
                      className="rounded-circle me-2"
                      style={{ width: 42, height: 42, objectFit: 'cover' }}
                    />
                    <div>
                      <Link to={`/profile/${listing.seller?._id}`}>{listing.seller?.name}</Link>
                      <div className="small text-muted">
                        Posted {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>

                  {isAuthenticated && !isOwner && (
                    <>
                      {listing.status === 'active' && listing.seller?._id && (
                        <Button
                          as={Link}
                          to={`/messages/${listing.seller._id}`}
                          className="w-100 mb-2"
                        >
                          Buy / Contact Seller
                        </Button>
                      )}
                      <Button
                        variant={isSaved ? 'primary' : 'outline-primary'}
                        className="w-100"
                        onClick={handleSave}
                        disabled={actionLoading}
                      >
                        {isSaved ? 'Saved' : 'Save Listing'}
                      </Button>
                    </>
                  )}

                  {isOwner && listing.status === 'active' && (
                    <Button
                      variant="outline-danger"
                      className="w-100"
                      onClick={handleMarkSold}
                      disabled={actionLoading}
                    >
                      Mark as Sold
                    </Button>
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

export default ListingDetail;
