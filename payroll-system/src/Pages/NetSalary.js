import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import axios from 'axios';

const NetSalaryBreakdown = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const payrollId = query.get('payrollId');
  const initialSalaryDetails = location.state?.salaryDetails || [];
  const [salaryDetails, setSalaryDetails] = useState(initialSalaryDetails);

  useEffect(() => {
    if (payrollId && initialSalaryDetails.length === 0) {
      fetchSalaryDetails(payrollId);
    }
  }, [payrollId]);

  const fetchSalaryDetails = async (payrollId) => {
    try {
      const response = await axios.get(`http://localhost:5000/payroll/${payrollId}/calculations`, {
        withCredentials: true
      });
      const data = response.data;
      console.log(data)
      setSalaryDetails(data.salary_details);
    } catch (error) {
      console.error('Error fetching salary details:', error);
    }
  };

  const generateCSV = (data, filename, headers) => {
    const csvContent = [
      headers,
      ...data.map(emp => headers.map(header => emp[header.toLowerCase().replace(/ /g, '').replace('number', 'Number')])),
    ];

    const csvString = csvContent.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  };

  const handlePayAll = async () => {
    const netSalaryData = salaryDetails.map(employee => ({
      name: employee.name,
      netSalary: employee.net_salary,
      preferredPaymentMode: employee.preferredPaymentMode,
    }));

    generateCSV(netSalaryData, "NetSalary_payments.csv", ["Name", "Net Salary", "Preferred Payment Mode"]);
    
    try {
      const response = await axios.post('http://localhost:5000/make-payment', { type: 'netSalary', payroll_id: payrollId });
      if (response.data.success) {
        alert('Payment Successful');
        navigate(`/salary-details?payrollId=${payrollId}`);
      }
    } catch (error) {
      console.error('Error making payment:', error);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h3>Net Salary Breakdown</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Net Salary</th>
                <th>Preferred Payment Mode</th>
              </tr>
            </thead>
            <tbody>
              {salaryDetails.map((employee, index) => (
                <tr key={index}>
                  <td>{employee.employee_name}</td>
                  <td>{employee.net_salary}</td>
                  <td>{employee.preferred_payment_mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={handlePayAll} className="btn btn-primary btn-round ms-auto">Pay All Net Salaries</button>
      </div>
    </div>
  );
};

export default NetSalaryBreakdown;
