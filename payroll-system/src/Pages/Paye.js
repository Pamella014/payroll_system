import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { saveAs } from 'file-saver';
import axios from 'axios';
import config from '../config';

const PAYEBreakdown = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { payrollId } = useParams();
  const initialSalaryDetails = location.state?.salaryDetails || [];
  const [salaryDetails, setSalaryDetails] = useState(initialSalaryDetails);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // Initialize payment status

  useEffect(() => {
    if (payrollId && initialSalaryDetails.length === 0) {
      fetchSalaryDetails(payrollId);
    }
  }, [payrollId,initialSalaryDetails.length]);

  const fetchSalaryDetails = async (payrollId) => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/payroll/${payrollId}/calculations`, {
        withCredentials: true
      });
      const data = response.data;
      setSalaryDetails(data.salary_details);
      setPaymentStatus(data.payment_status.paye_status); // Set the payment status from the response
    } catch (error) {
      console.error('Error fetching salary details:', error);
    }
  };

  const generateCSV = (data, filename, headers) => {
    const csvContent = [
      headers,
      ...data.map(emp => headers.map(header => {
        // Explicitly map each field to the corresponding value in emp
        switch(header) {
          case "Name of Employee":
            return emp.nameOfEmployee || "";
          case "TIN of Employee":
            return emp.tinOfEmployee || "";
          case "Period for which employed during the year of income":
            return emp.periodOfEmployment || "";
          case "Basic Salary":
            return emp.basicSalary || 0;
          case "Housing Allowance":
            return emp.housingAllowance || 0;
          case "Other taxable Allowances(Specify)":
            return emp.otherTaxableAllowances || 0;
          case "Value of Benefits":
            return emp.valueOfBenefits || 0;
          case "Gross Income":
            return emp.grossIncome || 0;
          case "Allowable Deduction (Specify)":
            return emp.allowableDeductions || 0;
          case "Chargeable Income":
            return emp.chargeableIncome || 0;
          case "Is the Employee in secondary employment or Fixed tax rate?":
            return emp.secondaryEmployment || 0;
          case "Select 'Yes' if Non-Resident":
            return emp.nonResident ? "Yes" : "No";
          case "Tax on Chargeable Income":
            return emp.taxOnChargeableIncome || 0;
          case "PAYE deducted":
            return emp.payeDeducted || 0;
          case "Transport":
            return emp.transport || 0;
          case "Medical":
            return emp.medical || 0;
          case "Leave":
            return emp.leave || 0;
          case "Over time":
            return emp.overTime || 0;
          case "Other Allowance":
            return emp.otherAllowance || 0;
          case "Housing":
            return emp.housing || 0;
          case "Motor vehicle":
            return emp.motorVehicle || 0;
          case "Domestic servants":
            return emp.domesticServants || 0;
          case "Other Value of benefits":
            return emp.otherValueOfBenefits || 0;
          default:
            return "";
        }
      }))
    ];
  
    const csvString = csvContent.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  };
  
console.log(salaryDetails)
  const handlePayAll = async () => {
    // Adjust this to match the actual data structure
    const payeData = salaryDetails.map(employee => ({
      tinOfEmployee: employee.tin_number,
      nameOfEmployee: employee.employee_name,
      periodOfEmployment: employee.period_of_employment,
      basicSalary: employee.gross_salary,
      housingAllowance: employee.housing_allowance,
      otherTaxableAllowances: employee.other_taxable_allowances,
      valueOfBenefits: employee.value_of_benefits,
      grossIncome: employee.gross_income,
      allowableDeductions: employee.allowable_deductions,
      chargeableIncome: employee.chargeable_income,
      secondaryEmployment: employee.secondary_employment,
      nonResident: employee.non_resident,
      taxOnChargeableIncome: employee.tax_on_chargeable_income,
      payeDeducted: employee.paye_deducted,
      transport: employee.transport,
      medical: employee.medical,
      leave: employee.leave,
      overTime: employee.over_time,
      otherAllowance: employee.other_allowance,
      housing: employee.housing,
      motorVehicle: employee.motor_vehicle,
      domesticServants: employee.domestic_servants,
      otherValueOfBenefits: employee.other_value_of_benefits,
    }));
  
    generateCSV(payeData, "PAYE_payments.csv", [
      "Name of Employee","TIN of Employee", "Period for which employed during the year of income",
      "Basic Salary", "Housing Allowance", "Other taxable Allowances(Specify)",
      "Value of Benefits", "Gross Income", "Allowable Deduction (Specify)",
      "Chargeable Income", "Is the Employee in secondary employment or Fixed tax rate?",
      "Select 'Yes' if Non-Resident", "Tax on Chargeable Income", "PAYE deducted",
      "Transport", "Medical", "Leave", "Over time", "Other Allowance", "Housing",
      "Motor vehicle", "Domestic servants", "Other Value of benefits"
    ]);
  console.log(payeData)
    const payload = { 
      type: 'paye', 
      payroll_id: payrollId 
    };
  
  
    try {
      const response = await axios.post(`${config.apiBaseUrl}/make-payment`, 
        payload, 
        {
          withCredentials: true
        }
      );
      console.log(response.data);
      if (response.data.success) {
        alert('Payment Successful');
        setPaymentStatus('complete'); // Update the payment status to complete
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
                    <td>{employee.employee_name}</td>
                    <td>{employee.paye}</td>
                    <td>{employee.tin_number}</td>
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
        {paymentStatus === 'pending' && (
          <button onClick={handlePayAll} className="btn btn-primary btn-round ms-auto">Pay All PAYE</button>
        )}
      </div>
    </div>
  );
};

export default PAYEBreakdown;
