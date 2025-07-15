# BMI Calculator API

This BMI (Body Mass Index) Calculator API is a Node.js application that provides HTTP endpoints for calculating BMI and determining weight categories based on the calculated value. BMI is a simple index of weight-for-height commonly used to classify underweight, normal weight, overweight, and obesity in adults.

The API follows RESTful principles and is built with Express.js, featuring a clean architecture with separate routes, controllers, and services layers. It's designed to be easily extensible for additional health-related calculations or integrations.

## Key Features

### 1. BMI Calculation

- Accurate BMI computation using the standard formula: weight (kg) / (height (m))²
- Automatic height conversion - detects if height is provided in cm and converts to meters
- Precision control - results are rounded to one decimal place for readability

### 2. Weight Classification

**Standard WHO categories:**

- Underweight: BMI < 18.5
- Normal weight: 18.5 ≤ BMI < 25
- Overweight: 25 ≤ BMI < 30
- Obese: BMI ≥ 30

Immediate feedback - returns both numeric BMI value and category

### 3. API Endpoints

- Health Check
  - GET / - Verify API is running
  - Returns status and welcome message
- BMI Calculation
  - POST /api/bmi/calculate - Calculate BMI from weight and height
  - Accepts JSON payload with weight (kg) and height (cm/m)
  - Returns JSON with calculated BMI and category
- Category Lookup
  - GET /api/bmi/category/:bmi - Get category for a specific BMI value

Useful when you already have the BMI and just need classification

### 4. Error Handling

- Input validation - checks for missing or invalid parameters
- Meaningful error messages - helps with debugging
- HTTP status codes - proper codes for success (200), client errors (400), and server errors (500)

### 5. Technical Features

- Modular architecture - separation of concerns with routes, controllers, and services
- JSON-based - both request and response use JSON format
- Lightweight - minimal dependencies (only Express.js required)
- Configurable port - can be set via environment variable (default: 3000)

## Example Use Cases

- Health & Fitness Apps:
  - Integrate with mobile apps to provide BMI tracking
  - Add to wellness dashboards for employee health programs
- Medical Systems:
  - Quick BMI calculation for patient records
  - Automated weight classification in EHR systems
- Educational Tools:
  - Demonstrate health metrics in school projects
  - Nutrition and health education platforms
- Research Applications:
  - Population health studies
  - Clinical trial screening tools

## Input/Output Examples

### Calculate BMI

***Request:***

```http
POST /api/bmi/calculate
Content-Type: application/json
{
  "weight": 150,
  "weightUnit": "lbs",
  "height": 5.9,
  "heightUnit": "ft"
}
```

***Response:***

```json
{
    "success": true,
    "message": "BMI calculated successfully",
    "data": {
        "bmi": 21,
        "category": "Obese",
        "metricValues": {
            "weightInKg": 68.0388,
            "heightInM": 1.7983200000000001
        }
    }
}
```

### Get Category

***Request:***

```http
GET /api/bmi/category/27.5
```

***Response:***

```json
{
    "success": true,
    "message": "BMI category retrieved successfully",
    "data": {
        "category": "Normal weight"
    }
}
```

## Future Enhancement Ideas

### Multi-unit Support:

- Accept weight in pounds and height in feet/inches
- Automatic conversion between metric and imperial

### Advanced Analysis:

- BMI trends over time
- Weight loss/gain projections

### Age/Gender Considerations:

- Different BMI interpretations for children
- Gender-specific recommendations

### Integration Features:

- OAuth security
- Database persistence for user histories
- GraphQL alternative to REST

### Visualization:

- Return BMI chart images
- Progress graphs
