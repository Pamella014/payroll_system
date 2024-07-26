import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PayrollHistory = () => {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    fetchPayrollHistory();
  }, []);

  const fetchPayrollHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/payroll/history', {
        withCredentials: true
      });
      setPayrolls(response.data.payroll_history);
    } catch (error) {
      console.error('Error fetching payroll history:', error);
    }
  };

  const handleView = (payrollId, type) => {
    navigate(`/payroll/${payrollId}/${type}-breakdown`, { state: { payrollId, from: 'history' } });
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
                {payrolls.length > 0 ? (
                  payrolls.map((payroll) => (
                    <tr key={payroll.payroll_id}>
                      <td>
                        <button
                        class="btn btn-icon btn-round btn-success btn-sm me-2"
                        >
                        <i class="fa fa-check"></i>
                        </button>
                        {payroll.month}</td>
                      <td>{payroll.year}</td>
                      <td>
                        <button className="btn btn-primary btn-round ms-auto" onClick={() => handleView(payroll.payroll_id, 'net-salary')}>
                          View
                        </button>
                      </td>
                      <td>
                      <span className={`badge ${payroll.net_salary_status === 'Completed' ? 'badge-success' : 'badge-danger'}`}>
                      {payroll.net_salary_status}</span>
                     </td>
                      <td>
                        <button onClick={() => handleView(payroll.payroll_id, 'paye')} className="btn btn-primary btn-round ms-auto">
                          View
                        </button>
                      </td>
                      <td>
                      <span className={`badge ${payroll.paye_status === 'Completed' ? 'badge-success' : 'badge-danger'}`}>
                      {payroll.paye_status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleView(payroll.payroll_id, 'nssf')} className="btn btn-primary btn-round ms-auto">
                          View
                        </button>
                      </td>
                      <td>
                      <span className={`badge ${payroll.nssf_status === 'Completed' ? 'badge-success' : 'badge-danger'}`}>
                        {payroll.nssf_status}
                        </span>
                        </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No payroll history available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollHistory;
