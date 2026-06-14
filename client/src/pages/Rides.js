import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { rideAPI } from '../services/api';
import RideCard from '../components/rides/RideCard';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

const Rides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'upcoming',
    difficulty: '',
    rideType: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { isAuthenticated } = useAuth();

  const fetchRides = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 9 };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      
      const res = await rideAPI.getRides(params);
      setRides(res.data.data);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error('Error fetching rides:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRides();
  };

  return (
    <div className="rides-page py-5">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-1">Discover Rides</h1>
            <p className="text-muted mb-0">Find your next adventure</p>
          </div>
          {isAuthenticated && (
            <Button as={Link} to="/rides/create" variant="primary">
              <FaPlus className="me-2" /> Create Ride
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="filters-section bg-light p-4 rounded mb-4">
          <Row className="g-3">
            <Col md={4}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search rides..."
                  />
                  <Button type="submit" variant="primary">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={2}>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
              >
                <option value="">All Difficulty</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
                <option value="extreme">Extreme</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                name="rideType"
                value={filters.rideType}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="day-ride">Day Ride</option>
                <option value="weekend">Weekend</option>
                <option value="multi-day">Multi-Day</option>
                <option value="breakfast-ride">Breakfast Ride</option>
                <option value="night-ride">Night Ride</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={() => setFilters({ status: 'upcoming', difficulty: '', rideType: '', search: '' })}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </div>

        {/* Rides Grid */}
        {loading ? (
          <Loader />
        ) : rides.length > 0 ? (
          <>
            <Row>
              {rides.map(ride => (
                <Col md={6} lg={4} key={ride._id} className="mb-4">
                  <RideCard ride={ride} />
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
            <h4 className="text-muted">No rides found</h4>
            <p className="text-muted">Try adjusting your filters or create a new ride!</p>
            {isAuthenticated && (
              <Button as={Link} to="/rides/create" variant="primary">
                Create a Ride
              </Button>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};

export default Rides;
