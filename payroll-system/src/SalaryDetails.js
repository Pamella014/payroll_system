import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    if (initialSalaryDetails.length > 0) {
      fetchSalaryDetails(initialSalaryDetails[0].id);
    }
    fetchPaymentHistory();
  }, [initialSalaryDetails]);

  const fetchSalaryDetails = async (employeeId) => {
    try {
      const response = await axios.get(`/employee/${employeeId}/salary`);
      const salaryData = response.data;
      setSalaryDetails(salaryData);
    } catch (error) {
      console.error('Error fetching salary details:', error);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await axios.get('/payments');
      const payments = response.data;
      setPaymentHistory(payments);
      updatePaymentStatus(payments);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const updatePaymentStatus = (payments) => {
    const status = {
      netSalary: 'Pending',
      paye: 'Pending',
      nssf: 'Pending'
    };
    payments.forEach(payment => {
      if (payment.status === 'Completed') {
        status[payment.paymentType] = 'Completed';
      }
    });
    setPaymentStatus(status);
  };

  const handleView = (type) => {
    navigate(`/${type}-breakdown`, { state: { salaryDetails } });
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
        <h3>Payment History</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Payment Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map(payment => (
                <tr key={payment.id}>
                  <td>{new Date(payment.timestamp).toLocaleDateString()}</td>
                  <td>{payment.employee.name}</td>
                  <td>{payment.paymentType}</td>
                  <td>{payment.amount}</td>
                  <td>{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalaryDetails;
