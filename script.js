function calculate() {
    const pricePerHour = Number(document.getElementById("pricePerHour").value);
    const workedHours = Number(document.getElementById("workedHours").value);
    const pricePerExtraHour = Number(document.getElementById("pricePerExtraHour").value);
    const workedExtraHours = Number(document.getElementById("workedExtraHours").value);
    const attendanceExtra = Number(document.getElementById("attendanceExtra").value);
    const percentageWhiteSalary = Number(document.getElementById("percentageWhiteSalary").value);

    let total = (pricePerHour * workedHours) + (pricePerExtraHour * workedExtraHours) + (attendanceExtra);

    let totalWhiteSalary = (total * percentageWhiteSalary) / 100;
    let totalBlackSalary = total - totalWhiteSalary;

    const result = document.getElementById("result");
    result.innerText = `Total: ${total}, Total en blanco: ${totalWhiteSalary}, Total en negro: ${totalBlackSalary}`;
}

const calculateButton = document.getElementById("calculate-button");
calculateButton.addEventListener("click", calculate);