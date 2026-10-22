import { Sequelize } from "sequelize";
import { sequelize } from "./models/db.js";
import { User } from "./models/userModel.js";
import { Product } from "./models/productModel.js";
import { Order, OrderItem } from "./models/orderModel.js";
import inquirer from "inquirer";

const rootSequelize = new Sequelize("mysql://root:@localhost:3306/");

const { createDb } = await inquirer.prompt([
  {
    type: "confirm",
    name: "createDb",
    message: "Database 'Evn_act9' may not exist. Create it?",
    default: true,
  },
]);

if (createDb) {
  await rootSequelize.query("CREATE DATABASE IF NOT EXISTS Evn_act9;");
  console.log("✅ Database created (if it did not exist)");
}

const { forceSync } = await inquirer.prompt([
  {
    type: "confirm",
    name: "forceSync",
    message: "⚠️  Force sync? This will DROP and recreate all tables.",
    default: false,
  },
]);

try {
  await sequelize.authenticate();
  console.log("✅ Connected to MySQL database!");
  await sequelize.sync({ force: forceSync });
  console.log(`✅ Tables synced (force: ${forceSync})`);

  // Seed a default admin account if none exists
  const adminExists = await User.findOne({ where: { role: "admin" } });
  if (!adminExists) {
    const bcrypt = await import("bcrypt");
    await User.create({
      name: "Admin",
      email: "admin@shop.com",
      password: await bcrypt.default.hash("admin123", 10),
      role: "admin",
    });
    console.log("✅ Default admin created: admin@shop.com / admin123");
  }
} catch (err) {
  console.error("❌ Migration failed:", err);
} finally {
  process.exit();
}
