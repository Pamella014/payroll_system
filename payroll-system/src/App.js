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
import axios from 'axios';

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    setLoggedIn(isLoggedIn);
  }, []);

  const handleLogin = () => {
    setLoggedIn(true);
    localStorage.setItem('loggedIn', 'true');
    axios.get('http://localhost:5000/login-status', { withCredentials: true })
      .then(response => {
        if (response.data.loggedIn) {
          // console.log(response.dat)

          setUser(response.data.user);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('loggedIn');
    setUser({})
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
                  <Header setLoggedIn={handleLogout} user={user} />
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
