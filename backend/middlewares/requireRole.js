export default function(...allowedRoles) {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    console.log("DEBUG requireRole:", {
      userRole: req.user.role,
      allowedRoles,
      isAllowed: allowedRoles.includes(req.user.role)
    });

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    next();
  };
};

