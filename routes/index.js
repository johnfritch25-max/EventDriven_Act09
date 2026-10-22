import express from "express";
import {
  loginPage,
  registerPage,
  forgotPasswordPage,
  loginUser,
  registerUser,
  logoutUser,
  dashboardPage,
} from "../controllers/authController.js";
import {
  shopPage,
  cartPage,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
  checkoutPage,
  placeOrder,
  ordersPage,
} from "../controllers/shopController.js";
import {
  adminDashboard,
  productsPage,
  addProductPage,
  addProduct,
  editProductPage,
  editProduct,
  deleteProduct,
  ordersPage as adminOrdersPage,
  updateOrderStatus,
  usersPage,
  updateUserRole,
} from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

// ─── Public Routes ─────────────────────────────────────────────────────────────
router.get("/", (req, res) => res.redirect("/shop"));
router.get("/shop", shopPage);

// ─── Auth Routes ───────────────────────────────────────────────────────────────
router.get("/login", loginPage);
router.post("/login", loginUser);
router.get("/register", registerPage);
router.post("/register", registerUser);
router.get("/forgot-password", forgotPasswordPage);
router.get("/dashboard", dashboardPage);
router.get("/logout", logoutUser);

// ─── Cart Routes (any logged-in user) ─────────────────────────────────────────
router.get("/cart", cartPage);
router.post("/cart/add/:id", addToCart);
router.post("/cart/update/:id", updateCart);
router.post("/cart/remove/:id", removeFromCart);
router.post("/cart/clear", clearCart);

// ─── Checkout & Orders (must be logged in) ────────────────────────────────────
router.get("/checkout", requireAuth, checkoutPage);
router.post("/checkout", requireAuth, placeOrder);
router.get("/orders", requireAuth, ordersPage);

// ─── Admin Routes (admin role only) ───────────────────────────────────────────
router.get("/admin", requireAuth, requireRole("admin"), adminDashboard);

router.get("/admin/products", requireAuth, requireRole("admin"), productsPage);
router.get("/admin/products/add", requireAuth, requireRole("admin"), addProductPage);
router.post("/admin/products/add", requireAuth, requireRole("admin"), ...addProduct);
router.get("/admin/products/edit/:id", requireAuth, requireRole("admin"), editProductPage);
router.post("/admin/products/edit/:id", requireAuth, requireRole("admin"), ...editProduct);
router.post("/admin/products/delete/:id", requireAuth, requireRole("admin"), deleteProduct);

router.get("/admin/orders", requireAuth, requireRole("admin"), adminOrdersPage);
router.post("/admin/orders/status/:id", requireAuth, requireRole("admin"), updateOrderStatus);

router.get("/admin/users", requireAuth, requireRole("admin"), usersPage);
router.post("/admin/users/role/:id", requireAuth, requireRole("admin"), updateUserRole);

export default router;
