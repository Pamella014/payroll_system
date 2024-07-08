import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { saveAs } from 'file-saver';

const SalaryDetails = () => {
  const location = useLocation();
  const initialSalaryDetails = location.state?.salaryDetails || [];
  const [salaryDetails, setSalaryDetails] = useState(initialSalaryDetails);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState([]);
  
  const generateCSV = (data, filename, headers) => {
    const csvContent = [
      headers,
      ...data.map(emp => headers.map(header => emp[header.toLowerCase().replace(/ /g, '').replace('number', 'Number')])),
    ];

    const csvString = csvContent.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  };

  const handlePayments = () => {

    const payeData = salaryDetails.map(employee => ({
      name: employee.name,
      paye: employee.paye,
      tinNumber: employee.tinNumber,
    }));

    const nssfData = salaryDetails.map(employee => ({
      name: employee.name,
      nssf: employee.nssf,
      nssfNumber: employee.nssfNumber,
    }));

    const netSalaryData = salaryDetails.map(employee => ({
      name: employee.name,
      netsalary: employee.netSalary,
      preferredPaymentMode: employee.preferredPaymentMode,
    }));


    generateCSV(payeData, "PAYE_payments.csv", ["Name", "PAYE", "TIN Number"]);
    generateCSV(nssfData, "NSSF_payments.csv", ["Name", "NSSF", "NSSF Number"]);
    generateCSV(netSalaryData, "NetSalary_payments.csv", ["Name", "Net Salary", "Preferred Payment Mode"]);

    alert('Payment Successful');
    setReceiptData(salaryDetails);
    setSalaryDetails([]);
    setShowReceipt(true);
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="content">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Net Salary</th>
                  <th>PAYE</th>
                  <th>NSSF</th>
                </tr>
              </thead>
              <tbody>
                {salaryDetails.length > 0 ? (
                  salaryDetails.map((employee, index) => (
                    <tr key={index}>
                      <td>{employee.name}</td>
                      <td>{employee.netSalary}</td>
                      <td>{employee.paye}</td>
                      <td>{employee.nssf}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>No payroll to submit</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {salaryDetails.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <button onClick={handlePayments} className="btn btn-label-info btn-round me-2">
                Pay All Employees
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryDetails;
