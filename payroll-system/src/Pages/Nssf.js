import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import axios from "axios";
import config from "../config";

const NSSFBreakdown = () => {
  const location = useLocation();
  const { payrollId } = useParams();
  const navigate = useNavigate();
  const initialSalaryDetails = location.state?.salaryDetails || [];
  const [salaryDetails, setSalaryDetails] = useState(initialSalaryDetails);
  const [paymentStatus, setPaymentStatus] = useState("pending"); 

  useEffect(() => {
    if (payrollId && initialSalaryDetails.length === 0) {
      fetchSalaryDetails(payrollId);
    }
  }, [payrollId, initialSalaryDetails.length]);

  const fetchSalaryDetails = async (payrollId) => {
    try {
      const response = await axios.get(
        `${config.apiBaseUrl}/payroll/${payrollId}/calculations`,
        {
          withCredentials: true,
        }
      );
      const data = response.data;
      setSalaryDetails(data.salary_details);
      setPaymentStatus(data.payment_status.nssf_status); // Set the payment status from the response
    } catch (error) {
      console.error("Error fetching salary details:", error);
    }
  };
console.log(salaryDetails)
const generateCSV = (data, filename, headers) => {
  const csvContent = [
    headers,
    ...data.map((emp) => [
      emp.name || '',  
      emp.employeeContribution || '',
      emp.employerContribution || '',
      emp.nssfNumber || '',
    ]),
  ];

  // Convert the CSV content array to a string
  const csvString = csvContent.map((row) => row.join(",")).join("\n");
  
  // Create and save the CSV file
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
};

// console.log(salaryDetails)
const handlePayAll = async () => {
  const nssfData = salaryDetails.map((employee) => ({
    name: employee.employee_name,
    employeeContribution: employee.nssf,
    employerContribution: employee.employer_nssf,
    nssfNumber: employee.nssf_number,
  }));

  generateCSV(nssfData, "NSSF_payments.csv", [
    "Name",
    "Employee Contribution",
    "Employer Contribution",
    "NSSF Number",
  ]);

  const payload = {
    type: "nssf",
    payroll_id: payrollId,
  };

  try {
    const response = await axios.post(
      `${config.apiBaseUrl}/make-payment`,
      payload,
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    if (response.data.success) {
      alert("Payment Successful");
      setPaymentStatus("complete"); 
      navigate(`/salary-details?payrollId=${payrollId}`);
    } else {
      console.error("Error:", response.data.message);
    }
  } catch (error) {
    console.error("Error making payment:", error);
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
                <th>Employee Contribution</th>
                <th>Employer Contribution</th>     
                <th>NSSF Number</th>

              </tr>
            </thead>
            <tbody>
              {salaryDetails.map((employee, index) => (
                <tr key={index}>
                  <td>{employee.employee_name}</td>
                  <td>{employee.nssf}</td>
                  <td>{employee.employer_nssf}</td>
                  <td>{employee.nssf_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paymentStatus === "pending" && (
          <button
            onClick={handlePayAll}
            className="btn btn-primary btn-round ms-auto"
          >
            Pay All NSSF
          </button>
        )}
      </div>
    </div>
  );
};

export default NSSFBreakdown;
