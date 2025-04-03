from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Alert, User
import requests
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

bp = Blueprint('alerts', __name__)

@bp.route('/alerts', methods=['GET'])
@jwt_required()
def get_alerts():
    try:
        user_id = get_jwt_identity()
        alerts = Alert.query.filter_by(user_id=user_id).all()
        return jsonify([{
            'id': a.id,
            'symbol': a.crypto_symbol,
            'target_price': a.target_price,
            'is_above': a.is_above,
            'is_active': a.is_active
        } for a in alerts]), 200
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error in get_alerts: {str(e)}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error in get_alerts: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@bp.route('/alerts', methods=['POST'])
@jwt_required()
def create_alert():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not all(k in data for k in ['symbol', 'target_price', 'is_above']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        alert = Alert(
            user_id=user_id,
            crypto_symbol=data['symbol'],
            target_price=float(data['target_price']),
            is_above=data['is_above']
        )
        
        db.session.add(alert)
        db.session.commit()
        
        return jsonify({'message': 'Alert created successfully'}), 201
    except ValueError as e:
        return jsonify({'error': 'Invalid price value'}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error in create_alert: {str(e)}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error in create_alert: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@bp.route('/alerts/<int:alert_id>', methods=['DELETE'])
@jwt_required()
def delete_alert(alert_id):
    try:
        user_id = get_jwt_identity()
        alert = Alert.query.filter_by(id=alert_id, user_id=user_id).first()
        
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404
        
        db.session.delete(alert)
        db.session.commit()
        
        return jsonify({'message': 'Alert deleted successfully'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error in delete_alert: {str(e)}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error in delete_alert: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

def check_alerts():
    with current_app.app_context():
        try:
            active_alerts = Alert.query.filter_by(is_active=True).all()
            
            for alert in active_alerts:
                try:
                    price_res = requests.get(
                        f'https://api.binance.com/api/v3/ticker/price?symbol={alert.crypto_symbol}',
                        timeout=5
                    )
                    price_res.raise_for_status()
                    current_price = float(price_res.json()['price'])
                    
                    condition_met = (current_price > alert.target_price) if alert.is_above else (current_price < alert.target_price)
                    
                    if condition_met:
                        user = alert.user
                        
                        # Send email notification
                        requests.post(
                             "https://api.mailgun.net/v3/YOUR_DOMAIN/messages",
                             auth=("api", current_app.config['MAILGUN_API_KEY']),
                             data={
                                 "from": "Balbers Alerts <alerts@balbers.com>",
                                 "to": [user.email],
                                 "subject": f"Price alert for {alert.crypto_symbol}",
                                 "text": f"The price of {alert.crypto_symbol} has reached your target of {alert.target_price}"
                             },
                             timeout=10
                         )
                        
                        alert.is_active = False
                        db.session.commit()
                        
                except requests.RequestException as e:
                    current_app.logger.error(f"API error checking alert {alert.id}: {str(e)}")
                except Exception as e:
                    current_app.logger.error(f"Error processing alert {alert.id}: {str(e)}")
                    db.session.rollback()
                    
        except SQLAlchemyError as e:
            current_app.logger.error(f"Database error in check_alerts: {str(e)}")
        except Exception as e:
            current_app.logger.error(f"Unexpected error in check_alerts: {str(e)}")
