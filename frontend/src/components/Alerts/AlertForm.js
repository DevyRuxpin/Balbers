import React, { useState } from 'react';
import { createAlert } from '../../utils/api';
import { useAuth } from '../../utils/auth';
import './AlertForm.css';

function AlertForm({ symbol, currentPrice }) {
  const [price, setPrice] = useState('');
  const [isAbove, setIsAbove] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!price || isNaN(price)) {
      setError('Please enter a valid price');
      return;
    }

    try {
      await createAlert(token, {
        symbol,
        target_price: parseFloat(price),
        is_above: isAbove
      });
      setMessage('Alert created successfully!');
      setPrice('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="alert-form">
      <div className="form-group">
        <label>Alert me when price is:</label>
        <select 
          value={isAbove ? 'above' : 'below'} 
          onChange={(e) => setIsAbove(e.target.value === 'above')}
        >
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={`Current: $${currentPrice.toFixed(2)}`}
          step="0.0001"
        />
      </div>
      <button type="submit" className="submit-btn">Create Alert</button>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </form>
  );
}

export default AlertForm;
