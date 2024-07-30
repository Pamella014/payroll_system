import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "./config";

const SalaryDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const payrollId = query.get("payrollId");
  const [salaryDetails, setSalaryDetails] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState({
    netSalary: "",
    paye: "",
    nssf: "",
  });

  useEffect(() => {
    if (payrollId) {
      fetchSalaryDetails(payrollId);
    }
  }, [payrollId]);

  const fetchSalaryDetails = async (payrollId) => {
    try {
      const response = await axios.get(
        `${config.apiBaseUrlProd}/payroll/${payrollId}/calculations`,
        {
          withCredentials: true,
        }
      );
      const data = response.data;
      const salary_details = data.salary_details;
      const status = data.payment_status;
      setSalaryDetails(salary_details);
      setPaymentStatus({
        netSalary: status.net_salary_status,
        paye: status.paye_status,
        nssf: status.nssf_status,
      });
    } catch (error) {
      console.error("Error fetching salary details:", error);
    }
  };

  const handleView = (type) => {
    navigate(`/payroll/${payrollId}/${type}-breakdown`, {
      state: { salaryDetails, payrollId, from: "salary-details" },
    });
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="content">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>PAYE</th>
                  <th>Status</th>
                  <th>NSSF</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {salaryDetails.length > 0 ? (
                  <tr>
                    <td>{new Date().toLocaleDateString()}</td>
                    <td>{new Date().toLocaleTimeString()}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-round ms-auto"
                        onClick={() => handleView("net-salary")}
                      >
                        View
                      </button>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          paymentStatus.netSalary === "Completed"
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        {paymentStatus.netSalary}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleView("paye")}
                        className="btn btn-primary btn-round ms-auto"
                      >
                        View
                      </button>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          paymentStatus.paye === "Completed"
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        {paymentStatus.paye}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleView("nssf")}
                        className="btn btn-primary btn-round ms-auto"
                      >
                        View
                      </button>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          paymentStatus.nssf === "Completed"
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        {paymentStatus.nssf}
                      </span>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan="8">No salary details available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryDetails;
