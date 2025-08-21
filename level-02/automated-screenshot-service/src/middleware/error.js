export function notFoundMiddleware(req, res, next) {
  return res.status(404).json({ error: 'Not found' });
}

export function errorMiddleware(err, req, res, next) {
  console.error('❌ Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
  });
}
