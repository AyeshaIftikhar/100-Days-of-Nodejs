const convert = {
  // Weight conversions
  lbToKg: (pounds) => pounds * 0.453592,
  stToKg: (stone) => stone * 6.35029,
  
  // Height conversions
  inToM: (inches) => inches * 0.0254,
  ftToM: (feet) => feet * 0.3048,
  ftInToM: (feet, inches) => (feet * 12 + inches) * 0.0254,
  cmToM: (cm) => cm / 100
};

const convertWeight = (value, unit) => {
  switch (unit.toLowerCase()) {
    case 'kg':
      return value;
    case 'lb':
    case 'lbs':
      return convert.lbToKg(value);
    case 'st':
      return convert.stToKg(value);
    default:
      throw new Error(`Unsupported weight unit: ${unit}`);
  }
};

const convertHeight = (value, unit) => {
  switch (unit.toLowerCase()) {
    case 'm':
      return value;
    case 'cm':
      return convert.cmToM(value);
    case 'in':
      return convert.inToM(value);
    case 'ft':
      return convert.ftToM(value);
    default:
      throw new Error(`Unsupported height unit: ${unit}`);
  }
};

module.exports = {
  convertWeight,
  convertHeight
};