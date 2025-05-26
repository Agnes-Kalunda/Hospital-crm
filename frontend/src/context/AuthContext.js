import React, { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserDetails();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, [token]);
  
  const fetchUserDetails = async () => {
    try {
      const res = await axios.get('/api/auth/user/');
      setUser(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user details:', err);
      logout();
    }
  };
  
  const login = async (username, password) => {
    try {
      const res = await axios.post('/api/auth/token/', { username, password });
      localStorage.setItem('token', res.data.access);
      localStorage.setItem('refreshToken', res.data.refresh);
      setToken(res.data.access);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
      return false;
    }
  };
  
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register/', userData);
      localStorage.setItem('token', res.data.access);
      localStorage.setItem('refreshToken', res.data.refresh);
      setToken(res.data.access);
      setUser(res.data.user);
      return true;
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        Object.keys(errors).forEach(key => {
          toast.error(`${key}: ${errors[key]}`);
        });
      } else {
        toast.error('Registration failed');
      }
      return false;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    navigate('/login');
    toast.info('You have been logged out');
  };
  
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const res = await axios.post('/api/auth/token/refresh/', {
        refresh: refreshToken
      });
      
      localStorage.setItem('token', res.data.access);
      setToken(res.data.access);
      return true;
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
      return false;
    }
  };
  
 
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
         
          const refreshed = await refreshToken();
          if (refreshed) {

            originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
            return axios(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};