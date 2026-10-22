import { Product } from "../models/productModel.js";
import { Order, OrderItem } from "../models/orderModel.js";
import { User } from "../models/userModel.js";
import { upload } from "../middleware/upload.js";
import fs from "fs";
import path from "path";

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export const adminDashboard = async (req, res) => {
  try {
    const [productCount, orderCount, userCount, recentOrders] = await Promise.all([
      Product.count(),
      Order.count(),
      User.count(),
      Order.findAll({
        limit: 5,
        order: [["createdAt", "DESC"]],
        include: [{ model: OrderItem, as: "items" }],
      }),
    ]);

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      productCount,
      orderCount,
      userCount,
      recentOrders: recentOrders.map((o) => o.toJSON()),
      user: req.session.userName,
      role: req.session.userRole,
    });
  } catch (err) {
    console.error(err);
    res.render("admin/dashboard", { title: "Admin Dashboard", error: "Failed to load dashboard." });
  }
};

// ─── Products CRUD ────────────────────────────────────────────────────────────

export const productsPage = async (req, res) => {
  const products = await Product.findAll({ order: [["createdAt", "DESC"]] });
  res.render("admin/products", {
    title: "Manage Products",
    products: products.map((p) => p.toJSON()),
    user: req.session.userName,
    role: req.session.userRole,
  });
};

export const addProductPage = (req, res) => {
  res.render("admin/product-form", {
    title: "Add Product",
    product: null,
    user: req.session.userName,
    role: req.session.userRole,
  });
};

export const addProduct = [
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description, price, stock, category } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : null;
      await Product.create({ name, description, price, stock, category, image });
      req.flash("success_msg", "Product added successfully.");
      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      req.flash("error_msg", "Failed to add product.");
      res.redirect("/admin/products/add");
    }
  },
];

export const editProductPage = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      req.flash("error_msg", "Product not found.");
      return res.redirect("/admin/products");
    }
    res.render("admin/product-form", {
      title: "Edit Product",
      product: product.toJSON(),
      user: req.session.userName,
      role: req.session.userRole,
    });
  } catch (err) {
    req.flash("error_msg", "Failed to load product.");
    res.redirect("/admin/products");
  }
};

export const editProduct = [
  upload.single("image"),
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        req.flash("error_msg", "Product not found.");
        return res.redirect("/admin/products");
      }

      const { name, description, price, stock, category } = req.body;

      // If a new image was uploaded, delete the old one
      if (req.file) {
        if (product.image) {
          const oldPath = path.join("public", product.image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        product.image = `/uploads/${req.file.filename}`;
      }

      product.name = name;
      product.description = description;
      product.price = price;
      product.stock = stock;
      product.category = category;
      await product.save();

      req.flash("success_msg", "Product updated.");
      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      req.flash("error_msg", "Failed to update product.");
      res.redirect(`/admin/products/edit/${req.params.id}`);
    }
  },
];

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      if (product.image) {
        const imgPath = path.join("public", product.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }
      await product.destroy();
      req.flash("success_msg", "Product deleted.");
    }
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Failed to delete product.");
    res.redirect("/admin/products");
  }
};

// ─── Orders Management ────────────────────────────────────────────────────────

export const ordersPage = async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: OrderItem, as: "items" },
        { model: User, attributes: ["name", "email"] },
      ],
    });
    res.render("admin/orders", {
      title: "Manage Orders",
      orders: orders.map((o) => o.toJSON()),
      user: req.session.userName,
      role: req.session.userRole,
    });
  } catch (err) {
    console.error(err);
    res.render("admin/orders", { title: "Manage Orders", orders: [] });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (order) {
      order.status = req.body.status;
      await order.save();
      req.flash("success_msg", "Order status updated.");
    }
    res.redirect("/admin/orders");
  } catch (err) {
    req.flash("error_msg", "Failed to update order.");
    res.redirect("/admin/orders");
  }
};

// ─── Users Management ─────────────────────────────────────────────────────────

export const usersPage = async (req, res) => {
  const users = await User.findAll({ order: [["createdAt", "DESC"]] });
  res.render("admin/users", {
    title: "Manage Users",
    users: users.map((u) => u.toJSON()),
    user: req.session.userName,
    role: req.session.userRole,
  });
};

export const updateUserRole = async (req, res) => {
  try {
    const target = await User.findByPk(req.params.id);
    if (target) {
      target.role = req.body.role;
      await target.save();
      req.flash("success_msg", "User role updated.");
    }
    res.redirect("/admin/users");
  } catch (err) {
    req.flash("error_msg", "Failed to update role.");
    res.redirect("/admin/users");
  }
};
