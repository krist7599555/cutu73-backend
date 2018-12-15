import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import logger from "morgan";
import { APIController } from "./controllers/index";
import cookieParser from "cookie-parser";
import cors from "cors";

const port: String = process.env.PORT || "3000";
const app = express(); // somehow i can't define type of this variable

// with creditial, cors can not be *
app.use(
  cors({
    origin: [/.|127.0.0.1|localhost|chula|cutu73/],
    credentials: true // send cookies
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(cookieParser());

app.use("/api/v1", APIController);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (err) res.status(500).send("Something went wrong");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
