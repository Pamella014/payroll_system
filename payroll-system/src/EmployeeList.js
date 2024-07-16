import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import computeSalary from './ComputeSalary';// Ensure you have this utility function

const EmployeeList = ({ employees, setEmployees }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://localhost:5000/employees', {
          credentials: 'include',  // Ensure cookies are sent
        });
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, [setEmployees]);


  const calculateSalaries = () => {
    const details = employees.map(employee => {
      const { paye, nssf, netSalary, employerNssf } = computeSalary(parseFloat(employee.grossSalary));
      return { ...employee, paye, nssf, netSalary,employerNssf };
    });
    navigate('/salary-details', { state: { salaryDetails: details } });
  };

  return (
    // <div className="col-lg-6 grid-margin stretch-card">
    <div className="col-md-12">
    <div className="card">
      <div className="card-header">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-primary btn-round ms-auto"
            data-bs-toggle="modal"
            data-bs-target="#addRowModal"
          >
            <i className="fa fa-plus"></i>
            Add Row
          </button>
          {/* <div className="ms-md-auto py-2 py-md-0"> */}
            {employees.length > 0 && (
            <button onClick={calculateSalaries} className="btn btn-label-info btn-round ms-3">
            Calculate Salaries
          </button>                )}
                {/* <a href="#" className="btn btn-primary btn-round">Add Customer</a> */}
              {/* </div> */}
        </div>
      </div>
        <div className="card-body">
        <div
                      className="modal fade"
                      id="addRowModal"
                      tabindex="-1"
                      role="dialog"
                      aria-hidden="true"
                    >
                      <div className="modal-dialog" role="document">
                        <div className="modal-content">
                          <div className="modal-header border-0">
                            <h5 className="modal-title">
                              <span className="fw-mediumbold"> New</span>
                              <span className="fw-light"> Row </span>
                            </h5>
                            <button
                              type="button"
                              className="close"
                              data-dismiss="modal"
                              aria-label="Close"
                            >
                              <span aria-hidden="true">&times;</span>
                            </button>
                          </div>
                          <div className="modal-body">
                            <p className="small">
                              Create a new row using this form, make sure you
                              fill them all
                            </p>
                            <form>
                              <div className="row">
                                <div className="col-sm-12">
                                  <div className="form-group form-group-default">
                                    <label>Employee Name</label>
                                    <input
                                      id="addName"
                                      type="text"
                                      className="form-control"
                                      placeholder="fill name"
                                    />
                                  </div>
                                </div>
                                <div className="col-md-6 pe-0">
                                  <div className="form-group form-group-default">
                                    <label>Position</label>
                                    <input
                                      id="addPosition"
                                      type="text"
                                      className="form-control"
                                      placeholder="fill position"
                                    />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group form-group-default">
                                    <label>Office</label>
                                    <input
                                      id="addOffice"
                                      type="text"
                                      className="form-control"
                                      placeholder="fill office"
                                    />
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                          <div className="modal-footer border-0">
                            <button
                              type="button"
                              id="addRowButton"
                              className="btn btn-primary"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              data-dismiss="modal"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
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
                                {/* <th>Mobile Number</th>
                                {/* <th>Bank Account Number</th> */}
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
                                    {/* <td>{employee.mobileNumber}</td>
                                    <td>{employee.bankAccountNumber}</td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

  );
};

export default EmployeeList;
