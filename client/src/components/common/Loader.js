import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = ({ size = 'md', text = 'Loading...' }) => {
  return (
    <div className="loader-container d-flex flex-column align-items-center justify-content-center py-5">
      <Spinner 
        animation="border" 
        variant="primary" 
        size={size === 'sm' ? 'sm' : undefined}
        style={size === 'lg' ? { width: '3rem', height: '3rem' } : {}}
      />
      {text && <p className="mt-3 text-muted">{text}</p>}
    </div>
  );
};

export default Loader;
