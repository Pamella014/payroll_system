import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmployeeForm from './EmployeeForm';
import EmployeeList from './EmployeeList';
import SalaryDetails from './SalaryDetails';
import './App.css';

const App = () => {
  const [employees, setEmployees] = useState([]);

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
            element={<EmployeeList employees={employees} setEmployees={setEmployees}/>} 
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
