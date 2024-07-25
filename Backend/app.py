from flask import Flask, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from datetime import datetime
import logging

app = Flask(__name__)
app.debug = True
CORS(app, supports_credentials=True)

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

# User model
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    employees = db.relationship('Employee', backref='registrant', lazy=True)
    payrolls = db.relationship('Payroll', backref='user', lazy=True)

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
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

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
            'nssf': self.nssf
        }

# Payroll model
class Payroll(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    net_salary_status = db.Column(db.String(20), default='pending')
    paye_status = db.Column(db.String(20), default='pending')
    nssf_status = db.Column(db.String(20), default='pending')
    calculations = db.relationship('PayrollCalculation', backref='payroll', lazy=True)

    def __repr__(self):
        return f'<Payroll {self.year}-{self.month}>'

    def update_status(self, status_type, status_value):
        if status_type == 'net_salary':
            self.net_salary_status = status_value
        elif status_type == 'paye':
            self.paye_status = status_value
        elif status_type == 'nssf':
            self.nssf_status = status_value
        db.session.commit()

# PayrollCalculation model
class PayrollCalculation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    payroll_id = db.Column(db.Integer, db.ForeignKey('payroll.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    gross_salary = db.Column(db.Float, nullable=False)
    nssf = db.Column(db.Float, nullable=False)
    employer_nssf = db.Column(db.Float, nullable=False)  # Add this line
    paye = db.Column(db.Float, nullable=False)
    net_salary = db.Column(db.Float, nullable=False)
    

    def to_dict(self):
        return {
            'id': self.id,
            'payroll_id': self.payroll_id,
            'employee_id': self.employee_id,
            'gross_salary': self.gross_salary,
            'nssf': self.nssf,
            'employer_nssf': self.employer_nssf,  # Add this line
            'paye': self.paye,
            'net_salary': self.net_salary,
            
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

@app.route('/create-payroll', methods=['POST'])
@login_required
def create_payroll():
    data = request.get_json()
    new_payroll = Payroll(
        user_id=current_user.id,
        month=data['month'],
        year=data['year']
    )
    db.session.add(new_payroll)
    db.session.commit()
    return jsonify({'message': 'Payroll created successfully', 'payroll_id': new_payroll.id}), 201

@app.route('/calculate-salaries', methods=['POST'])
@login_required
def calculate_salaries():
    data = request.get_json()
    payroll_id = data['payroll_id']
    payroll = Payroll.query.get_or_404(payroll_id)
    
    if payroll.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized access'}), 403

    employees = Employee.query.filter_by(user_id=current_user.id).all()
    salary_details = []


    for employee in employees:
        salaries = employee.calculate_salaries()
        new_calculation = PayrollCalculation(
            payroll_id=payroll_id,
            employee_id=employee.id,
            gross_salary=employee.gross_salary,
            nssf=salaries['nssf'],
            employer_nssf=salaries['employer_nssf'],  # Add this line
            paye=salaries['paye'],
            net_salary=salaries['net_salary']
        )
        db.session.add(new_calculation)
        salary_details.append({
            'employee_id': employee.id,
            'gross_salary': employee.gross_salary,
            'nssf': salaries['nssf'],
            'employer_nssf': salaries['employer_nssf'],  # Add this line
            'paye': salaries['paye'],
            'net_salary': salaries['net_salary']
        })
        print(f"Saved salary for employee {employee.id}")  # Add this line for debugging

    db.session.commit()
    print("All salaries calculated and saved successfully")  # Add this line for debugging
    return jsonify({'message': 'Salaries calculated and saved successfully', 'data': salary_details}), 200

@app.route('/update-status', methods=['POST'])
@login_required
def update_status():
    data = request.get_json()
    payroll_id = data['payroll_id']
    status_type = data['status_type']
    status_value = data['status_value']
    
    payroll = Payroll.query.get_or_404(payroll_id)
    
    if payroll.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    payroll.update_status(status_type, status_value)
    return jsonify({'message': 'Status updated successfully'}), 200


@app.route('/make-payment', methods=['POST'])
@login_required
def make_payment():
    data = request.get_json()
    logging.info(f'Received payload: {data}')
    payment_type = data.get('type')
    payroll_id = data.get('payroll_id')
    if not payment_type or not payroll_id:
        return jsonify({'success': False, 'message': 'Payment type and payroll ID are required'}), 400

    try:
        payroll = Payroll.query.filter_by(id=payroll_id, user_id=current_user.id).first()
        if not payroll:
            return jsonify({'success': False, 'message': 'Payroll not found'}), 404
        
        if payment_type == 'netSalary':
            payroll.net_salary_status = 'Completed'
        elif payment_type == 'paye':
            payroll.paye_status = 'Completed'
        elif payment_type == 'nssf':
            payroll.nssf_status = 'Completed'
        else:
            return jsonify({'success': False, 'message': 'Invalid payment type'}), 400

        db.session.commit()
        return jsonify({'success': True, 'message': 'Payment completed successfully', 'status': {
            'netSalary': payroll.net_salary_status,
            'paye': payroll.paye_status,
            'nssf': payroll.nssf_status
        }})
    except Exception as e:
        db.session.rollback()
        logging.error(f'Error processing payment: {e}')  
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/payroll/<int:payroll_id>/calculations', methods=['GET'])
@login_required
def get_payroll_calculations(payroll_id):
    payroll = Payroll.query.get_or_404(payroll_id)
    if payroll.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized access'}), 403

    calculations = PayrollCalculation.query.filter_by(payroll_id=payroll_id).all()
    salary_details = []

    for calculation in calculations:
        employee = Employee.query.get(calculation.employee_id)
        salary_details.append({
            'employee_id': calculation.employee_id,
            'gross_salary': calculation.gross_salary,
            'net_salary': calculation.net_salary,
            'nssf': calculation.nssf,
            'employer_nssf': calculation.employer_nssf,  # Add this line
            'paye': calculation.paye,
            'payroll_id': calculation.payroll_id,
            'employee_name': employee.name,
            'tin_number': employee.tin_number,
            'nssf_number': employee.nssf_number,
            'preferred_payment_mode': employee.preferred_payment_mode,
            'mobile_number': employee.mobile_number,
            'bank_account_number': employee.bank_account_number,
        })

    return jsonify({
        'salary_details': salary_details,
        'payment_status': {
            'net_salary_status': payroll.net_salary_status,
            'paye_status': payroll.paye_status,
            'nssf_status': payroll.nssf_status
        }
    })



if __name__ == '__main__':
    app.run()
