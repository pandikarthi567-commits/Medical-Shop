const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id || decoded._id;

    // Check if token belongs to an Admin
    if (decoded.type === "admin" || decoded.role === "admin") {
      const admin = await Admin.findById(id).select("-password");
      if (admin) {
        req.user = admin;
        req.admin = admin;
        return next();
      }
    }

    // Check User model
    let user = await User.findById(id).select("-password");
    if (!user) {
      // Fallback check Admin model
      const admin = await Admin.findById(id).select("-password");
      if (admin) {
        req.user = admin;
        req.admin = admin;
        return next();
      }

      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid or expired token",
    });
  }
};

module.exports = { protect };