from flask import Flask, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user

app = Flask(__name__)
app.debug = True
CORS(app,supports_credentials=True)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SECRET_KEY'] = 'your_secret_key'

# Extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.init_app(app)

# User model
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Employee model
class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    gross_salary = db.Column(db.Float, nullable=False)
    tin_number = db.Column(db.String(100), nullable=False)
    nssf_number = db.Column(db.String(100), nullable=False)
    preferred_payment_mode = db.Column(db.String(100), nullable=False)
    mobile_number = db.Column(db.String(100), nullable=True)
    bank_account_number = db.Column(db.String(100), nullable=True)

    def __repr__(self):
        return (
            f"<Employee(id={self.id}, name='{self.name}', gross_salary={self.gross_salary}, "
            f"tin_number='{self.tin_number}', nssf_number='{self.nssf_number}', "
            f"preferred_payment_mode='{self.preferred_payment_mode}', mobile_number='{self.mobile_number}', "
            f"bank_account_number='{self.bank_account_number}')>"
        )

    @property
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'grossSalary': self.gross_salary,
            'tinNumber': self.tin_number,
            'nssfNumber': self.nssf_number,
            'preferredPaymentMode': self.preferred_payment_mode,
            'mobileNumber': self.mobile_number,
            'bankAccountNumber': self.bank_account_number
        }

@app.route('/employees', methods=['GET'])
@login_required
def get_employees():
    employees = Employee.query.all()
    return jsonify([employee.serialize for employee in employees])

@app.route('/employee', methods=['POST'])
@login_required
def add_employee():
    data = request.get_json()
    new_employee = Employee(
        name=data['name'],
        gross_salary=data['grossSalary'],
        tin_number=data['tinNumber'],
        nssf_number=data['nssfNumber'],
        preferred_payment_mode=data['preferredPaymentMode'],
        mobile_number=data.get('mobileNumber'),
        bank_account_number=data.get('bankAccountNumber')
    )
    db.session.add(new_employee)
    db.session.commit()
    return jsonify(new_employee.serialize), 201

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], email=data['email'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

# app.py
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        login_user(user)
        return jsonify({'message': 'Login successful'})
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/logout', methods=['GET'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

if __name__ == '__main__':
    app.run()
