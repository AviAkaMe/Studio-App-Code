"""Flask route definitions for the REST API."""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from extensions import db, jwt
from models import User, Lesson, Booking
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError

# Blueprints group related routes together
auth_bp = Blueprint('auth', __name__)
user_bp = Blueprint('users', __name__)
lesson_bp = Blueprint('lessons', __name__)
booking_bp = Blueprint('bookings', __name__)

# --- AUTH ROUTES ---
@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate a user and return a JWT access token."""
    data = request.get_json() or {}
    if 'email' not in data or 'password' not in data:
        return jsonify({'msg': 'Missing email or password'}), 400
    u = User.query.filter_by(email=data['email']).first()
    if not u or not check_password_hash(u.password_hash, data['password']):
        return jsonify({'msg': 'Bad credentials'}), 401

    # Use a string identity and put the role in additional_claims
    token = create_access_token(
        identity=str(u.id),
        additional_claims={'role': u.role},
        expires_delta=timedelta(hours=1)
    )

    return jsonify(access_token=token), 200


@auth_bp.route('/register', methods=['POST'])
def register():
    """Create a new user account."""
    data = request.get_json() or {}
    required_fields = {'name', 'email', 'password'}
    if not required_fields.issubset(data):
        return jsonify({'msg': 'Missing required fields'}), 400

    u = User(
        name=data['name'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role=data.get('role', 'student'),
    )
    db.session.add(u)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'msg': 'Email already registered'}), 400
    return jsonify({'msg':'User created'}), 201

# --- LESSON ROUTES ---
@lesson_bp.route('', methods=['GET'])
@jwt_required()
def list_lessons():
    lessons = Lesson.query.all()
    return jsonify([l.to_dict() for l in lessons])

@lesson_bp.route('', methods=['POST'])
@jwt_required()
def create_lesson():
    """Admins create a new lesson."""
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({'msg': 'Forbidden'}), 403
    data = request.get_json() or {}
    if 'start_time' in data:
        data['start_time'] = datetime.fromisoformat(data['start_time'])
    l = Lesson(**data)
    db.session.add(l)
    db.session.commit()
    return jsonify({'id': l.id}), 201

@lesson_bp.route('/<int:lesson_id>', methods=['DELETE'])
@jwt_required()
def delete_lesson(lesson_id):
    """Delete a lesson (admin only)."""
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({'msg': 'Forbidden'}), 403
    lesson = Lesson.query.get_or_404(lesson_id)
    # Remove all bookings referencing this lesson first to avoid
    # foreign key violations on databases that don't honor cascading
    # deletes. This ensures the admin can always delete a lesson.
    Booking.query.filter_by(lesson_id=lesson_id).delete()
    db.session.delete(lesson)
    db.session.commit()
    return jsonify({'msg': 'Deleted'})


# ... (PUT, DELETE, GET by ID similarly with role checks)

# --- BOOKING ROUTES ---
@booking_bp.route('', methods=['GET'])
@jwt_required()
def list_bookings():
    """List bookings for the current user (or all if admin)."""
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    # Students get only their own bookings
    if claims['role'] == 'student':
        bookings = Booking.query.filter_by(student_id=user_id).all()
    else:
        # Admins see all bookings
        bookings = Booking.query.all()
    return jsonify([b.to_dict() for b in bookings]), 200

@booking_bp.route('', methods=['POST'])
@jwt_required()
def book_lesson():
    """Create a booking for the logged-in student."""
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    if claims['role'] != 'student':
        return jsonify({'msg': 'Only students can book'}), 403
    data = request.get_json()
    b = Booking(lesson_id=data['lesson_id'], student_id=user_id)
    db.session.add(b)
    db.session.commit()
    return jsonify({'id': b.id}), 201

@booking_bp.route('/<int:booking_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_booking(booking_id):
    """Cancel a booking. Students can cancel their own."""
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    b = Booking.query.get_or_404(booking_id)
    if claims['role'] == 'student' and b.student_id != user_id:
        return jsonify({'msg': 'Forbidden'}), 403
    b.status = 'cancelled'
    db.session.commit()
    return jsonify({'msg': 'Cancelled'})