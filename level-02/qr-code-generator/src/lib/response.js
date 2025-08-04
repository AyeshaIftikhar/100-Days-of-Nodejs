function success(res, data, statusCode = 200) {
  if (res.setHeader) {
    // HTTP response (Express/Vercel)
    res.status(statusCode).json({
      success: true,
      data
    });
  } else {
    // AWS Lambda response
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        data
      })
    };
  }
}

function error(res, message, statusCode = 500) {
  if (res.setHeader) {
    // HTTP response (Express/Vercel)
    res.status(statusCode).json({
      success: false,
      error: message
    });
  } else {
    // AWS Lambda response
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: message
      })
    };
  }
}

module.exports = { success, error };