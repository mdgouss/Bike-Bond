import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Container, Form } from 'react-bootstrap';
import { formatDistanceToNow } from 'date-fns';
import Loader from '../components/common/Loader';
import { forumAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ForumPost = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const loadPost = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await forumAPI.getPost(id);
      setPost(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load post.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleLike = async () => {
    if (!isAuthenticated) return;
    setLikeLoading(true);
    try {
      await forumAPI.toggleLike(id);
      await loadPost();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to like post.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setReplyLoading(true);
    try {
      await forumAPI.addReply(id, { content: reply.trim() });
      setReply('');
      await loadPost();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to post reply.');
    } finally {
      setReplyLoading(false);
    }
  };

  if (loading) return <Loader />;

  const hasLiked = !!(user && post?.likes?.includes(user._id));

  return (
    <div className="forum-post-page py-5">
      <Container>
        {error && <Alert variant="danger">{error}</Alert>}
        {!post ? (
          <Card className="shadow-sm">
            <Card.Body className="text-center py-5">
              <h2>Post not found</h2>
            </Card.Body>
          </Card>
        ) : (
          <>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h2 className="mb-1">{post.title}</h2>
                    <div className="text-muted small">
                      by <Link to={`/profile/${post.author?._id}`}>{post.author?.name}</Link> •{' '}
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <Badge bg="primary">{post.category}</Badge>
                </div>

                <p className="mb-3" style={{ whiteSpace: 'pre-line' }}>{post.content}</p>
                {!!post.tags?.length && (
                  <div className="mb-3">
                    {post.tags.map(tag => (
                      <Badge bg="light" text="dark" className="me-1" key={tag}>{tag}</Badge>
                    ))}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <Button
                    variant={hasLiked ? 'primary' : 'outline-primary'}
                    onClick={handleLike}
                    disabled={!isAuthenticated || likeLoading}
                  >
                    {hasLiked ? 'Liked' : 'Like'} ({post.likes?.length || 0})
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <Card className="shadow-sm">
              <Card.Header><strong>Replies ({post.replies?.length || 0})</strong></Card.Header>
              <Card.Body>
                {post.replies?.length ? (
                  post.replies.map(item => (
                    <div key={item._id} className="pb-3 mb-3 border-bottom">
                      <div className="small text-muted mb-1">
                        <Link to={`/profile/${item.author?._id}`}>{item.author?.name}</Link> •{' '}
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </div>
                      <div style={{ whiteSpace: 'pre-line' }}>{item.content}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted mb-0">No replies yet.</p>
                )}

                {isAuthenticated && (
                  <Form onSubmit={handleReply} className="mt-3">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write your reply..."
                    />
                    <Button className="mt-2" type="submit" disabled={replyLoading}>
                      {replyLoading ? 'Posting...' : 'Post Reply'}
                    </Button>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </div>
  );
};

export default ForumPost;
