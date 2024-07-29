import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'bootstrap';

const EmployeeList = ({ employees, setEmployees }) => {
  const navigate = useNavigate();
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://localhost:5000/employees', {
          credentials: 'include',
        });
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, [setEmployees]);

  const openPayrollModal = () => {
    const modal = new Modal(document.getElementById('payrollModal'));
    modal.show();
  };

  const closeModal = () => {
    const modal = Modal.getInstance(document.getElementById('payrollModal'));
    modal.hide();
  };

  const calculateSalaries = async (payrollId) => {
    try {
      const response = await fetch('http://localhost:5000/calculate-salaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ payroll_id: payrollId }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
        navigate(`/salary-details?payrollId=${payrollId}`);
      } else {
        const result = await response.json();
        console.error('Error calculating salaries:', result.message);
      }
    } catch (error) {
      console.error('Error calculating salaries:', error);
    }
  };

  const createPayroll = async () => {
    try {
      const response = await fetch('http://localhost:5000/create-payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ year, month }),
      });
      const result = await response.json();
      if (response.ok) {
        await calculateSalaries(result.payroll_id);
        closeModal();
      } else {
        console.error('Error creating payroll:', result.message);
      }
    } catch (error) {
      console.error('Error creating payroll:', error);
    }
  };

  const handleAddRowClick = () => {
    navigate('/'); 
  };

  return (
    <div className="col-md-12">
      <div className="card">
        <div className="card-header">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-primary btn-round ms-auto"
              onClick={handleAddRowClick}
            >
              <i className="fa fa-plus"></i>
              Add Row
            </button>
            {employees.length > 0 && (
              <button onClick={openPayrollModal} className="btn btn-label-info btn-round ms-3">
                Create Payroll
              </button>
            )}
          </div>
        </div>
        <div className="card-body">
          <div
            className="modal fade"
            id="addRowModal"
            tabIndex="-1"
            role="dialog"
            aria-hidden="true"
          >
          </div>
          <h4 className="card-title">Employees</h4>
          <div className="content">
            <div className="table-responsive">
              <table
                id="add-row"
                className="display table table-striped table-hover"
              >
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Gross Salary</th>
                    <th>TIN Number</th>
                    <th>NSSF Number</th>
                    <th>Preferred Payment Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee, index) => (
                    <tr key={employee.id}>
                      <td>{employee.name}</td>
                      <td>{employee.grossSalary}</td>
                      <td>{employee.tinNumber}</td>
                      <td>{employee.nssfNumber}</td>
                      <td>{employee.preferredPaymentMode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="payrollModal"
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">
                <span className="fw-mediumbold"> Create</span>
                <span className="fw-light"> Payroll </span>
              </h5>
              <button
                type="button"
                className="close"
                onClick={closeModal}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <p className="small">
                Enter the year and month for the payroll.
              </p>
              <form>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group form-group-default">
                      <label>Year</label>
                      <input
                        type="text"
                        className="form-control"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="Enter year"
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group form-group-default">
                      <label>Month</label>
                      <select
                          className="form-control"
                          value={month}
                          onChange={(e) => setMonth(e.target.value)}
                          placeholder="Select month"
                        >
                          <option value="" disabled>Select month</option>
                          {months.map((m, index) => (
                            <option key={index} value={m}>{m}</option>
                          ))}
                        </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-primary"
                onClick={createPayroll}
              >
                Save
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
