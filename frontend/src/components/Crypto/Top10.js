import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTop10 } from '../../utils/api';
import './Top10.css';

function Top10() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTop10();
        setCryptos(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="top10-container">
      <h2>Top 10 Cryptocurrencies by Volume</h2>
      <div className="crypto-grid">
        {cryptos.map((crypto) => (
          <div 
            key={crypto.symbol} 
            className="crypto-card"
            onClick={() => navigate(`/crypto/${crypto.symbol}`)}
          >
            <h3>{crypto.symbol.replace('USDT', '')}</h3>
            <p className="price">${parseFloat(crypto.price).toFixed(2)}</p>
            <p className={`change ${parseFloat(crypto.change) >= 0 ? 'positive' : 'negative'}`}>
              {parseFloat(crypto.change).toFixed(2)}%
            </p>
            <p className="volume">Vol: ${(parseFloat(crypto.volume) / 1000000).toFixed(2)}M</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Top10;
