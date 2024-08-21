import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { saveAs } from "file-saver";
import axios from "axios";
import config from "../config";

const NetSalaryBreakdown = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { payrollId } = useParams();
  const initialSalaryDetails = location.state?.salaryDetails || [];
  const from = location.state?.from || "salary-details";
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
      setPaymentStatus(data.payment_status.net_salary_status);
    } catch (error) {
      console.error("Error fetching salary details:", error);
    }
  };

  const generateCSV = (data, filename, headers) => {
    // Create CSV content with headers and data
    const csvContent = [
      headers,
      ...data.map((emp) => [
        emp.name || '',  // Fallback to empty string if value is undefined
        emp.netSalary || '',
        emp.preferredPaymentMode || '',
      ]),
    ];
  
    // Convert CSV content array to a string
    const csvString = csvContent.map((row) => row.join(",")).join("\n");
    
    // Create and save the CSV file
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  };
  
  const handlePayAll = async () => {
    const netSalaryData = salaryDetails.map((employee) => ({
      name: employee.employee_name,
      netSalary: employee.net_salary,
      preferredPaymentMode: employee.preferred_payment_mode,
    }));
  
    console.log(netSalaryData);  // Log the data to verify
  
    generateCSV(netSalaryData, "NetSalary_payments.csv", [
      "Name",
      "Net Salary",
      "Preferred Payment Mode",
    ]);
  
    const payload = {
      type: "netSalary",
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
      if (response.data.success) {
        alert("Payment Successful");
        setPaymentStatus("complete");
        if (from === "history") {
          navigate("/payroll/history");
        } else {
          navigate(`/salary-details?payrollId=${payrollId}`);
        }
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
              {salaryDetails.length > 0 ? (
                salaryDetails.map((employee, index) => (
                  <tr key={index}>
                    <td>{employee.employee_name}</td>
                    <td>{employee.net_salary}</td>
                    <td>{employee.preferred_payment_mode}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No salary details available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {paymentStatus === "pending" && (
          <button
            onClick={handlePayAll}
            className="btn btn-primary btn-round ms-auto"
          >
            Pay All Net Salaries
          </button>
        )}
      </div>
    </div>
  );
};

export default NetSalaryBreakdown;
