const unitConverter = require("../utils/unit-converter");

const calculateBMI = (weight, weightUnit, height, heightUnit) => {
  // Convert all inputs to metric (kg and meters)
  const weightInKg = unitConverter.convertWeight(weight, weightUnit);
  console.log(`Weight in kg: ${weightInKg}`);
  const heightInM = unitConverter.convertHeight(height, heightUnit);
  console.log(`Height in m: ${heightInM}`);

  // BMI formula: weight (kg) / (height (m) ^ 2)
  const bmi = weightInKg / (heightInM * heightInM);
  console.log(`Raw BMI value: ${bmi}`);

  // Round to 1 decimal place
  const roundedBmi = Math.round(bmi * 10) / 10;
  console.log(`Calculated BMI: ${roundedBmi}`);
  return {
    bmi: roundedBmi,
    weight: weight,
    weightInKg: weightInKg,
    height: height,
    heightInM: heightInM,
  };
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) {
    return "Underweight";
  } else if (bmi >= 18.5 && bmi < 25) {
    return "Normal weight";
  } else if (bmi >= 25 && bmi < 30) {
    return "Overweight";
  } else {
    return "Obese";
  }
};

module.exports = {
  calculateBMI,
  getBMICategory,
};
