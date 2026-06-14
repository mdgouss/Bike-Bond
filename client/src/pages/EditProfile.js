import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';

const EditProfile = () => {
  const { updateUser, loadUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    city: '',
    state: '',
    ridingSince: '',
    ridingStyles: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await authAPI.getMe();
        const me = res.data.data;
        setFormData({
          name: me.name || '',
          phone: me.phone || '',
          bio: me.bio || '',
          city: me.city || '',
          state: me.state || '',
          ridingSince: me.ridingSince || '',
          ridingStyles: me.ridingStyles || []
        });
        setAvatar(me.avatar || '');
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStyleToggle = (style) => {
    setFormData(prev => {
      const exists = prev.ridingStyles.includes(style);
      return {
        ...prev,
        ridingStyles: exists
          ? prev.ridingStyles.filter(s => s !== style)
          : [...prev.ridingStyles, style]
      };
    });
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setError('Please select an image to upload.');
      return;
    }

    setAvatarUploading(true);
    setError('');
    setSuccess('');
    try {
      const form = new FormData();
      form.append('avatar', avatarFile);
      const res = await authAPI.uploadAvatar(form);
      setAvatar(res.data.data);
      setAvatarFile(null);
      updateUser({ avatar: res.data.data });
      await loadUser();
      setSuccess('Avatar updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload avatar.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...formData,
        ridingSince: formData.ridingSince ? Number(formData.ridingSince) : undefined
      };
      const res = await authAPI.updateProfile(payload);
      updateUser(res.data.data);
      await loadUser();
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const styles = ['touring', 'off-road', 'sports', 'cruiser', 'commuter', 'adventure'];

  return (
    <div className="edit-profile-page py-5">
      <Container>
        <Card className="shadow-sm">
          <Card.Body className="p-4 p-md-5">
            <h2 className="mb-4">Edit Profile</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {!loading && (
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col xs={12}>
                    <Card className="border">
                      <Card.Body>
                        <h5 className="mb-3">Profile Avatar</h5>
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                          <img
                            src={getAvatarUrl(avatar)}
                            alt="Profile avatar"
                            className="rounded-circle"
                            style={{ width: 80, height: 80, objectFit: 'cover' }}
                          />
                          <div className="d-flex gap-2 flex-wrap">
                            <Form.Control
                              type="file"
                              accept="image/*"
                              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                              style={{ maxWidth: 300 }}
                            />
                            <Button
                              type="button"
                              variant="outline-primary"
                              onClick={handleAvatarUpload}
                              disabled={avatarUploading || !avatarFile}
                            >
                              {avatarUploading ? 'Uploading...' : 'Upload Avatar'}
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Name</Form.Label>
                      <Form.Control name="name" value={formData.name} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phone</Form.Label>
                      <Form.Control name="phone" value={formData.phone} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>City</Form.Label>
                      <Form.Control name="city" value={formData.city} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>State</Form.Label>
                      <Form.Control name="state" value={formData.state} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Riding Since</Form.Label>
                      <Form.Control
                        type="number"
                        min="1950"
                        max={new Date().getFullYear()}
                        name="ridingSince"
                        value={formData.ridingSince}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Label className="mb-2">Riding Styles</Form.Label>
                    <div className="d-flex flex-wrap gap-3">
                      {styles.map(style => (
                        <Form.Check
                          key={style}
                          id={`style-${style}`}
                          type="checkbox"
                          label={style}
                          checked={formData.ridingStyles.includes(style)}
                          onChange={() => handleStyleToggle(style)}
                        />
                      ))}
                    </div>
                  </Col>
                  <Col xs={12}>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default EditProfile;
