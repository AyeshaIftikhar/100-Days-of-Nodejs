const bmiService = require("../services/bmi-services");

const calculateBMI = (req, res) => {
  try {
    const { weight, weightUnit = "kg", height, heightUnit = "cm" } = req.body;

    if (!weight || !height) {
      return res.status(400).json({
        success: false,
        message: "Weight and height are required",
        data: null,
      });
    }

    const bmi = bmiService.calculateBMI(weight, weightUnit, height, heightUnit);
    const category = bmiService.getBMICategory(bmi);

    res.status(200).json({
      success: true,
      message: "BMI calculated successfully",
      data: {
        bmi: bmi.bmi,
        category: category,
        metricValues: {
          weightInKg: bmi.weightInKg,
          heightInM: bmi.heightInM,
        },
      },
    });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: error.message, data: null });
  }
};

const getBMICategory = (req, res) => {
  try {
    const { bmi } = req.params;
    if (!bmi) {
      return res
        .status(400)
        .json({ success: false, message: "BMI value is required", data: null });
    }
    const category = bmiService.getBMICategory(parseFloat(bmi));
    res.status(200).json({
      success: true,
      message: "BMI category retrieved successfully",
      data: { category },
    });
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: error.message, data: null });
  }
};

module.exports = {
  calculateBMI,
  getBMICategory,
};
