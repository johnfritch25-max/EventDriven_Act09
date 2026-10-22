import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const Product = sequelize.define("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "General",
  },
});
