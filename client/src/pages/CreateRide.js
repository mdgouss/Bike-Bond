import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { rideAPI } from '../services/api';

const RIDE_TYPES = [
  { value: 'day-ride', label: 'Day Ride' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'multi-day', label: 'Multi-Day' },
  { value: 'breakfast-ride', label: 'Breakfast Ride' },
  { value: 'night-ride', label: 'Night Ride' }
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'challenging', label: 'Challenging' },
  { value: 'extreme', label: 'Extreme' }
];

const TERRAIN_OPTIONS = ['highway', 'city', 'mountain', 'off-road', 'coastal', 'desert'];

const CreateRide = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rideType: 'day-ride',
    startLocationName: '',
    endLocationName: '',
    distance: '',
    startDate: '',
    meetingTime: '',
    maxRiders: 20,
    difficulty: 'moderate',
    minCC: 0,
    estimatedBudget: '',
    isPrivate: false,
    requirements: '',
    terrain: []
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTerrainChange = (terrainValue) => {
    setFormData(prev => {
      const exists = prev.terrain.includes(terrainValue);
      return {
        ...prev,
        terrain: exists
          ? prev.terrain.filter(t => t !== terrainValue)
          : [...prev.terrain, terrainValue]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        rideType: formData.rideType,
        startLocation: { name: formData.startLocationName.trim() },
        endLocation: { name: formData.endLocationName.trim() },
        distance: Number(formData.distance),
        startDate: formData.startDate,
        meetingTime: formData.meetingTime,
        maxRiders: Number(formData.maxRiders),
        difficulty: formData.difficulty,
        minCC: Number(formData.minCC),
        isPrivate: formData.isPrivate
      };

      if (formData.terrain.length > 0) {
        payload.terrain = formData.terrain;
      }

      const requirements = formData.requirements
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean);
      if (requirements.length > 0) {
        payload.requirements = requirements;
      }

      if (formData.estimatedBudget !== '') {
        payload.estimatedBudget = Number(formData.estimatedBudget);
      }

      const res = await rideAPI.createRide(payload);
      navigate(`/rides/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create ride. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-ride-page py-5">
      <Container>
        <Card className="shadow-sm">
          <Card.Body className="p-4 p-md-5">
            <h2 className="mb-4">Create a Ride</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>Ride Title</Form.Label>
                    <Form.Control
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Example: Sunrise Ride to Nandi Hills"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Ride Type</Form.Label>
                    <Form.Select
                      name="rideType"
                      value={formData.rideType}
                      onChange={handleChange}
                    >
                      {RIDE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Plan, pace, stops, and expectations for riders..."
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Start Location</Form.Label>
                    <Form.Control
                      name="startLocationName"
                      value={formData.startLocationName}
                      onChange={handleChange}
                      placeholder="City / landmark"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>End Location</Form.Label>
                    <Form.Control
                      name="endLocationName"
                      value={formData.endLocationName}
                      onChange={handleChange}
                      placeholder="Destination city / landmark"
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Distance (km)</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      name="distance"
                      value={formData.distance}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Start Date & Time</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Meeting Time</Form.Label>
                    <Form.Control
                      type="time"
                      name="meetingTime"
                      value={formData.meetingTime}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Difficulty</Form.Label>
                    <Form.Select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                    >
                      {DIFFICULTIES.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Max Riders</Form.Label>
                    <Form.Control
                      type="number"
                      min="2"
                      max="100"
                      name="maxRiders"
                      value={formData.maxRiders}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Minimum CC</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name="minCC"
                      value={formData.minCC}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Budget (INR)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name="estimatedBudget"
                      value={formData.estimatedBudget}
                      onChange={handleChange}
                      placeholder="Optional"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Label className="mb-2">Terrain</Form.Label>
                  <div className="d-flex flex-wrap gap-3">
                    {TERRAIN_OPTIONS.map(option => (
                      <Form.Check
                        key={option}
                        type="checkbox"
                        id={`terrain-${option}`}
                        label={option}
                        checked={formData.terrain.includes(option)}
                        onChange={() => handleTerrainChange(option)}
                      />
                    ))}
                  </div>
                </Col>

                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Requirements (one per line)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleChange}
                      placeholder="Helmet mandatory&#10;Valid driving license"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Check
                    type="checkbox"
                    name="isPrivate"
                    label="Private ride (hidden from public ride list)"
                    checked={formData.isPrivate}
                    onChange={handleChange}
                  />
                </Col>

                <Col xs={12} className="pt-2">
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? 'Creating Ride...' : 'Create Ride'}
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

export default CreateRide;
