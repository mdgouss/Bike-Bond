import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, Dropdown, Badge } from 'react-bootstrap';
import { FaMotorcycle, FaUser, FaComments, FaBars } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/avatar';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BSNavbar 
      bg="dark" 
      variant="dark" 
      expand="lg" 
      fixed="top" 
      expanded={expanded}
      className="navbar-custom"
    >
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="brand">
          <FaMotorcycle className="brand-icon" />
          <span>BikeBond</span>
        </BSNavbar.Brand>

        <BSNavbar.Toggle 
          aria-controls="navbar-nav" 
          onClick={() => setExpanded(!expanded)}
        >
          <FaBars />
        </BSNavbar.Toggle>

        <BSNavbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={NavLink} 
              to="/rides" 
              onClick={() => setExpanded(false)}
            >
              Rides
            </Nav.Link>
            <Nav.Link 
              as={NavLink} 
              to="/members" 
              onClick={() => setExpanded(false)}
            >
              Members
            </Nav.Link>
            <Nav.Link 
              as={NavLink} 
              to="/forum" 
              onClick={() => setExpanded(false)}
            >
              Forum
            </Nav.Link>
            <Nav.Link 
              as={NavLink} 
              to="/marketplace" 
              onClick={() => setExpanded(false)}
            >
              Marketplace
            </Nav.Link>
          </Nav>

          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Link 
                  as={NavLink} 
                  to="/messages" 
                  className="nav-icon"
                  onClick={() => setExpanded(false)}
                >
                  <FaComments />
                </Nav.Link>

                <Dropdown align="end">
                  <Dropdown.Toggle 
                    variant="link" 
                    id="user-dropdown"
                    className="nav-user-dropdown"
                  >
                    <img 
                      src={getAvatarUrl(user?.avatar)}
                      alt={user?.name}
                      className="nav-avatar"
                    />
                    <span className="nav-username">{user?.name?.split(' ')[0]}</span>
                    {user?.isVerified && (
                      <Badge bg="success" className="ms-1">✓</Badge>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to={`/profile/${user?._id || user?.id}`}>
                      <FaUser className="me-2" /> My Profile
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/garage">
                      <FaMotorcycle className="me-2" /> My Garage
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/edit-profile">
                      Settings
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={NavLink} 
                  to="/login"
                  onClick={() => setExpanded(false)}
                >
                  Login
                </Nav.Link>
                <Nav.Link 
                  as={NavLink} 
                  to="/register" 
                  className="btn btn-primary btn-sm ms-2"
                  onClick={() => setExpanded(false)}
                >
                  Join Now
                </Nav.Link>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
