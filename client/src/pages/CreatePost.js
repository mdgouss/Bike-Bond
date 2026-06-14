import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { forumAPI } from '../services/api';

const CreatePost = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    content: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await forumAPI.getCategories();
        setCategories(res.data.data);
      } catch (err) {
        // Keep fallback category.
      }
    };
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
      const res = await forumAPI.createPost({
        title: formData.title.trim(),
        category: formData.category,
        content: formData.content.trim(),
        tags
      });
      navigate(`/forum/post/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create discussion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page py-5">
      <Container>
        <Card className="shadow-sm">
          <Card.Body className="p-4 p-md-5">
            <h2 className="mb-4">Create Discussion</h2>
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
                      maxLength={200}
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
                      {(categories.length ? categories : [{ id: 'general', name: 'General Discussion' }]).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Content</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={8}
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      maxLength={10000}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Tags (comma separated)</Form.Label>
                    <Form.Control
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Posting...' : 'Publish Discussion'}
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

export default CreatePost;
