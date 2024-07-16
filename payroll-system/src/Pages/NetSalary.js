import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { saveAs } from 'file-saver';

const NetSalaryBreakdown = () => {
  const location = useLocation();
  const initialSalaryDetails = location.state?.salaryDetails || [];
  const [salaryDetails, setSalaryDetails] = useState(initialSalaryDetails);

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
    const netSalaryData = salaryDetails.map(employee => ({
      name: employee.name,
      netsalary: employee.netSalary,
      preferredPaymentMode: employee.preferredPaymentMode,
    }));

    generateCSV(netSalaryData, "NetSalary_payments.csv", ["Name", "Net Salary", "Preferred Payment Mode"]);
    alert('Payment Successful');
    setSalaryDetails([]);
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
                  <td>{employee.name}</td>
                  <td>{employee.netSalary}</td>
                  <td>{employee.preferredPaymentMode}</td>
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
