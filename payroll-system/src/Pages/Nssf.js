import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { saveAs } from 'file-saver';

const NSSFBreakdown = () => {
  const location = useLocation();
  const initialSalaryDetails = location.state?.salaryDetails || [];
  const [salaryDetails, setSalaryDetails] = useState(initialSalaryDetails);
  const setPaymentStatus = location.state?.setPaymentStatus;

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
    const nssfData = salaryDetails.map(employee => ({
      name: employee.name,
      nssf: employee.nssf,
      nssfNumber: employee.nssfNumber,
    }));

    generateCSV(nssfData, "NSSF_payments.csv", ["Name", "NSSF", "NSSF Number"]);
    alert('Payment Successful');
    setSalaryDetails([]);
    // setPaymentStatus(prevStatus => ({ ...prevStatus, nssf: 'Complete' }));
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
              {salaryDetails.length > 0 ? (
                salaryDetails.map((employee, index) => (
                  <tr key={index}>
                    <td>{employee.name}</td>
                    <td>{employee.nssf}</td>
                    <td>{employee.nssfNumber}</td>
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
          <button onClick={handlePayAll}  className="btn btn-primary btn-round ms-auto">Pay All NSSF</button>
        )}
      </div>
    </div>
  );
};

export default NSSFBreakdown;
