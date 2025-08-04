function success(res, data, statusCode = 200) {
  if (res) {
    // Vercel response
    res.status(statusCode).json({
      success: true,
      data
    });
  } else {
    // AWS Lambda response
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data
      })
    };
  }
}

function error(res, message, statusCode = 500) {
  if (res) {
    // Vercel response
    res.status(statusCode).json({
      success: false,
      error: message
    });
  } else {
    // AWS Lambda response
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: message
      })
    };
  }
}

module.exports = { success, error };