from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from apscheduler.schedulers.background import BackgroundScheduler
from .config import Config
from .models import db
from . import auth, crypto, alerts

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    jwt = JWTManager(app)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(auth.bp)
    app.register_blueprint(crypto.bp)
    app.register_blueprint(alerts.bp)
    
    # Schedule background tasks in production
    if not app.debug and not app.testing:
        scheduler = BackgroundScheduler()
        scheduler.add_job(func=alerts.check_alerts, trigger='interval', minutes=5)
        scheduler.start()
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run()
