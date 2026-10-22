import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("Evn_act9", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});
