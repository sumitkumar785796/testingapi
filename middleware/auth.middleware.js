const jwt = require("jsonwebtoken");
const { secretKey } = require("../utils");

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  // console.log("Token in Cookies: ", token); // Log token

  if (!token) {
    return res.status(401).json({ message: "Token missing or invalid." });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    // console.log("Decoded Token:", decoded); // Log decoded token

    req.user = decoded; // Attach decoded info to request
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Token verification failed:", err); // Log verification errors
    return res.status(401).json({ message: "Unauthorized access." });
  }
};

module.exports = verifyToken;
