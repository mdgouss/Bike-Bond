import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import Loader from '../components/common/Loader';
import { bikeAPI } from '../services/api';

const BIKE_BRANDS = ['Royal Enfield', 'Bajaj', 'TVS', 'Hero', 'Honda', 'Yamaha', 'Suzuki', 'KTM', 'BMW', 'Kawasaki', 'Ducati', 'Harley-Davidson', 'Triumph', 'Jawa', 'Benelli', 'Aprilia', 'Other'];

const Garage = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    brand: 'Royal Enfield',
    model: '',
    year: '',
    cc: '',
    color: '',
    nickname: ''
  });

  const loadBikes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bikeAPI.getMyBikes();
      setBikes(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bikes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBikes();
  }, [loadBikes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddBike = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await bikeAPI.addBike({
        brand: formData.brand,
        model: formData.model.trim(),
        year: Number(formData.year),
        cc: Number(formData.cc),
        color: formData.color.trim() || undefined,
        nickname: formData.nickname.trim() || undefined
      });
      setFormData({
        brand: 'Royal Enfield',
        model: '',
        year: '',
        cc: '',
        color: '',
        nickname: ''
      });
      await loadBikes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add bike.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBike = async (bikeId) => {
    try {
      await bikeAPI.deleteBike(bikeId);
      await loadBikes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete bike.');
    }
  };

  const handleSetPrimary = async (bikeId) => {
    try {
      await bikeAPI.setPrimary(bikeId);
      await loadBikes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set primary bike.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="garage-page py-5">
      <Container>
        {error && <Alert variant="danger">{error}</Alert>}
        <Row className="g-4">
          <Col lg={5}>
            <Card className="shadow-sm">
              <Card.Body>
                <h4 className="mb-3">Add Bike</h4>
                <Form onSubmit={handleAddBike}>
                  <Row className="g-2">
                    <Col xs={12}>
                      <Form.Select name="brand" value={formData.brand} onChange={handleChange}>
                        {BIKE_BRANDS.map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col xs={12}>
                      <Form.Control
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        placeholder="Model"
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Control
                        type="number"
                        min="1950"
                        max={new Date().getFullYear() + 1}
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        placeholder="Year"
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Control
                        type="number"
                        min="50"
                        name="cc"
                        value={formData.cc}
                        onChange={handleChange}
                        placeholder="CC"
                        required
                      />
                    </Col>
                    <Col xs={12}>
                      <Form.Control
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="Color (optional)"
                      />
                    </Col>
                    <Col xs={12}>
                      <Form.Control
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleChange}
                        placeholder="Nickname (optional)"
                      />
                    </Col>
                    <Col xs={12}>
                      <Button type="submit" disabled={saving}>
                        {saving ? 'Adding...' : 'Add to Garage'}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={7}>
            <Card className="shadow-sm">
              <Card.Body>
                <h4 className="mb-3">My Bikes</h4>
                {bikes.length ? (
                  bikes.map(bike => (
                    <div key={bike._id} className="border rounded p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold">
                            {bike.brand} {bike.model}{' '}
                            {bike.isPrimary && <Badge bg="warning" text="dark">Primary</Badge>}
                          </div>
                          <div className="small text-muted">
                            {bike.year} • {bike.cc}cc {bike.color ? `• ${bike.color}` : ''}
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          {!bike.isPrimary && (
                            <Button size="sm" variant="outline-primary" onClick={() => handleSetPrimary(bike._id)}>
                              Set Primary
                            </Button>
                          )}
                          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteBike(bike._id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted mb-0">No bikes added yet.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Garage;
