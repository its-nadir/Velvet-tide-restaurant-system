const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Server Error",
  });
};

module.exports = errorHandler;
