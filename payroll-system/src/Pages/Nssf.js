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
  const [paymentStatus, setPaymentStatus] = useState("pending"); // Initialize payment status

  useEffect(() => {
    if (payrollId && initialSalaryDetails.length === 0) {
      fetchSalaryDetails(payrollId);
    }
  }, [payrollId, initialSalaryDetails.length]);

  const fetchSalaryDetails = async (payrollId) => {
    try {
      const response = await axios.get(
        `${config.apiBaseUrlProd}/payroll/${payrollId}/calculations`,
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

  const generateCSV = (data, filename, headers) => {
    const csvContent = [
      headers,
      ...data.map((emp) =>
        headers.map(
          (header) =>
            emp[
              header.toLowerCase().replace(/ /g, "").replace("number", "Number")
            ]
        )
      ),
    ];

    const csvString = csvContent.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  };

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

    console.log("Payload:", payload); // Check the payload

    try {
      const response = await axios.post(
        `${config.apiBaseUrlProd}/make-payment`,
        payload,
        {
          withCredentials: true,
        }
      );
      console.log(response.data);
      if (response.data.success) {
        alert("Payment Successful");
        setPaymentStatus("complete"); // Update the payment status to complete
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
