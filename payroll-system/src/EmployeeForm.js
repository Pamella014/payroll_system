import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "./config";

const EmployeeForm = ({ employees, setEmployees }) => {
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    grossSalary: "",
    tinNumber: "",
    nssfNumber: "",
    preferredPaymentMode: "Bank",
    mobileNumber: "",
    bankAccountNumber: "",
  });
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    setLoggedIn(isLoggedIn);
  }, []);

  const addEmployee = async () => {
    if (!loggedIn) {
      alert("You need to be logged in to add an employee");
      navigate("/login");
      return;
    }

    const response = await fetch(`${config.apiBaseUrlProd}/employee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEmployee),
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      setEmployees([...employees, data]);
      setNewEmployee({
        name: "",
        grossSalary: "",
        tinNumber: "",
        nssfNumber: "",
        preferredPaymentMode: "Bank",
        mobileNumber: "",
        bankAccountNumber: "",
      });
      navigate("/employees");
    } else {
      alert("Failed to add employee");
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="col-md-6 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Employee Information Form</h4>
            <p className="card-description">Enter employee details</p>
            <form className="forms-sample">
              <div className="form-group">
                <label htmlFor="employeeName">Employee Name:</label>
                <input
                  type="text"
                  className="form-control"
                  id="employeeName"
                  placeholder="Employee Name"
                  value={newEmployee.name}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="employeeSalary">Employee Salary:</label>
                <input
                  type="number"
                  className="form-control"
                  id="employeeSalary"
                  placeholder="Gross Salary"
                  value={newEmployee.grossSalary}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      grossSalary: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="tinNumber">TIN Number:</label>
                <input
                  type="text"
                  className="form-control"
                  id="tinNumber"
                  placeholder="TIN Number"
                  value={newEmployee.tinNumber}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      tinNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="nssfNumber">NSSF Number:</label>
                <input
                  type="text"
                  className="form-control"
                  id="nssfNumber"
                  placeholder="NSSF Number"
                  value={newEmployee.nssfNumber}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      nssfNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="preferredPaymentMode">
                  Preferred Mode of Payment:
                </label>
                <select
                  className="form-control"
                  id="preferredPaymentMode"
                  value={newEmployee.preferredPaymentMode}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      preferredPaymentMode: e.target.value,
                    })
                  }
                >
                  <option value="Bank">Bank</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Wallet">Wallet</option>
                </select>
              </div>
              {newEmployee.preferredPaymentMode === "Mobile Money" && (
                <div className="form-group">
                  <label htmlFor="mobileNumber">Mobile Number:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="mobileNumber"
                    placeholder="Mobile Number"
                    value={newEmployee.mobileNumber}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        mobileNumber: e.target.value,
                      })
                    }
                  />
                </div>
              )}
              {newEmployee.preferredPaymentMode === "Bank" && (
                <div className="form-group">
                  <label htmlFor="bankAccountNumber">
                    Bank Account Number:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="bankAccountNumber"
                    placeholder="Bank Account Number"
                    value={newEmployee.bankAccountNumber}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        bankAccountNumber: e.target.value,
                      })
                    }
                  />
                </div>
              )}
              <button
                type="button"
                className="btn btn-primary mr-2"
                onClick={addEmployee}
              >
                Add Employee
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
