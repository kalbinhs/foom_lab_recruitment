module.exports = function (req, res, next) {
  const secret = req.headers['secret-key']; // expected header

  if (!secret) {
    return res.status(401).json({
      response_code: 401,
      response_message: "Missing API key in header",
    });
  }

  if (secret !== process.env.SECRET_KEY) {
    return res.status(403).json({
      response_code: 403,
      response_message: "Invalid API key",
    });
  }

  next();
};
