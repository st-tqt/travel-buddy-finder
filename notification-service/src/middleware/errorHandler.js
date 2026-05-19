module.exports = (err, req, res, next) => {
  console.error('[ERROR]', new Date().toISOString(),
                req.method, req.url, err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error'
  });
};
