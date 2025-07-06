"""Database models for the application."""

from extensions import db
from datetime import datetime

class User(db.Model):
    """Application user who can be an admin (trainer) or a student."""

    # Basic account fields
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    # Role determines available actions in the application
    role = db.Column(db.Enum('admin', 'student', name='user_roles'), nullable=False)

    # Relationships
    lessons = db.relationship('Lesson', backref='trainer', lazy=True)
    bookings = db.relationship('Booking', backref='student', lazy=True)


class Lesson(db.Model):
    """A bookable lesson created by an admin/trainer."""

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    start_time = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # minutes
    capacity = db.Column(db.Integer, nullable=False)
    trainer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Cascade delete bookings when a lesson is removed so admins can delete
    # lessons even if students have already booked them.
    bookings = db.relationship(
        'Booking',
        backref='lesson',
        lazy=True,
        cascade='all, delete-orphan',
        passive_deletes=True,
    )

    def to_dict(self):
        """Serialize ``Lesson`` to a JSON-friendly dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'start_time': self.start_time.isoformat(),
            'duration': self.duration,
            'capacity': self.capacity,
            'trainer_id': self.trainer_id,
        }


class Booking(db.Model):
    """Association between a student and a lesson."""

    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(
        db.Integer,
        db.ForeignKey('lesson.id', ondelete='CASCADE'),
        nullable=False,
    )
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(
        db.Enum('pending','confirmed','cancelled', name='booking_status'),
        default='pending'
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Serialize ``Booking`` including basic lesson info."""
        return {
            'id':         self.id,
            'status':     self.status,
            'created_at': self.created_at.isoformat(),
            'lesson': {
                'id':    self.lesson.id,
                'title': self.lesson.title
            }
        }