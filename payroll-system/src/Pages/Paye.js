import React, {useState, useEffect} from 'react';
import { useLocation} from 'react-router-dom';
import { saveAs } from 'file-saver';
import axios from 'axios';

const PAYEBreakdown = () => {
  const location = useLocation();
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
      const salary_details =data.salary_details;
      setSalaryDetails(salary_details);
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

  const handlePayAll = () => {
    const payeData = salaryDetails.map(employee => ({
      name: employee.employee_name,
      paye: employee.paye,
      tinNumber: employee.tin_number,
    }));

    generateCSV(payeData, "PAYE_payments.csv", ["Name", "PAYE", "TIN Number"]);
    alert('Payment Successful');
    setSalaryDetails([]);
  };

  return (
    <div className="card">
      <div className="card-body">
        <h3>PAYE Breakdown</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>PAYE</th>
                <th>TIN Number</th>
              </tr>
            </thead>
            <tbody>
              {salaryDetails.length > 0 ? (
                salaryDetails.map((employee, index) => (
                  <tr key={index}>
                    <td>{employee.employee_name}</td>
                    <td>{employee.paye}</td>
                    <td>{employee.tin_number}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>No payroll to submit</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {salaryDetails.length > 0 && (
          <button onClick={handlePayAll} className="btn btn-primary btn-round ms-auto">Pay All PAYE</button>
        )}
      </div>
    </div>
    
  );

};

export default PAYEBreakdown;
