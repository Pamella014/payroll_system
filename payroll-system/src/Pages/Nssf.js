import React, { useState, useEffect } from 'react';
import { useLocation,useParams, useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import axios from 'axios';

const NSSFBreakdown = () => {
  const location = useLocation();
  const { payrollId } = useParams(); // Use useParams to extract payrollId from the URL
  const navigate = useNavigate();
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
      setSalaryDetails(data.salary_details);
    } catch (error) {
      console.error('Error fetching salary details:', error);
    }
  };
  console.log(payrollId)
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
    const nssfData = salaryDetails.map(employee => ({
      name: employee.employee_name,
      employeeContribution: employee.nssf,
      employerContribution: employee.employer_nssf,
      nssfNumber: employee.nssf_number,
    }));

    generateCSV(nssfData, "NSSF_payments.csv", ["Name", "Employee Contribution", "Employer Contribution", "NSSF Number"]);
    
    const payload = { 
      type: 'nssf', 
      payroll_id: payrollId 
    };

    console.log('Payload:', payload); // Check the payload

    try {
      const response = await axios.post('http://localhost:5000/make-payment', 
        payload, 
        {
          withCredentials: true
        }
      );
      console.log(response.data);
      if (response.data.success) {
        alert('Payment Successful');
        navigate(`/salary-details?payrollId=${payrollId}`);
      } else {
        console.error('Error:', response.data.message);
      }
    } catch (error) {
      console.error('Error making payment:', error);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h3>NSSF Breakdown</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>NSSF</th>
                <th>NSSF Number</th>
              </tr>
            </thead>
            <tbody>
              {salaryDetails.map((employee, index) => (
                <tr key={index}>
                  <td>{employee.employee_name}</td>
                  <td>{employee.nssf}</td>
                  <td>{employee.nssf_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={handlePayAll} className="btn btn-primary btn-round ms-auto">Pay All NSSF</button>
      </div>
    </div>
  );
};

export default NSSFBreakdown;
