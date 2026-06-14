import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { marketplaceAPI } from '../services/api';

const CATEGORIES = ['bike', 'helmet', 'jacket', 'gloves', 'boots', 'accessories', 'parts', 'luggage', 'electronics', 'other'];
const CONDITIONS = ['new', 'like-new', 'good', 'fair', 'for-parts'];

const CreateListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'bike',
    description: '',
    price: '',
    condition: 'good',
    brand: '',
    isNegotiable: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await marketplaceAPI.createListing({
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        price: Number(formData.price),
        condition: formData.condition,
        brand: formData.brand.trim() || undefined,
        isNegotiable: formData.isNegotiable
      });
      navigate(`/marketplace/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-listing-page py-5">
      <Container>
        <Card className="shadow-sm">
          <Card.Body className="p-4 p-md-5">
            <h2 className="mb-4">Create Listing</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      maxLength={150}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      maxLength={3000}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Price (INR)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Condition</Form.Label>
                    <Form.Select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                    >
                      {CONDITIONS.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Brand (optional)</Form.Label>
                    <Form.Control
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Check
                    type="checkbox"
                    name="isNegotiable"
                    label="Price is negotiable"
                    checked={formData.isNegotiable}
                    onChange={handleChange}
                  />
                </Col>

                <Col xs={12}>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Publishing...' : 'Publish Listing'}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default CreateListing;
