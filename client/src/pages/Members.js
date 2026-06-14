import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { userAPI } from '../services/api';
import UserCard from '../components/profile/UserCard';
import Loader from '../components/common/Loader';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const RIDING_STYLES = ['touring', 'off-road', 'sports', 'cruiser', 'commuter', 'adventure'];

const Members = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    state: '',
    ridingStyle: '',
    isVerified: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 12 };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      
      const res = await userAPI.getUsers(params);
      setUsers(res.data.data);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  return (
    <div className="members-page py-5">
      <Container>
        {/* Header */}
        <div className="text-center mb-5">
          <h1>Find Riding Buddies</h1>
          <p className="text-muted">Connect with fellow riders across India</p>
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
                  placeholder="Search by name or city..."
                />
                <Button variant="primary">
                  <FaSearch />
                </Button>
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                name="state"
                value={filters.state}
                onChange={handleFilterChange}
              >
                <option value="">All States</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                name="ridingStyle"
                value={filters.ridingStyle}
                onChange={handleFilterChange}
              >
                <option value="">All Riding Styles</option>
                {RIDING_STYLES.map(style => (
                  <option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                name="isVerified"
                value={filters.isVerified}
                onChange={handleFilterChange}
              >
                <option value="">All Members</option>
                <option value="true">Verified Only</option>
              </Form.Select>
            </Col>
          </Row>
        </div>

        {/* Members Grid */}
        {loading ? (
          <Loader />
        ) : users.length > 0 ? (
          <>
            <Row>
              {users.map(user => (
                <Col sm={6} md={4} lg={3} key={user._id} className="mb-4">
                  <UserCard user={user} />
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
            <h4 className="text-muted">No members found</h4>
            <p className="text-muted">Try adjusting your filters</p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Members;
