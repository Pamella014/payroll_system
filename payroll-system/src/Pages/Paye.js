import React, {useState} from 'react';
import { useLocation} from 'react-router-dom';
import { saveAs } from 'file-saver';

const PAYEBreakdown = () => {
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
    const payeData = salaryDetails.map(employee => ({
      name: employee.name,
      paye: employee.paye,
      tinNumber: employee.tinNumber,
    }));

    generateCSV(payeData, "PAYE_payments.csv", ["Name", "PAYE", "TIN Number"]);
    alert('Payment Successful');
    setSalaryDetails([]);
    // setPaymentStatus(prevStatus => ({ ...prevStatus, paye: 'Complete' }));
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
                    <td>{employee.name}</td>
                    <td>{employee.paye}</td>
                    <td>{employee.tinNumber}</td>
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
