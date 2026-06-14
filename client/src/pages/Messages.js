import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Button, Card, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { formatDistanceToNow } from 'date-fns';
import Loader from '../components/common/Loader';
import { messageAPI } from '../services/api';

const Messages = () => {
  const { id } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(id || '');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');
  const [text, setText] = useState('');

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await messageAPI.getConversations();
      setConversations(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (userId) => {
    if (!userId) return;
    setChatLoading(true);
    setError('');
    try {
      const res = await messageAPI.getMessages(userId);
      setMessages(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages.');
    } finally {
      setChatLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (id) setSelectedUserId(id);
  }, [id]);

  useEffect(() => {
    if (selectedUserId) loadMessages(selectedUserId);
  }, [selectedUserId, loadMessages]);

  const selectedConversation = useMemo(
    () => conversations.find(conv => conv.user?._id === selectedUserId),
    [conversations, selectedUserId]
  );

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !text.trim()) return;
    try {
      await messageAPI.sendMessage(selectedUserId, { content: text.trim() });
      setText('');
      await loadMessages(selectedUserId);
      await loadConversations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="messages-page py-5">
      <Container>
        {error && <Alert variant="danger">{error}</Alert>}
        <Row className="g-4">
          <Col lg={4}>
            <Card className="shadow-sm">
              <Card.Header><strong>Conversations</strong></Card.Header>
              <ListGroup variant="flush">
                {conversations.length ? (
                  conversations.map(conv => (
                    <ListGroup.Item
                      key={conv.user?._id}
                      action
                      active={selectedUserId === conv.user?._id}
                      onClick={() => setSelectedUserId(conv.user?._id)}
                    >
                      <div className="d-flex justify-content-between">
                        <span>{conv.user?.name}</span>
                        {!!conv.unreadCount && <span className="badge bg-danger">{conv.unreadCount}</span>}
                      </div>
                      <div className="small text-muted text-truncate">
                        {conv.lastMessage?.content}
                      </div>
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item className="text-muted">No conversations yet.</ListGroup.Item>
                )}
              </ListGroup>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="shadow-sm">
              <Card.Header>
                <strong>{selectedConversation?.user?.name || 'Select a conversation'}</strong>
              </Card.Header>
              <Card.Body style={{ minHeight: 420 }}>
                {chatLoading ? (
                  <Loader />
                ) : selectedUserId ? (
                  <>
                    <div className="mb-3" style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {messages.length ? (
                        messages.map(msg => (
                          <div key={msg._id} className="mb-2">
                            <div className="small">{msg.content}</div>
                            <div className="text-muted" style={{ fontSize: 12 }}>
                              {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted mb-0">No messages yet.</p>
                      )}
                    </div>
                    <Form onSubmit={handleSend}>
                      <Form.Control
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type your message..."
                      />
                      <Button type="submit" className="mt-2">Send</Button>
                    </Form>
                  </>
                ) : (
                  <p className="text-muted mb-0">Choose a conversation to start messaging.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Messages;
