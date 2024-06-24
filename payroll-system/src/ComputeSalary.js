const computeSalary = (grossSalary) => {
    let paye;
    if (grossSalary <= 235000) {
      paye = 0;
    } else if (grossSalary <= 335000) {
      paye = (grossSalary - 235000) * 0.1;
    } else if (grossSalary <= 410000) {
      paye = ((grossSalary - 335000) * 0.2) + 10000;
    } else if (grossSalary <= 10000000) {
      paye = ((grossSalary - 410000) * 0.3) + 25000;
    } else {
      paye = ((grossSalary - 410000) * 0.3) + 25000 + ((grossSalary - 10000000) * 0.1);
    }
    const nssf = grossSalary * 0.05;
    const netSalary = grossSalary - paye - nssf;
    return { paye, nssf, netSalary };
  };
  
  export default computeSalary;
  