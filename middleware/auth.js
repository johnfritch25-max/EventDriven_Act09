/**
 * Middleware: requireAuth
 * Redirect unauthenticated users to /login
 */
export const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    req.flash("error_msg", "Please log in to continue.");
    return res.redirect("/login");
  }
  next();
};

/**
 * Middleware: requireRole(...roles)
 * Allow only users whose role matches one of the given roles.
 * Must be used after requireAuth.
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.session.userRole || !roles.includes(req.session.userRole)) {
    req.flash("error_msg", "Access denied. Insufficient permissions.");
    return res.redirect("/");
  }
  next();
};
