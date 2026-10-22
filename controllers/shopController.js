import { Product } from "../models/productModel.js";
import { Order, OrderItem } from "../models/orderModel.js";

// ─── Shop / Product Listing ───────────────────────────────────────────────────

export const shopPage = async (req, res) => {
  try {
    const { search, category } = req.query;
    const where = {};

    if (search) {
      const { Op } = await import("sequelize");
      where.name = { [Op.like]: `%${search}%` };
    }
    if (category) where.category = category;

    const products = await Product.findAll({ where, order: [["createdAt", "DESC"]] });
    const categories = await Product.findAll({
      attributes: ["category"],
      group: ["category"],
    });

    res.render("shop", {
      title: "Shop",
      products: products.map((p) => p.toJSON()),
      categories: categories.map((c) => c.category),
      search: search || "",
      selectedCategory: category || "",
      user: req.session.userName || null,
      role: req.session.userRole || null,
    });
  } catch (err) {
    console.error(err);
    res.render("shop", { title: "Shop", products: [], categories: [], error: "Failed to load products." });
  }
};

// ─── Cart (session-based) ─────────────────────────────────────────────────────

export const cartPage = (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  // Attach subtotal to each item for the template
  const cartWithSubtotals = cart.map((item) => ({
    ...item,
    subtotal: (item.price * item.qty).toFixed(2),
  }));
  res.render("cart", {
    title: "My Cart",
    cart: cartWithSubtotals,
    total: total.toFixed(2),
    user: req.session.userName || null,
    role: req.session.userRole || null,
  });
};

export const addToCart = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const product = await Product.findByPk(productId);
    if (!product) {
      req.flash("error_msg", "Product not found.");
      return res.redirect("/shop");
    }

    if (!req.session.cart) req.session.cart = [];
    const cart = req.session.cart;

    const existing = cart.find((i) => i.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: productId,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        qty: 1,
      });
    }

    req.flash("success_msg", `"${product.name}" added to cart.`);
    res.redirect("/shop");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Could not add to cart.");
    res.redirect("/shop");
  }
};

export const updateCart = (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const qty = parseInt(req.body.qty, 10);
  const cart = req.session.cart || [];

  if (qty <= 0) {
    req.session.cart = cart.filter((i) => i.id !== productId);
  } else {
    const item = cart.find((i) => i.id === productId);
    if (item) item.qty = qty;
  }
  res.redirect("/cart");
};

export const removeFromCart = (req, res) => {
  const productId = parseInt(req.params.id, 10);
  req.session.cart = (req.session.cart || []).filter((i) => i.id !== productId);
  req.flash("success_msg", "Item removed from cart.");
  res.redirect("/cart");
};

export const clearCart = (req, res) => {
  req.session.cart = [];
  res.redirect("/cart");
};

// ─── Checkout / Orders ────────────────────────────────────────────────────────

export const checkoutPage = (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect("/cart");
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  res.render("checkout", {
    title: "Checkout",
    cart,
    total: total.toFixed(2),
    user: req.session.userName,
    role: req.session.userRole,
  });
};

export const placeOrder = async (req, res) => {
  try {
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect("/cart");

    const { address } = req.body;
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const order = await Order.create({
      userId: req.session.userId,
      total: total.toFixed(2),
      address,
      status: "pending",
    });

    for (const item of cart) {
      await OrderItem.create({
        orderId: order.id,
        productName: item.name,
        quantity: item.qty,
        price: item.price,
      });
    }

    req.session.cart = [];
    req.flash("success_msg", "Order placed successfully!");
    res.redirect("/orders");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Failed to place order.");
    res.redirect("/checkout");
  }
};

export const ordersPage = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.session.userId },
      include: [{ model: OrderItem, as: "items" }],
      order: [["createdAt", "DESC"]],
    });
    res.render("orders", {
      title: "My Orders",
      orders: orders.map((o) => o.toJSON()),
      user: req.session.userName,
      role: req.session.userRole,
    });
  } catch (err) {
    console.error(err);
    res.render("orders", { title: "My Orders", orders: [] });
  }
};
