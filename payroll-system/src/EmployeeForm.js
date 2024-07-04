// src/components/EmployeeForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeForm = ({ employees, setEmployees, loggedIn }) => {
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    grossSalary: '',
    tinNumber: '',
    nssfNumber: '',
    preferredPaymentMode: 'Bank',
    mobileNumber: '',
    bankAccountNumber: '',
  });
  const navigate = useNavigate();

  const addEmployee = async () => {
    if (!loggedIn) {
      alert('You need to be logged in to add an employee');
      navigate('/login');
      return;
    }

    const response = await fetch('http://localhost:5000/employee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEmployee),
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      setEmployees([...employees, data]);
      setNewEmployee({
        name: '',
        grossSalary: '',
        tinNumber: '',
        nssfNumber: '',
        preferredPaymentMode: 'Bank',
        mobileNumber: '',
        bankAccountNumber: '',
      });
      navigate('/employees'); // Redirect to employee list after adding an employee
    } else {
      alert('Failed to add employee');
    }
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
      </div>
    </div>
  );
};

export default EmployeeForm;
