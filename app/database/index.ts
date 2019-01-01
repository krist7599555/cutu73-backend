import mongoose from "mongoose";
import config from "../config";
import { userSchema } from "./schema";

const client = mongoose.createConnection(config.mongoURL, {
  useNewUrlParser: true,
  useCreateIndex: true
});
client.on("connected", () => {
  console.log("mongoose connected! " + config.mongoURL);
});
const models = {
  users: client.model("users", userSchema)
};

export * from "./schema";
export default models;
