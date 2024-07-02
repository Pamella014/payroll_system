from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate, migrate
from flask_cors import CORS

app = Flask(__name__)
app.debug = True
CORS(app)

# adding configuration for using a sqlite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'

# Creating an SQLAlchemy instance
db = SQLAlchemy(app)

# Settings for migrations
migrate = Migrate(app, db)

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
def get_employees():
    employees = Employee.query.all()
    return jsonify([employee.serialize for employee in employees])

@app.route('/employee', methods=['POST'])
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


if __name__ == '__main__':
    app.run()
