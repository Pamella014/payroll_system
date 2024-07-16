import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SalaryDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSalaryDetails = location.state?.salaryDetails || [];
  const [salaryDetails, setSalaryDetails] = useState(initialSalaryDetails);

  const [paymentStatus, setPaymentStatus] = useState({
    netSalary: 'Pending',
    paye: 'Pending',
    nssf: 'Pending'
  });

  const handleView = (type) => {
    navigate(`/${type}-breakdown`, { state: { salaryDetails} });
  };


  return (
    <div className="card">
      <div className="card-body">
        <div className="content">
          <div className="table-responsive">
            <table className="table">
              <thead>
              <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>PAYE</th>
                  <th>Status</th>
                  <th>NSSF</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                    <tr >
                      <td>{new Date().toLocaleDateString()}</td>
                      <td>{new Date().toLocaleTimeString()}</td>
                      <td>
                        <button  className="btn btn-primary btn-round ms-auto" onClick={() => handleView('net-salary')} >View</button>
                      </td>
                      <td>{paymentStatus.netSalary}</td>
                      <td>
                        <button onClick={() => handleView('paye')}  className="btn btn-primary btn-round ms-auto">View</button>
                      </td>
                      <td>{paymentStatus.paye}</td>
                      <td>
                        <button onClick={() => handleView('nssf')}  className="btn btn-primary btn-round ms-auto">View</button>
                      </td>
                      <td>{paymentStatus.nssf}</td>
                    </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryDetails;
