import bcrypt from "bcrypt";
import { User } from "../models/userModel.js";

export const loginPage = (req, res) =>
  res.render("login", { title: "Login" });

export const registerPage = (req, res) =>
  res.render("register", { title: "Register" });

export const forgotPasswordPage = (req, res) =>
  res.render("forgotpassword", { title: "Forgot Password" });

export const dashboardPage = (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  res.redirect("/shop");
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      req.flash("error_msg", "No account found with that email.");
      return res.redirect("/login");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      req.flash("error_msg", "Incorrect password.");
      return res.redirect("/login");
    }
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userRole = user.role;

    // Redirect admin to admin panel, everyone else to shop
    if (user.role === "admin") return res.redirect("/admin");
    res.redirect("/shop");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Login failed. Please try again.");
    res.redirect("/login");
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      req.flash("error_msg", "Email is already registered.");
      return res.redirect("/register");
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: "visitors" });

    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userRole = user.role;

    req.flash("success_msg", "Account created! Welcome to the shop.");
    res.redirect("/shop");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Registration failed. Please try again.");
    res.redirect("/register");
  }
};

export const logoutUser = (req, res) => {
  req.session.destroy();
  res.redirect("/login");
};
