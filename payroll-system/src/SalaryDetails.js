import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { saveAs } from 'file-saver';

const SalaryDetails = () => {
  const location = useLocation();
  const initialSalaryDetails = location.state?.salaryDetails || [];
  const [salaryDetails, setSalaryDetails] = useState(initialSalaryDetails);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState([]);

  const generateCSV = (data, filename, paymentMode) => {
    let csvContent = [];

    if (paymentMode === "Bank") {
      csvContent = [
        ["Name", "Gross Salary", "Net Salary", "PAYE", "NSSF", "Preferred Payment Mode", "Bank Account Number"],
        ...data.map(emp => [
          emp.name,
          emp.grossSalary,
          emp.netSalary,
          emp.paye,
          emp.nssf,
          emp.preferredPaymentMode,
          emp.bankAccountNumber,
        ]),
      ];
    } else if (paymentMode === "Mobile Money") {
      csvContent = [
        ["Name", "Gross Salary", "Net Salary", "PAYE", "NSSF", "Preferred Payment Mode", "Mobile Number"],
        ...data.map(emp => [
          emp.name,
          emp.grossSalary,
          emp.netSalary,
          emp.paye,
          emp.nssf,
          emp.preferredPaymentMode,
          emp.mobileNumber,
        ]),
      ];
    } else {
      csvContent = [
        ["Name", "Gross Salary", "Net Salary", "PAYE", "NSSF", "Preferred Payment Mode"],
        ...data.map(emp => [
          emp.name,
          emp.grossSalary,
          emp.netSalary,
          emp.paye,
          emp.nssf,
          emp.preferredPaymentMode,
        ]),
      ];
    }

    const csvString = csvContent.map(e => e.join(",")).join("\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  };

  const handlePayments = () => {
    const payments = {
      Bank: [],
      "Mobile Money": [],
      Wallet: [],
    };

    salaryDetails.forEach(employee => {
      payments[employee.preferredPaymentMode].push(employee);
      alert(`Payment made to ${employee.name} of amount ${employee.netSalary}`);
    });

    Object.keys(payments).forEach(method => {
      if (payments[method].length > 0) {
        generateCSV(payments[method], `${method.replace(' ', '_')}_payments.csv`, method);
      }
    });

    setReceiptData(salaryDetails);
    setSalaryDetails([]);
    setShowReceipt(true); // Clear the salary details list
  };

  return (
    <div>
      <div className="sidebar">
        <ul>
          <li className="active">Salary Details</li>
        </ul>
      </div>

      <div className="header">
        <h2>Salary Details</h2>
      </div>

      <div className="content">
        {salaryDetails.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Net Salary</th>
                  <th>PAYE</th>
                  <th>NSSF</th>
                </tr>
              </thead>
              <tbody>
                {salaryDetails.map((employee, index) => (
                  <tr key={index}>
                    <td>{employee.name}</td>
                    <td>{employee.netSalary}</td>
                    <td>{employee.paye}</td>
                    <td>{employee.nssf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className='add-button'>
              <button onClick={handlePayments}>Pay All Employees</button>
            </div>
          </div>
        ) : (
          <div className="no-payroll">
            <p>No payroll to submit</p>
          </div>
        )}
        {showReceipt && (
          <div className="receipt-container">
            <h2>Payment Receipt</h2>
            <div className="receipt-cards">
              {receiptData.map((employee, index) => (
                <div className="receipt-card" key={index}>
                  <h3>{employee.name}</h3>
                  <p><strong>Net Salary:</strong> {employee.netSalary}</p>
                  <p><strong>PAYE:</strong> {employee.paye}</p>
                  <p><strong>NSSF:</strong> {employee.nssf}</p>
                  <p><strong>Preferred Payment Mode:</strong> {employee.preferredPaymentMode}</p>
                  {employee.preferredPaymentMode === "Mobile Money" && (
                    <p><strong>Mobile Number:</strong> {employee.mobileNumber}</p>
                  )}
                  {employee.preferredPaymentMode === "Bank" && (
                    <p><strong>Bank Account Number:</strong> {employee.bankAccountNumber}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryDetails;
