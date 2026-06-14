import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Form, Button, ListGroup } from 'react-bootstrap';
import { FaPlus, FaEye, FaComment, FaThumbsUp } from 'react-icons/fa';
import { forumAPI } from '../services/api';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { getAvatarUrl } from '../utils/avatar';

const Forum = () => {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const { isAuthenticated } = useAuth();

  const fetchCategories = useCallback(async () => {
    try {
      const res = await forumAPI.getCategories();
      setCategories(res.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sortBy, limit: 20 };
      if (selectedCategory) params.category = selectedCategory;
      
      const res = await forumAPI.getPosts(params);
      setPosts(res.data.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="forum-page py-5">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-1">Community Forum</h1>
            <p className="text-muted mb-0">Discuss, share, and learn from fellow riders</p>
          </div>
          {isAuthenticated && (
            <Button as={Link} to="/forum/create" variant="primary">
              <FaPlus className="me-2" /> New Discussion
            </Button>
          )}
        </div>

        <Row>
          {/* Categories Sidebar */}
          <Col lg={3} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <strong>Categories</strong>
              </Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item
                  action
                  active={selectedCategory === ''}
                  onClick={() => setSelectedCategory('')}
                >
                  All Discussions
                </ListGroup.Item>
                {categories.map(cat => (
                  <ListGroup.Item
                    key={cat.id}
                    action
                    active={selectedCategory === cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>
                      <span className="me-2">{cat.icon}</span>
                      {cat.name}
                    </span>
                    <Badge bg="secondary">{cat.postCount}</Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>

          {/* Posts */}
          <Col lg={9}>
            {/* Sort Options */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted">
                {posts.length} discussions
              </span>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="latest">Latest</option>
                <option value="popular">Most Viewed</option>
                <option value="mostLiked">Most Liked</option>
              </Form.Select>
            </div>

            {/* Posts List */}
            {loading ? (
              <Loader />
            ) : posts.length > 0 ? (
              <div className="posts-list">
                {posts.map(post => (
                  <Card key={post._id} className="mb-3 shadow-sm post-card">
                    <Card.Body>
                      <div className="d-flex">
                        <img
                          src={getAvatarUrl(post.author?.avatar)}
                          alt={post.author?.name}
                          className="rounded-circle me-3"
                          style={{ width: 48, height: 48, objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1">
                          <Link to={`/forum/post/${post._id}`} className="text-decoration-none">
                            <h5 className="mb-1 text-dark">{post.title}</h5>
                          </Link>
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            <Badge bg="primary">{post.category}</Badge>
                            {post.tags?.slice(0, 3).map((tag, i) => (
                              <Badge key={i} bg="light" text="dark">{tag}</Badge>
                            ))}
                          </div>
                          <div className="d-flex align-items-center text-muted small">
                            <span className="me-3">
                              by <Link to={`/profile/${post.author?._id}`}>{post.author?.name}</Link>
                            </span>
                            <span className="me-3">
                              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </span>
                            <span className="me-3">
                              <FaEye className="me-1" /> {post.views}
                            </span>
                            <span className="me-3">
                              <FaComment className="me-1" /> {post.repliesCount || 0}
                            </span>
                            <span>
                              <FaThumbsUp className="me-1" /> {post.likes?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <h4 className="text-muted">No discussions yet</h4>
                <p className="text-muted">Be the first to start a conversation!</p>
                {isAuthenticated && (
                  <Button as={Link} to="/forum/create" variant="primary">
                    Start Discussion
                  </Button>
                )}
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Forum;
