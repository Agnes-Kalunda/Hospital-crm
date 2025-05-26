import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const { username, email, first_name, last_name, password, password2 } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (password !== password2) {
      newErrors.password2 = 'Passwords do not match';
    }
    
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const success = await register(formData);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-wrapper">
      <div className="auth-inner">
        <form onSubmit={onSubmit}>
          <h3>Sign Up</h3>
          
          <div className="mb-3">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              id="username"
              name="username"
              placeholder="Username"
              value={username}
              onChange={onChange}
              required
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>
          
          <div className="row mb-3">
            <div className="col">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                id="first_name"
                name="first_name"
                placeholder="First name"
                value={first_name}
                onChange={onChange}
                required
              />
              {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
            </div>
            
            <div className="col">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                id="last_name"
                name="last_name"
                placeholder="Last name"
                value={last_name}
                onChange={onChange}
                required
              />
              {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              id="email"
              name="email"
              placeholder="Enter email"
              value={email}
              onChange={onChange}
              required
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          
          <div className="mb-3">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              id="password"
              name="password"
              placeholder="Enter password"
              value={password}
              onChange={onChange}
              required
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>
          
          <div className="mb-3">
            <label htmlFor="password2">Confirm Password</label>
            <input
              type="password"
              className={`form-control ${errors.password2 ? 'is-invalid' : ''}`}
              id="password2"
              name="password2"
              placeholder="Confirm password"
              value={password2}
              onChange={onChange}
              required
            />
            {errors.password2 && <div className="invalid-feedback">{errors.password2}</div>}
          </div>
          
          <div className="d-grid">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>
          
          <p className="forgot-password text-right mt-2">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;