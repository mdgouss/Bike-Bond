import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, InputGroup, Badge } from 'react-bootstrap';
import { FaSearch, FaPlus, FaMapMarkerAlt, FaRupeeSign } from 'react-icons/fa';
import { marketplaceAPI } from '../services/api';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = [
  { id: 'bike', name: 'Bikes', icon: '🏍️' },
  { id: 'helmet', name: 'Helmets', icon: '⛑️' },
  { id: 'jacket', name: 'Jackets', icon: '🧥' },
  { id: 'gloves', name: 'Gloves', icon: '🧤' },
  { id: 'boots', name: 'Boots', icon: '👢' },
  { id: 'accessories', name: 'Accessories', icon: '🔧' },
  { id: 'parts', name: 'Parts', icon: '⚙️' },
  { id: 'luggage', name: 'Luggage', icon: '🎒' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'other', name: 'Other', icon: '📦' }
];

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sortBy: 'latest'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { isAuthenticated } = useAuth();

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 12 };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      
      const res = await marketplaceAPI.getListings(params);
      setListings(res.data.data);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  return (
    <div className="marketplace-page py-5">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-1">Marketplace</h1>
            <p className="text-muted mb-0">Buy and sell bikes & gear</p>
          </div>
          {isAuthenticated && (
            <Button as={Link} to="/marketplace/create" variant="primary">
              <FaPlus className="me-2" /> Post Listing
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="filters-section bg-light p-4 rounded mb-4">
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <Form.Control
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search listings..."
                />
                <Button variant="primary">
                  <FaSearch />
                </Button>
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="latest">Latest First</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="popular">Most Viewed</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={() => setFilters({ category: '', search: '', sortBy: 'latest' })}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <Loader />
        ) : listings.length > 0 ? (
          <>
            <Row>
              {listings.map(listing => (
                <Col sm={6} md={4} lg={3} key={listing._id} className="mb-4">
                    <Card className="listing-card h-100 shadow-sm">
                    <div className="listing-image">
                      <img
                        src={listing.photos?.[0] ? `/uploads/listings/${listing.photos[0]}` : '/placeholder.jpg'}
                        alt={listing.title}
                        className="card-img-top"
                      />
                      <Badge 
                        bg={listing.condition === 'new' ? 'success' : 'secondary'}
                        className="condition-badge"
                      >
                        {listing.condition}
                      </Badge>
                    </div>
                    <Card.Body>
                      <Link to={`/marketplace/${listing._id}`} className="text-decoration-none">
                        <Card.Title className="listing-title text-dark">
                          {listing.title}
                        </Card.Title>
                      </Link>
                      <div className="listing-price mb-2">
                        <FaRupeeSign className="text-success" />
                        <span className="h5 mb-0 text-success fw-bold">
                          {formatPrice(listing.price)}
                        </span>
                        {listing.isNegotiable && (
                          <small className="text-muted ms-1">(Negotiable)</small>
                        )}
                      </div>
                      <div className="listing-location text-muted small mb-2">
                        <FaMapMarkerAlt className="me-1" />
                        {listing.location?.city}, {listing.location?.state}
                      </div>
                      <div className="listing-meta text-muted small">
                        Posted {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                      </div>
                      <div className="mt-3 d-grid gap-2">
                        <Button as={Link} to={`/marketplace/${listing._id}`} variant="outline-primary" size="sm">
                          View Details
                        </Button>
                        {isAuthenticated && listing.seller?._id && (
                          <Button as={Link} to={`/messages/${listing.seller._id}`} variant="primary" size="sm">
                            Buy / Contact Seller
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Button
                  variant="outline-primary"
                  className="me-2"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="align-self-center mx-3">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline-primary"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-5">
            <h4 className="text-muted">No listings found</h4>
            <p className="text-muted">Be the first to list something!</p>
            {isAuthenticated && (
              <Button as={Link} to="/marketplace/create" variant="primary">
                Post Listing
              </Button>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};

export default Marketplace;
