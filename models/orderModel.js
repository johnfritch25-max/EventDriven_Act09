import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";
import { User } from "./userModel.js";

export const Order = sequelize.define("Order", {
  status: {
    type: DataTypes.ENUM("pending", "processing", "shipped", "delivered", "cancelled"),
    defaultValue: "pending",
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

export const OrderItem = sequelize.define("OrderItem", {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Associations
Order.hasMany(OrderItem, { as: "items", foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });
