import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "./config";

const EmployeeForm = ({ employees, setEmployees }) => {
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    grossSalary: "",
    tinNumber: "",
    nssfNumber: "",
    residentStatus:"Resident",
    workPermit:"",
    preferredPaymentMode: "Bank",
    mobileNumber: "",
    bankAccountNumber: "",
    housingAllowance: 0,
    otherAllowances: 0,
    transportAllowance: 0,
    medicalAllowance: 0,
    leaveAllowance: 0,
    overtimeAllowance: 0,
    otherAllowance: 0,
    housingBenefits: 0,
    motorVehicleBenefits: 0,
    domesticServantsBenefits: 0,
    otherBenefits: 0,
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

    const response = await fetch(`${config.apiBaseUrl}/employee`, {
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
        housingAllowance: "",
        otherAllowances: "",
        transportAllowance: "",
        medicalAllowance: "",
        leaveAllowance: "",
        overtimeAllowance: "",
        otherAllowance: "",
        housingBenefits: "",
        motorVehicleBenefits: "",
        domesticServantsBenefits: "",
        otherBenefits: "",
      });
      navigate("/employees");
    } else {
      alert("Failed to add employee");
    }
  };
  console.log(newEmployee)

  return (
    <div className="d-flex justify-content-center">
      <div className="col-md-12 col-lg-8">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Employee Information Form</h4>
            <form className="forms-sample">
              <div className="row">
                <div className="col-md-6 col-lg-5">
                <label class="mb-3"><b>Employee Details</b></label>
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
                  <div class="form-group">
                          <label for="exampleFormControlSelect1"
                            >Resident Status</label
                          >
                          <select
                            class="form-select"
                            id="exampleFormControlSelect1"
                            placeholder="Work Permit"
                            value={newEmployee.residentStatus}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                residentStatus: e.target.value,
                              })
                            }
                          >
                            <option>Resident</option>
                            <option>Non-Resident</option>
                          </select>
                        </div>
                        <div className="form-group">
                    <label htmlFor="workPermit">Work Permit:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="workPermit"
                      placeholder="Work Permit"
                      value={newEmployee.workPermit}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          workPermit: e.target.value,
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
                </div>
                
                <div className="col-md-6 col-lg-5">
                <label class="mb-3"><b>Other Allowances</b></label>
                  <div className="form-group">
                    <label htmlFor="housingAllowance">Housing Allowance:</label>
                    <input
                      type="number"
                      className="form-control"
                      id="housingAllowance"
                      placeholder="Housing Allowance"
                      value={newEmployee.housingAllowance}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          housingAllowance: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="otherAllowances">
                      Other Taxable Allowances (Specify):
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="otherAllowances"
                      placeholder="Other Allowances"
                      value={newEmployee.otherAllowances}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          otherAllowances: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="transportAllowance">Transport Allowance:</label>
                    <input
                      type="number"
                      className="form-control"
                      id="transportAllowance"
                      placeholder="Transport Allowance"
                      value={newEmployee.transportAllowance}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          transportAllowance: e.target.value,
                        })
                      }
                    />
                  </div>
                 
                  <label class="mb-3"><b>Other Benefits</b></label>
                  <div className="form-group">
                    <label htmlFor="housingBenefits">Housing Benefits:</label>
                    <input
                      type="number"
                      className="form-control"
                      id="housingBenefits"
                      placeholder="Housing Benefits"
                      value={newEmployee.housingBenefits}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          housingBenefits: e.target.value,
                        })
                      }
                    />
                  </div>
                  {/* <div className="form-group">
                    <label htmlFor="medicalAllowance">Medical Allowance:</label>
                    <input
                      type="number"
                      className="form-control"
                      id="medicalAllowance"
                      placeholder="Medical Allowance"
                      value={newEmployee.medicalAllowance}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          medicalAllowance: e.target.value,
                        })
                      }
                    />
                  </div> */}
                  {/* <div className="form-group">
                    <label htmlFor="leaveAllowance">Leave Allowance:</label>
                    <input
                      type="number"
                      className="form-control"
                      id="leaveAllowance"
                      placeholder="Leave Allowance"
                      value={newEmployee.leaveAllowance}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          leaveAllowance: e.target.value,
                        })
                      }
                    />
                  </div> */}
                </div>
                {/* <div className="col-md-6 col-lg-4">
                  <div className="form-group">
                    <label htmlFor="overtimeAllowance">Overtime Allowance:</label>
                    <input
                      type="number"
                      className="form-control"
                      id="overtimeAllowance"
                      placeholder="Overtime Allowance"
                      value={newEmployee.overtimeAllowance}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          overtimeAllowance: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="otherAllowance">Other Allowance:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="otherAllowance"
                      placeholder="Other Allowance"
                      value={newEmployee.otherAllowance}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          otherAllowance: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="housingBenefits">Housing Benefits:</label>
                    <input
                      type="number"
                      className="form-control"
                      id="housingBenefits"
                      placeholder="Housing Benefits"
                      value={newEmployee.housingBenefits}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          housingBenefits: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="motorVehicleBenefits">Motor Vehicle Benefits:</label>
                    <input
                      type="number"
                      className="form-control"
                      id="motorVehicleBenefits"
                      placeholder="Motor Vehicle Benefits"
                      value={newEmployee.motorVehicleBenefits}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          motorVehicleBenefits: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="domesticServantsBenefits">
                      Domestic Servants Benefits:
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="domesticServantsBenefits"
                      placeholder="Domestic Servants Benefits"
                      value={newEmployee.domesticServantsBenefits}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          domesticServantsBenefits: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="otherBenefits">Other Benefits:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="otherBenefits"
                      placeholder="Other Benefits"
                      value={newEmployee.otherBenefits}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          otherBenefits: e.target.value,
                        })
                      }
                    />
                  </div>
                </div> */}
              </div>
              <button type="button" className="btn btn-primary" onClick={addEmployee}>
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
