// middleware/roleMiddleware.js

/**
 * Middleware to check if the user has the required role
 * @param {Array} roles - Array of roles that are allowed to access the route
 */
const checkRole = (roles) => {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied: You do not have the required role." });
      }
      next(); // If the user has the required role, proceed to the next middleware or route handler
    };
  };
  
  module.exports = checkRole;