import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCryptoDetail } from '../../utils/api';
import Chart from '../Chart';
import AlertForm from '../Alerts/AlertForm';
import { useAuth } from '../../utils/auth';
import './Detail.css';

function CryptoDetail() {
  const { symbol } = useParams();
  const [crypto, setCrypto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCryptoDetail(symbol);
        setCrypto(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="detail-container">
      <div className="detail-header">
        <h2>{symbol.replace('USDT', '')}</h2>
        <div className="price-display">
          <span className="current-price">${parseFloat(crypto.price).toFixed(2)}</span>
          <span className={`price-change ${parseFloat(crypto.stats.change) >= 0 ? 'positive' : 'negative'}`}>
            {parseFloat(crypto.stats.change).toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="detail-stats">
        <div className="stat-item">
          <span className="stat-label">24h High</span>
          <span className="stat-value">${parseFloat(crypto.stats.high).toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">24h Low</span>
          <span className="stat-value">${parseFloat(crypto.stats.low).toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">24h Volume</span>
          <span className="stat-value">${(parseFloat(crypto.stats.volume) / 1000000).toFixed(2)}M</span>
        </div>
      </div>

      <div className="chart-container">
        <Chart data={crypto.chart} />
      </div>

      {isAuthenticated && (
        <div className="alerts-section">
          <h3>Price Alerts</h3>
          <AlertForm symbol={symbol} currentPrice={parseFloat(crypto.price)} />
        </div>
      )}
    </div>
  );
}

export default CryptoDetail;
