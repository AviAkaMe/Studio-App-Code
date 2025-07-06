"""Utility script to populate the database with sample data."""

from app import create_app
from extensions import db
from models import User, Lesson, Booking
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

app = create_app()
# Run all DB operations within the application context
with app.app_context():
    db.drop_all(); db.create_all()
    admin = User(name='Admin', email='admin@studio.com',
                 password_hash=generate_password_hash('pass'), role='admin')
    t = User(name='Trainer1', email='trainer@studio.com',
             password_hash=generate_password_hash('pass'), role='admin')
    s = User(name='Student1', email='student@studio.com',
             password_hash=generate_password_hash('pass'), role='student')
    db.session.add_all([admin, t, s])
    lesson = Lesson(title='Yoga Basics', description='Intro to Yoga',
                    start_time=datetime.utcnow()+timedelta(days=1),
                    duration=60, capacity=10, trainer_id=2)
    db.session.add(lesson); db.session.commit()
    booking = Booking(lesson_id=lesson.id, student_id=3, status='confirmed')
    db.session.add(booking); db.session.commit()
    print('Seed complete.')