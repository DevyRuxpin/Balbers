from flask import Blueprint, jsonify
import requests
from datetime import datetime, timedelta

bp = Blueprint('crypto', __name__)
BINANCE_API = 'https://api.binance.com/api/v3'

@bp.route('/top10', methods=['GET'])
def get_top10():
    try:
        # Get ticker data sorted by quote volume
        response = requests.get(f'{BINANCE_API}/ticker/24hr')
        response.raise_for_status()
        
        all_tickers = response.json()
        # Filter for USDT pairs and sort by quote volume
        usdt_pairs = [t for t in all_tickers if t['symbol'].endswith('USDT')]
        sorted_by_volume = sorted(usdt_pairs, key=lambda x: float(x['quoteVolume']), reverse=True)
        top10 = sorted_by_volume[:10]
        
        simplified = [{
            'symbol': t['symbol'],
            'price': t['lastPrice'],
            'change': t['priceChangePercent'],
            'volume': t['quoteVolume']
        } for t in top10]
        
        return jsonify(simplified), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/detail/<symbol>', methods=['GET'])
def get_crypto_detail(symbol):
    try:
        # Get current price
        price_res = requests.get(f'{BINANCE_API}/ticker/price?symbol={symbol}')
        price_res.raise_for_status()
        price_data = price_res.json()
        
        # Get 24hr stats
        stats_res = requests.get(f'{BINANCE_API}/ticker/24hr?symbol={symbol}')
        stats_res.raise_for_status()
        stats_data = stats_res.json()
        
        # Get historical data for chart
        end_time = int(datetime.now().timestamp() * 1000)
        start_time = int((datetime.now() - timedelta(days=30)).timestamp() * 1000)
        klines_res = requests.get(
            f'{BINANCE_API}/klines?symbol={symbol}&interval=1d&startTime={start_time}&endTime={end_time}'
        )
        klines_res.raise_for_status()
        klines_data = klines_res.json()
        
        chart_data = [{
            'time': k[0],
            'open': k[1],
            'high': k[2],
            'low': k[3],
            'close': k[4],
            'volume': k[5]
        } for k in klines_data]
        
        return jsonify({
            'symbol': symbol,
            'price': price_data['price'],
            'stats': {
                'high': stats_data['highPrice'],
                'low': stats_data['lowPrice'],
                'change': stats_data['priceChangePercent'],
                'volume': stats_data['quoteVolume']
            },
            'chart': chart_data
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
