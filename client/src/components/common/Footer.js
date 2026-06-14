import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FaMotorcycle, FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light py-5 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <div className="footer-brand mb-3">
              <FaMotorcycle className="me-2" />
              <span className="h4">BikeBond</span>
            </div>
            <p className="text-muted">
              India's Premier Biking Community. Connect with fellow riders, 
              plan group rides, and share your passion for motorcycles.
            </p>
            <div className="social-links">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-light me-3"><FaFacebook /></a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-light me-3"><FaInstagram /></a>
              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-light me-3"><FaTwitter /></a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-light"><FaYoutube /></a>
            </div>
          </Col>

          <Col md={2} className="mb-4">
            <h6 className="text-uppercase mb-3">Explore</h6>
            <ul className="list-unstyled">
              <li><Link to="/rides" className="text-muted">Rides</Link></li>
              <li><Link to="/members" className="text-muted">Members</Link></li>
              <li><Link to="/forum" className="text-muted">Forum</Link></li>
              <li><Link to="/marketplace" className="text-muted">Marketplace</Link></li>
            </ul>
          </Col>

          <Col md={2} className="mb-4">
            <h6 className="text-uppercase mb-3">Popular Routes</h6>
            <ul className="list-unstyled">
              <li><span className="text-muted">Ladakh</span></li>
              <li><span className="text-muted">Spiti Valley</span></li>
              <li><span className="text-muted">Rajasthan</span></li>
              <li><span className="text-muted">North-East</span></li>
            </ul>
          </Col>

          <Col md={2} className="mb-4">
            <h6 className="text-uppercase mb-3">Support</h6>
            <ul className="list-unstyled">
              <li><Link to="/help" className="text-muted">Help Center</Link></li>
              <li><Link to="/safety" className="text-muted">Safety Tips</Link></li>
              <li><Link to="/contact" className="text-muted">Contact Us</Link></li>
              <li><Link to="/faq" className="text-muted">FAQs</Link></li>
            </ul>
          </Col>

          <Col md={2} className="mb-4">
            <h6 className="text-uppercase mb-3">Legal</h6>
            <ul className="list-unstyled">
              <li><Link to="/terms" className="text-muted">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-muted">Privacy Policy</Link></li>
              <li><Link to="/guidelines" className="text-muted">Community Guidelines</Link></li>
            </ul>
          </Col>
        </Row>

        <hr className="my-4 bg-secondary" />

        <Row>
          <Col className="text-center text-muted">
            <small>
              © {new Date().getFullYear()} BikeBond. Made with ❤️ for Indian Bikers.
              <br />
              Ride Safe. Ride Together.
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
