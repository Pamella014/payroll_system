// src/components/sideBar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar" data-background-color="dark">
        <div className="sidebar-logo">
          <div className="logo-header" data-background-color="dark">
            <a href="index.html" className="logo">
              <img
                src="kaiadmin/assets/img/kaiadmin/logo_light.svg"
                alt="navbar brand"
                className="navbar-brand"
                height="20"
              />
            </a>
            <div className="nav-toggle">
              <button className="btn btn-toggle toggle-sidebar">
                <i className="gg-menu-right"></i>
              </button>
              <button className="btn btn-toggle sidenav-toggler">
                <i className="gg-menu-left"></i>
              </button>
            </div>
            <button className="topbar-toggler more">
              <i className="gg-more-vertical-alt"></i>
            </button>
          </div>
        </div>
        <div className="sidebar-wrapper scrollbar scrollbar-inner">
          <div className="sidebar-content">
            <ul className="nav nav-secondary">
            <li className="nav-item">
              <Link to="/">
                <i className="fas fa-pen-square"></i>
                <p>Register Employee</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/employees">
                <i className="fas fa-users"></i>
                <p>Employees</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/payroll/history">
                <i className="fas fa-history"></i>
                <p>Payroll History</p>
              </Link>
            </li>
              
            </ul>
          </div>
        </div>
      </div>
  );
};

export default Sidebar;
