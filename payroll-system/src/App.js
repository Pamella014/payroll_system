import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EmployeeForm from './EmployeeForm';
import EmployeeList from './EmployeeList';
import SalaryDetails from './SalaryDetails';
import Login from './Authentication/login';
import Register from './Authentication/Register';
import Sidebar from './Components/sideBar';
import Footer from './Components/footer';
import Header from './Components/header';

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    setLoggedIn(isLoggedIn);
  }, []);

  const handleLogin = () => {
    setLoggedIn(true);
    localStorage.setItem('loggedIn', 'true');
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('loggedIn');
  };

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setLoggedIn={handleLogin} />} />
        <Route
          path="/*"
          element={
            loggedIn ? (
              <div className="wrapper">
                <Sidebar />
                <div className="main-panel">
                  <Header setLoggedIn={handleLogout} />
                  <div className="container">
                    <div className="page-inner">
                      <Routes>
                        <Route path="/" element={<EmployeeForm employees={employees} setEmployees={setEmployees} />} />
                        <Route path="/employees" element={<EmployeeList employees={employees} setEmployees={setEmployees} />} />
                        <Route path="/salary-details" element={<SalaryDetails />} />
                      </Routes>
                    </div>
                  </div>
                  <Footer />
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
