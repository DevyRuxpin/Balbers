import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const fetchTop10 = async () => {
  const response = await axios.get(`${API_BASE_URL}/crypto/top10`);
  return response.data;
};

export const fetchCryptoDetail = async (symbol) => {
  const response = await axios.get(`${API_BASE_URL}/crypto/detail/${symbol}`);
  return response.data;
};

export const login = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password
  });
  return response.data.token;
};

export const signup = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
    email,
    password
  });
  return response.data.token;
};

export const createAlert = async (token, alertData) => {
  const response = await axios.post(`${API_BASE_URL}/alerts/alerts`, alertData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
