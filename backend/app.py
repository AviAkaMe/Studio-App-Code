# backend/app.py
"""Flask application factory and configuration."""

import os
from flask import Flask
from dotenv import load_dotenv
from extensions import db, migrate, jwt
from routes import auth_bp, user_bp, lesson_bp, booking_bp
from flask_cors import CORS

# Import Prometheus WSGI app and dispatcher
from prometheus_client import make_wsgi_app
from werkzeug.middleware.dispatcher import DispatcherMiddleware

load_dotenv()

def create_app():
    """Application factory used by the Flask CLI and tests."""
    app = Flask(__name__)

    # Allow the frontend to send the Authorization header and receive
    # responses even when errors occur.
    CORS(app, supports_credentials=True)
    
    # Configure SQLAlchemy: prefer DATABASE_URL, then SQLALCHEMY_DATABASE_URI, fallback to in-memory
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        os.getenv('DATABASE_URL')
        or os.getenv('SQLALCHEMY_DATABASE_URI')
        or 'sqlite:///:memory:'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

    # Initialise extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Register blueprints for the different API sections
    app.register_blueprint(auth_bp,   url_prefix='/api/auth')
    app.register_blueprint(user_bp,   url_prefix='/api/users')
    app.register_blueprint(lesson_bp, url_prefix='/api/lessons')
    app.register_blueprint(booking_bp,url_prefix='/api/bookings')

    # Auto-create all tables based on models
    with app.app_context():
        db.create_all()

    # Mount Prometheus metrics endpoint at /metrics
    app.wsgi_app = DispatcherMiddleware(app.wsgi_app, {
        '/metrics': make_wsgi_app()
    })

    return app

if __name__ == '__main__':
    create_app().run(debug=True)