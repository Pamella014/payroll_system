import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmployeeForm from './EmployeeForm';
import EmployeeList from './EmployeeList';
import SalaryDetails from './SalaryDetails';
import './App.css';

const App = () => {
  const [employees, setEmployees] = useState(() => {
    // Initialize state with local storage data
    const storedEmployees = localStorage.getItem('employees');
    return storedEmployees ? JSON.parse(storedEmployees) : [];
  });

  useEffect(() => {
    // Update localStorage whenever employees state changes
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={<EmployeeForm employees={employees} setEmployees={setEmployees} />} 
          />
          <Route 
            path="/employees" 
            element={<EmployeeList employees={employees} />} 
          />
          <Route 
            path="/salary-details" 
            element={<SalaryDetails />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
