import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Top10 from './components/Crypto/Top10';
import CryptoDetail from './components/Crypto/Detail';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Navbar from './components/Navbar';
import { AuthProvider } from './utils/auth';
import './styles/main.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<Top10 />} />
              <Route path="/crypto/:symbol" element={<CryptoDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
