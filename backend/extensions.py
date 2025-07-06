"""Standalone instances of Flask extensions used across the app."""

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

# These instances are initialised with the application in app.create_app()
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()