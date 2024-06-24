import React from 'react';
import { useNavigate } from 'react-router-dom';
import computeSalary from './ComputeSalary';// Ensure you have this utility function

const EmployeeList = ({ employees }) => {
  const navigate = useNavigate();

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
          <li>
            <a href="/">Add Employee</a>
          </li>
          <li className="active">View Employees</li>
        </ul>
      </div>

      <div className="header">
        <h2>Employees</h2>
      </div>

      <div className="content">
        {employees.length > 0 && (
          <div className='button-container'>
            <button onClick={calculateSalaries}>Calculate Salaries</button>
          </div>
        )}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Gross Salary</th>
                <th>TIN Number</th>
                <th>NSSF Number</th>
                <th>Preferred Payment Mode</th>
                <th>Mobile Number</th>
                <th>Bank Account Number</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr key={index}>
                  <td>{employee.name}</td>
                  <td>{employee.grossSalary}</td>
                  <td>{employee.tinNumber}</td>
                  <td>{employee.nssfNumber}</td>
                  <td>{employee.preferredPaymentMode}</td>
                  <td>{employee.mobileNumber}</td>
                  <td>{employee.bankAccountNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
