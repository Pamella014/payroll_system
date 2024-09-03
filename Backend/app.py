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
    tin_number = db.Column(db.String(20), unique=True, nullable=True) 
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
    resident_status = db.Column(db.String(20), nullable=False, default="Resident")  # 'Resident' or 'Non-Resident'
    work_permit_number = db.Column(db.String(100), nullable=True)
    preferred_payment_mode = db.Column(db.String(100), nullable=False)
    mobile_number = db.Column(db.String(100), nullable=True)
    bank_account_number = db.Column(db.String(100), nullable=True)
    
    # New fields with default values of 0
    housing_allowance = db.Column(db.Float, default=0)
    transport_allowance = db.Column(db.Float, default=0)
    medical_allowance = db.Column(db.Float, default=0)
    leave_allowance = db.Column(db.Float, default=0)
    overtime_allowance = db.Column(db.Float, default=0)
    other_allowance = db.Column(db.Float, default=0)
    
    housing_benefit = db.Column(db.Float, default=0)
    motor_vehicle_benefit = db.Column(db.Float, default=0)
    domestic_servant_benefit = db.Column(db.Float, default=0)
    other_benefit = db.Column(db.Float, default=0)
    
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
       
        if self.resident_status == 'Resident':
            # Resident PAYE calculation
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
        else:
            # Non-Resident PAYE calculation
            if gross_salary <= 4020000:
                paye = (gross_salary * 0.1) / 12
            elif gross_salary <= 4920000:
                paye = (402000 + (gross_salary - 4020000) * 0.2) / 12
            elif gross_salary <= 120000000:
                paye = (582000 + (gross_salary - 4920000) * 0.3) / 12
            else:
                paye = (35106000 + (gross_salary - 120000000) * 0.4) / 12

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
            'residentStatus': self.resident_status,
            'workPermitNumber': self.work_permit_number,
            'housingAllowance': self.housing_allowance,
            'transportAllowance': self.transport_allowance,
            'medicalAllowance': self.medical_allowance,
            'leaveAllowance': self.leave_allowance,
            'overtimeAllowance': self.overtime_allowance,
            'otherAllowance': self.other_allowance,
            'housingBenefit': self.housing_benefit,
            'motorVehicleBenefit': self.motor_vehicle_benefit,
            'domesticServantBenefit': self.domestic_servant_benefit,
            'otherBenefit': self.other_benefit,
            'netSalary': self.calculate_salaries()['net_salary'],
            'paye': self.calculate_salaries()['paye'],
            'nssf': self.calculate_salaries()['nssf']
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

#Payment Model
class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    payroll_id = db.Column(db.Integer, db.ForeignKey('payroll.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    employee_name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_type = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    gross_salary = db.Column(db.Float, nullable=False)
    net_salary = db.Column(db.Float, nullable=False)
    nssf = db.Column(db.Float, nullable=False)
    employer_nssf = db.Column(db.Float, nullable=False)
    paye = db.Column(db.Float, nullable=False)
    tin_number = db.Column(db.String(100), nullable=False)
    nssf_number = db.Column(db.String(100), nullable=False)
    preferred_payment_mode = db.Column(db.String(100), nullable=False)
    mobile_number = db.Column(db.String(100), nullable=True)
    bank_account_number = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'payroll_id': self.payroll_id,
            'employee_id': self.employee_id,
            'employee_name': self.employee_name,
            'amount': self.amount,
            'payment_type': self.payment_type,
            'date': self.date.strftime("%Y-%m-%d %H:%M:%S"),
            'gross_salary': self.gross_salary,
            'net_salary': self.net_salary,
            'nssf': self.nssf,
            'employer_nssf': self.employer_nssf,
            'paye': self.paye,
            'tin_number': self.tin_number,
            'nssf_number': self.nssf_number,
            'preferred_payment_mode': self.preferred_payment_mode,
            'mobile_number': self.mobile_number,
            'bank_account_number': self.bank_account_number,
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
        resident_status=data.get('residentStatus', 'Resident'),  # Default to 'Resident'
        work_permit_number=data.get('workPermitNumber'),
        preferred_payment_mode=data['preferredPaymentMode'],
        mobile_number=data.get('mobileNumber'),
        bank_account_number=data.get('bankAccountNumber'),
        
        # Allowances and benefits with default values of 0 if not provided
        housing_allowance=data.get('housingAllowance', 0),
        transport_allowance=data.get('transportAllowance', 0),
        medical_allowance=data.get('medicalAllowance', 0),
        leave_allowance=data.get('leaveAllowance', 0),
        overtime_allowance=data.get('overtimeAllowance', 0),
        other_allowance=data.get('otherAllowance', 0),
        
        housing_benefit=data.get('housingBenefit', 0),
        motor_vehicle_benefit=data.get('motorVehicleBenefit', 0),
        domestic_servant_benefit=data.get('domesticServantBenefit', 0),
        other_benefit=data.get('otherBenefit', 0),
        
        user_id=current_user.id
    )
    
    db.session.add(new_employee)
    db.session.commit()
    
    return jsonify(new_employee.to_dict()), 201


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Extract fields from the request data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    tin_number = data.get('tin_number')

    # Validate the presence of required fields
    if not username or not email or not password or not tin_number:
        return jsonify({'message': 'Missing required fields'}), 400

    # Check if the username or email already exists
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 400

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create a new user instance
    new_user = User(
        username=username,
        email=email,
        tin_number=tin_number,  # Include the TIN number
        password=hashed_password
    )

    # Add the new user to the database and commit
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({'message': 'Error occurred during registration'}), 500


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
            'employer_nssf': salaries['employer_nssf'],  
            'paye': salaries['paye'],
            'net_salary': salaries['net_salary'],
            'housingAllowance': employee.housing_allowance,
            'transportAllowance': employee.transport_allowance,
            'medicalAllowance': employee.medical_allowance,
            'leaveAllowance': employee.leave_allowance,
            'overtimeAllowance': employee.overtime_allowance,
            'otherAllowance': employee.other_allowance,
            'housingBenefit': employee.housing_benefit,
            'motorVehicleBenefit': employee.motor_vehicle_benefit,
            'domesticServantBenefit': employee.domestic_servant_benefit,
            'otherBenefit': employee.other_benefit
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
            'housingAllowance': employee.housing_allowance,
            'transportAllowance': employee.transport_allowance,
            'medicalAllowance': employee.medical_allowance,
            'leaveAllowance': employee.leave_allowance,
            'overtimeAllowance': employee.overtime_allowance,
            'otherAllowance': employee.other_allowance,
            'housingBenefit': employee.housing_benefit,
            'motorVehicleBenefit': employee.motor_vehicle_benefit,
            'domesticServantBenefit': employee.domestic_servant_benefit,
            'otherBenefit': employee.other_benefit
        })

    return jsonify({
        'salary_details': salary_details,
        'payment_status': {
            'net_salary_status': payroll.net_salary_status,
            'paye_status': payroll.paye_status,
            'nssf_status': payroll.nssf_status
        }
    })
@app.route('/make-payment', methods=['POST'])
@login_required
def make_payment():
    data = request.get_json()
    logging.info(f'Received payload: {data}')
    
    if not data:
        logging.error('No data received')
        return jsonify({'success': False, 'message': 'No data received'}), 400

    payment_type = data.get('type')
    payroll_id = data.get('payroll_id')

    logging.info(f'Payment Type: {payment_type}, Payroll ID: {payroll_id}')
    
    if not payment_type or not payroll_id:
        logging.error('Missing payment type or payroll ID')
        return jsonify({'success': False, 'message': 'Payment type and payroll ID are required'}), 400

    try:
        payroll = Payroll.query.filter_by(id=payroll_id, user_id=current_user.id).first()
        if not payroll:
            logging.error('Payroll not found')
            return jsonify({'success': False, 'message': 'Payroll not found'}), 404

        if payment_type not in ['netSalary', 'paye', 'nssf']:
            logging.error('Invalid payment type')
            return jsonify({'success': False, 'message': 'Invalid payment type'}), 400

        # Update the status
        if payment_type == 'netSalary':
            payroll.net_salary_status = 'Completed'
        elif payment_type == 'paye':
            payroll.paye_status = 'Completed'
        elif payment_type == 'nssf':
            payroll.nssf_status = 'Completed'

        # Mapping for the correct attribute names
        attribute_mapping = {
            'netSalary': 'net_salary',
            'paye': 'paye',
            'nssf': 'nssf'
        }

        # Save payment details for each employee
        calculations = PayrollCalculation.query.filter_by(payroll_id=payroll_id).all()
        for calculation in calculations:
            employee = Employee.query.get(calculation.employee_id)
            payment = Payment(
                payroll_id=payroll_id,
                employee_id=employee.id,
                employee_name=employee.name,
                amount=getattr(calculation, attribute_mapping[payment_type]),  # Correct attribute name
                payment_type=payment_type,
                gross_salary=calculation.gross_salary,
                net_salary=calculation.net_salary,
                nssf=calculation.nssf,
                employer_nssf=calculation.employer_nssf,
                paye=calculation.paye,
                tin_number=employee.tin_number,
                nssf_number=employee.nssf_number,
                preferred_payment_mode=employee.preferred_payment_mode,
                mobile_number=employee.mobile_number,
                bank_account_number=employee.bank_account_number,
            )
            db.session.add(payment)

        db.session.commit()
        logging.info('Payment completed successfully')
        return jsonify({'success': True, 'message': 'Payment completed successfully', 'status': {
            'netSalary': payroll.net_salary_status,
            'paye': payroll.paye_status,
            'nssf': payroll.nssf_status
        }})
    except Exception as e:
        db.session.rollback()
        logging.error(f'Error processing payment: {e}')  
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/payroll/history', methods=['GET'])
@login_required
def get_payroll_history():
    payrolls = Payroll.query.filter_by(user_id=current_user.id).all()
    payroll_history = []

    for payroll in payrolls:
        calculations = PayrollCalculation.query.filter_by(payroll_id=payroll.id).all()
        payments = Payment.query.filter_by(payroll_id=payroll.id).all()
        
        salary_details = [
            {
                'employee_id': calc.employee_id,
                'gross_salary': calc.gross_salary,
                'net_salary': calc.net_salary,
                'nssf': calc.nssf,
                'employer_nssf': calc.employer_nssf,
                'paye': calc.paye,
                'payroll_id': calc.payroll_id,
                'employee_name': Employee.query.get(calc.employee_id).name,
                'tin_number': Employee.query.get(calc.employee_id).tin_number,
                'nssf_number': Employee.query.get(calc.employee_id).nssf_number,
                'preferred_payment_mode': Employee.query.get(calc.employee_id).preferred_payment_mode,
                'mobile_number': Employee.query.get(calc.employee_id).mobile_number,
                'bank_account_number': Employee.query.get(calc.employee_id).bank_account_number,
            }
            for calc in calculations
        ]

        payment_details = [payment.to_dict() for payment in payments]

        payroll_history.append({
            'payroll_id': payroll.id,
            'month': payroll.month,
            'year': payroll.year,
            'net_salary_status': payroll.net_salary_status,
            'paye_status': payroll.paye_status,
            'nssf_status': payroll.nssf_status,
            'salary_details': salary_details,
            'payment_details': payment_details
        })

    return jsonify({'payroll_history': payroll_history})



if __name__ == '__main__':
    app.run()
