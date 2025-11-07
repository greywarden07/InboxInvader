from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import smtplib
from email.message import EmailMessage
import traceback
import time
import csv
from io import StringIO
import re
from functools import wraps
import jwt
from datetime import datetime, timedelta
import os
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///inboxinvader.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# CORS configuration for production
allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, resources={
    r"/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

db = SQLAlchemy(app)


# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    templates = db.relationship('Template', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Template(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.Text, nullable=False)
    body = db.Column(db.Text, nullable=True)
    variables = db.Column(db.Text, nullable=True)  # JSON string of variables
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Create tables
with app.app_context():
    db.create_all()
    # Create default admin user if not exists
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', email='admin@inboxinvader.local')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("✓ Default admin user created")


def send_via_smtp(smtp_server: str, smtp_port: int, sender_email: str, sender_password: str, msg: EmailMessage, recipients: list):
    # Choose SSL vs STARTTLS based on port
    try:
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=30)
        else:
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=30)
            server.ehlo()
            try:
                server.starttls()
            except Exception:
                pass

        server.login(sender_email, sender_password)
        server.send_message(msg, from_addr=sender_email, to_addrs=recipients)
        server.quit()
        return True, "Message sent"
    except Exception as e:
        return False, str(e)


def substitute_variables(text, variables):
    """Replace {{variable}} placeholders with actual values"""
    if not text or not variables:
        return text
    
    for key, value in variables.items():
        placeholder = f"{{{{{key}}}}}"
        text = text.replace(placeholder, str(value))
    return text


def token_required(f):
    """Decorator to protect routes with JWT authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'success': False, 'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'success': False, 'message': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "msg": "backend running"})


@app.route("/signup", methods=["POST"])
def signup():
    """Register a new user"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        # Validation
        if not username or not email or not password:
            return jsonify({'success': False, 'message': 'All fields are required'}), 400
        
        if len(username) < 3:
            return jsonify({'success': False, 'message': 'Username must be at least 3 characters'}), 400
        
        if len(password) < 6:
            return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400
        
        if '@' not in email:
            return jsonify({'success': False, 'message': 'Invalid email format'}), 400
        
        # Check if user exists
        if User.query.filter_by(username=username).first():
            return jsonify({'success': False, 'message': 'Username already exists'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'message': 'Email already registered'}), 400
        
        # Create new user
        new_user = User(username=username, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Account created successfully! Please login.',
            'username': username
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route("/login", methods=["POST"])
def login():
    """Simple login endpoint - returns JWT token"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            token = jwt.encode({
                'user_id': user.id,
                'username': user.username,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'success': True,
                'token': token,
                'username': user.username,
                'email': user.email
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route("/send", methods=["POST"])
@token_required
def send(current_user):
    try:
        # Form fields
        smtp_server = request.form.get("smtp_server", "smtp.gmail.com")
        smtp_port = int(request.form.get("smtp_port", 587))
        sender_email = request.form.get("sender_email")
        sender_password = request.form.get("sender_password")
        raw_recipients = request.form.get("recipients", "")
        subject = request.form.get("subject", "")
        body = request.form.get("body", "")
        delay_seconds = float(request.form.get("delay_seconds", 0))
        variables_json = request.form.get("variables", "{}")

        if not sender_email or not sender_password or not raw_recipients:
            return jsonify({"success": False, "message": "Missing required fields: sender_email, sender_password, recipients"}), 400

        # Prepare recipients list
        recipients = [r.strip() for r in raw_recipients.replace(";", ",").replace("\n", ",").split(",") if r.strip()]
        if not recipients:
            return jsonify({"success": False, "message": "No valid recipients provided"}), 400

        # Parse variables for substitution
        import json
        try:
            variables = json.loads(variables_json)
        except:
            variables = {}

        # Read attachments once
        files = request.files.getlist("attachments")
        attachment_data = []
        for f in files:
            data = f.read()
            if data:
                attachment_data.append({
                    "filename": f.filename or "attachment",
                    "data": data
                })

        # Send to each recipient individually and track results
        results = []
        for idx, recipient in enumerate(recipients):
            # Apply variable substitution (can customize per recipient)
            recipient_vars = variables.copy()
            recipient_vars['email'] = recipient
            
            substituted_subject = substitute_variables(subject, recipient_vars)
            substituted_body = substitute_variables(body, recipient_vars)
            
            # Build message for this recipient
            msg = EmailMessage()
            msg["From"] = sender_email
            msg["To"] = recipient
            msg["Subject"] = substituted_subject
            msg.set_content(substituted_body or "")

            # Attach files
            for att in attachment_data:
                msg.add_attachment(att["data"], maintype="application", subtype="octet-stream", filename=att["filename"])

            # Try to send
            ok, info = send_via_smtp(smtp_server, smtp_port, sender_email, sender_password, msg, [recipient])
            results.append({
                "email": recipient,
                "success": ok,
                "message": info if not ok else "Sent",
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Add delay between sends (except after last one)
            if delay_seconds > 0 and idx < len(recipients) - 1:
                time.sleep(delay_seconds)

        # Compute overall success
        successful_count = sum(1 for r in results if r["success"])
        failed_count = len(results) - successful_count
        overall_success = failed_count == 0

        return jsonify({
            "success": overall_success,
            "message": f"Sent {successful_count}/{len(results)} emails successfully",
            "results": results,
            "summary": {
                "total": len(results),
                "successful": successful_count,
                "failed": failed_count
            }
        })

    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"success": False, "message": str(e), "trace": tb}), 500


@app.route("/export-csv", methods=["POST"])
@token_required
def export_csv(current_user):
    """Export results to CSV format"""
    try:
        data = request.get_json()
        results = data.get('results', [])
        
        if not results:
            return jsonify({'success': False, 'message': 'No results to export'}), 400
        
        # Create CSV in memory
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=['email', 'status', 'message', 'timestamp'])
        writer.writeheader()
        
        for r in results:
            writer.writerow({
                'email': r.get('email', ''),
                'status': 'Success' if r.get('success') else 'Failed',
                'message': r.get('message', ''),
                'timestamp': r.get('timestamp', '')
            })
        
        # Create response
        csv_data = output.getvalue()
        response = make_response(csv_data)
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=email_results_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        
        return response
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route("/templates", methods=["GET"])
@token_required
def get_templates(current_user):
    """Get all templates for the current user"""
    try:
        templates = Template.query.filter_by(user_id=current_user.id).order_by(Template.updated_at.desc()).all()
        
        return jsonify({
            'success': True,
            'templates': [{
                'id': t.id,
                'name': t.name,
                'subject': t.subject,
                'body': t.body,
                'variables': json.loads(t.variables) if t.variables else {},
                'created_at': t.created_at.isoformat(),
                'updated_at': t.updated_at.isoformat()
            } for t in templates]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route("/templates", methods=["POST"])
@token_required
def create_template(current_user):
    """Create a new template"""
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        subject = data.get('subject', '').strip()
        body = data.get('body', '')
        variables = data.get('variables', {})
        
        if not name or not subject:
            return jsonify({'success': False, 'message': 'Name and subject are required'}), 400
        
        # Check if template name already exists for this user
        existing = Template.query.filter_by(user_id=current_user.id, name=name).first()
        if existing:
            return jsonify({'success': False, 'message': 'Template name already exists'}), 400
        
        new_template = Template(
            user_id=current_user.id,
            name=name,
            subject=subject,
            body=body,
            variables=json.dumps(variables) if variables else None
        )
        
        db.session.add(new_template)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Template saved',
            'template': {
                'id': new_template.id,
                'name': new_template.name,
                'subject': new_template.subject,
                'body': new_template.body,
                'variables': variables
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route("/templates/<int:template_id>", methods=["DELETE"])
@token_required
def delete_template(current_user, template_id):
    """Delete a template"""
    try:
        template = Template.query.filter_by(id=template_id, user_id=current_user.id).first()
        
        if not template:
            return jsonify({'success': False, 'message': 'Template not found'}), 404
        
        db.session.delete(template)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Template deleted'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


if __name__ == "__main__":
    # Get port from environment variable (for Render/Railway) or default to 5000
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    
    # Run the Flask dev server. In production use gunicorn/uvicorn behind a proxy.
    app.run(host="0.0.0.0", port=port, debug=debug)
