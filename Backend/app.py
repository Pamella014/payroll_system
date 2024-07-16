from flask import Flask, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from datetime import datetime

app = Flask(__name__)
app.debug = True
CORS(app,supports_credentials=True)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False 

# Extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Payment model
class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    payment_type = db.Column(db.String(50), nullable=False)  # net_salary, paye, nssf
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='Pending')  # Pending, Completed
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f"<Payment(id={self.id}, employee_id={self.employee_id}, payment_type={self.payment_type}, amount={self.amount}, status={self.status})>"

    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'payment_type': self.payment_type,
            'amount': self.amount,
            'status': self.status,
            'timestamp': self.timestamp,
            'employee': {
                'name': self.employee.name
            }
        }

# User model
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    employees = db.relationship('Employee', backref='registrant', lazy=True) 

    def __repr__(self):
        return f'<User {self.username}>'

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
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Add this line 
    payments = db.relationship('Payment', backref='employee', lazy=True)

    @property
    def net_salary(self):
            return self.calculate_salaries()['net_salary']

    @property
    def paye(self):
            return self.calculate_salaries()['paye']

    @property
    def nssf(self):
            return self.calculate_salaries()['nssf']

    def calculate_salaries(self):
        gross_salary = self.gross_salary
        if gross_salary <= 235000:
                paye = 0
        elif gross_salary <= 335000:
                paye = (gross_salary - 235000) * 0.1
        elif gross_salary <= 410000:
                paye = ((gross_salary - 335000) * 0.2) + 10000
        elif gross_salary <= 10000000:
                paye = ((gross_salary - 410000) * 0.3) + 25000
        else:
                paye = ((gross_salary - 410000) * 0.3) + 25000 + ((gross_salary - 10000000) * 0.1)
            
        nssf = gross_salary * 0.05
        employer_nssf = gross_salary * 0.1
        net_salary = gross_salary - paye - nssf

        return {'paye': paye, 'nssf': nssf, 'net_salary': net_salary, 'employer_nssf': employer_nssf}

    def to_dict(self):
            return {
                'id': self.id,
                'name': self.name,
                'grossSalary': self.gross_salary,
                'tinNumber': self.tin_number,
                'nssfNumber': self.nssf_number,
                'preferredPaymentMode': self.preferred_payment_mode,
                'mobileNumber': self.mobile_number,
                'bankAccountNumber': self.bank_account_number,
                'netSalary': self.net_salary,
                'paye': self.paye,
                'nssf': self.nssf,
            }

@app.route('/employees', methods=['GET'])
@login_required
def get_employees():
    employees = Employee.query.filter_by(user_id=current_user.id).all()
    return jsonify([employee.to_dict() for employee in employees])

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
        bank_account_number=data.get('bankAccountNumber'),
        user_id=current_user.id 
    )
    db.session.add(new_employee)
    db.session.commit()
    return jsonify(new_employee.to_dict()), 201

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

@app.route('/login-status', methods=['GET'])
def login_status():
  if current_user.is_authenticated:
        return jsonify({
            'loggedIn': True,
            'user': {
                'username': current_user.username,
                'email': current_user.email
            }
        })
  else:
        return jsonify({'loggedIn': False})
  


@app.route('/employee/<int:id>/salary', methods=['GET'])
@login_required
def get_employee_salary(id):
    employee = Employee.query.get_or_404(id)
    if employee.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized access'}), 403

    return jsonify(employee.to_dict())


@app.route('/payments', methods=['POST'])
@login_required
def add_payment():
    data = request.get_json()
    new_payment = Payment(
        employee_id=data['employeeId'],
        payment_type=data['paymentType'],
        amount=data['amount'],
        status='Completed' if data['amount'] > 0 else 'Pending'
    )
    db.session.add(new_payment)
    db.session.commit()
    return jsonify(new_payment.to_dict()), 201


@app.route('/payments', methods=['GET'])
@login_required
def get_payments():
    payments = Payment.query.join(Employee).filter(Employee.user_id == current_user.id).all()
    return jsonify([payment.to_dict() for payment in payments])

if __name__ == '__main__':
    app.run()
