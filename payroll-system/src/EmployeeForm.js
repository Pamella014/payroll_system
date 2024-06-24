import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const computeSalary = (grossSalary) => {
  let paye;
  if (grossSalary <= 235000) {
    paye = 0;
  } else if (grossSalary <= 335000) {
    paye = (grossSalary - 235000) * 0.1;
  } else if (grossSalary <= 410000) {
    paye = ((grossSalary - 335000) * 0.2) + 10000;
  } else if (grossSalary <= 10000000) {
    paye = ((grossSalary - 410000) * 0.3) + 25000;
  } else {
    paye = ((grossSalary - 410000) * 0.3) + 25000 + ((grossSalary - 10000000) * 0.1);
  }
  const nssf = grossSalary * 0.05;
  const netSalary = grossSalary - paye - nssf;
  return { paye, nssf, netSalary };
};

const EmployeeForm = ({ employees, setEmployees }) => {
  const [newEmployee, setNewEmployee] = useState({ 
    name: '', 
    grossSalary: '', 
    tinNumber: '', 
    nssfNumber: '', 
    preferredPaymentMode: 'Bank',
    mobileNumber: '',
    bankAccountNumber: ''
  });
  const navigate = useNavigate();

  const addEmployee = () => {
    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees)); // Update local storage
    setNewEmployee({ 
      name: '', 
      grossSalary: '', 
      tinNumber: '', 
      nssfNumber: '', 
      preferredPaymentMode: 'Bank',
      mobileNumber: '',
      bankAccountNumber: ''
    });
  };

  const calculateSalaries = () => {
    const details = employees.map(employee => {
      const { paye, nssf, netSalary } = computeSalary(parseFloat(employee.grossSalary));
      return { ...employee, paye, nssf, netSalary };
    });
    navigate('/salary-details', { state: { salaryDetails: details } });
  };

  return (
    <div>
      <div className="sidebar">
        <ul>
          <li className="active">Add Employee</li>
          <li>
            <a href="/employees">View Employees</a>
          </li>
        </ul>
      </div>

      <div className="header">
        <h1>Employee Payroll System</h1>
      </div>

      <div className="content">
        <div className="input-container">
          <label>Employee Name:</label>
          <input
            type="text"
            placeholder="Employee Name"
            value={newEmployee.name}
            onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
          />
        </div>
        <div className="input-container">
          <label>Employee Salary:</label>
          <input
            type="number"
            placeholder="Gross Salary"
            value={newEmployee.grossSalary}
            onChange={e => setNewEmployee({ ...newEmployee, grossSalary: e.target.value })}
          />
        </div>
        <div className="input-container">
          <label>TIN Number:</label>
          <input
            type="text"
            placeholder="TIN Number"
            value={newEmployee.tinNumber}
            onChange={e => setNewEmployee({ ...newEmployee, tinNumber: e.target.value })}
          />
        </div>
        <div className="input-container">
          <label>NSSF Number:</label>
          <input
            type="text"
            placeholder="NSSF Number"
            value={newEmployee.nssfNumber}
            onChange={e => setNewEmployee({ ...newEmployee, nssfNumber: e.target.value })}
          />
        </div>
        <div className="input-container">
          <label>Preferred Mode of Payment:</label>
          <select
            value={newEmployee.preferredPaymentMode}
            onChange={e => setNewEmployee({ ...newEmployee, preferredPaymentMode: e.target.value })}
          >
            <option value="Bank">Bank</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Wallet">Wallet</option>
          </select>
        </div>
        {newEmployee.preferredPaymentMode === 'Mobile Money' && (
          <div className="input-container">
            <label>Mobile Number:</label>
            <input
              type="text"
              placeholder="Mobile Number"
              value={newEmployee.mobileNumber}
              onChange={e => setNewEmployee({ ...newEmployee, mobileNumber: e.target.value })}
            />
          </div>
        )}
        {newEmployee.preferredPaymentMode === 'Bank' && (
          <div className="input-container">
            <label>Bank Account Number:</label>
            <input
              type="text"
              placeholder="Bank Account Number"
              value={newEmployee.bankAccountNumber}
              onChange={e => setNewEmployee({ ...newEmployee, bankAccountNumber: e.target.value })}
            />
          </div>
        )}
        <div className='add-button'>
          <button onClick={addEmployee}>Add Employee</button>
        </div>

        <div className="button-container">
          {employees.length > 0 && (
            <button onClick={calculateSalaries}>Calculate Salaries</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
