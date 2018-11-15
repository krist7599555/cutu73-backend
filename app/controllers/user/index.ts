import requests from "superagent";
import { Router, Request, Response, NextFunction } from "express";
import _ from "lodash";

import db from "../../database/index";
import config, { digitalocean } from "../../config";
import { upload, deleteFile } from "./upload";
import { digitalocean as DO } from "../../config";

const router: Router = Router();
const client = requests.agent();

const url = "https://account.it.chula.ac.th";
const HEADER = {
  Host: "account.it.chula.ac.th",
  Connection: "keep-alive",
  Accept: "application/json, text/javascript, */*; q=0.01",
  Origin: "https://account.it.chula.ac.th",
  "X-Requested-With": "XMLHttpRequest",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  Referer:
    "https://account.it.chula.ac.th/html/login.html?service=https%3A%2F%2Faccount.it.chula.ac.th%2Fhtml%2F&serviceName=Chula+SSO",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.9,th;q=0.8",
  Cookie: "JSESSIONID=CE6365762F63DA35A5501B5336A74B0D" // I think session ID doesn't matter at all
};

router.post("/login", (req, res) => {
  let { username, password } = req.body;

  client
    .post(`${url}/login`)
    .set(HEADER)
    .send({
      service: "http://chula.ml",
      username: username.slice(0, 8),
      password: password,
      serviceName: ""
    })
    .then(result => {
      const ticket = _.attempt(() => JSON.parse(result.text).ticket);
      console.log(result.text, ticket);
      if (ticket && !_.isError(ticket))
        return res
          .cookie("ticket", ticket, { maxAge: 86400 * 14, path: "/" })
          .status(200)
          .send("OK");
      else
        return res
          .clearCookie("ticket")
          .status(401)
          .send("Username/Password Error");
    })
    .catch(err => {
      console.error("[E] [LOGIN]", err);
      return res.status(500).send("something went wrong");
    });
});

const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ticket = req.cookies.ticket;
  if (!ticket) return res.status(401).send("no ticket");
  client
    .post(`${url}/serviceValidation`)
    .set({
      DeeAppId: config.appId,
      DeeAppSecret: config.appSecret,
      DeeTicket: ticket
    })
    .then((result: requests.Response) => {
      // @ts-ignore
      req.user = JSON.parse(result.text);
      /* Example response is {
          "uid": "5af5517aa7b11b000154e15d", "username": "60xxxxxx",
          "gecos": "Name LastName, faculty",
          "email": "60xxxxxxyy@student.chula.ac.th",
          "disable": false,
          "roles": [
              "student"
          ],
          "firstname": "xxxxxx",
          "lastname": "xxxxxx",
          "firstnameth": "xxxxxx",
          "lastnameth": "xxxxxxx",
          "ouid": "60xxxxxxyy"
      } */
      next();
    })
    .catch((err: Error) => {
      // catch 401 resp
      return res.status(401).send("invalid ticket");
    });
};

router.get("/getUserInfo", userMiddleware, (req: Request, res: Response) => {
  // @ts-ignore
  const userData = req.user;
  db.users
    .findOne({ studentId: userData.ouid })
    .then(doc => {
      if (doc === null)
        return res.status(200).send({
          registered: false,
          basicData: userData
        });
      else {
        return res.status(200).send({
          registered: true,
          basicData: userData,
          data: doc
        });
      }
    })
    .catch((err: Error) => {
      console.error("[E] [GET-USER-INFO]", err);
      return res.status(500).send({}); // send nothing
    });
});

router.post("/register", userMiddleware, (req: Request, res: Response) => {
  // TODO: unset some locked fields
  // @ts-ignore
  const studentId = req.user.ouid;
  let { form } = req.body;
  console.log("FORM =", form);
  if (
    _.isError(form) ||
    (form && form.validateSync && _.isError(form.validateSync()))
  )
    return res.status(400).send("bad request");
  form.studentId = form.รหัสนิสิต;
  if (form.studentId != studentId)
    return res.status(400).send("bad request studentId");
  db.users
    .create(form)
    .then(() => {
      return res.send("register success");
    })
    .catch(err => {
      if (err.code == 11000)
        // duplicate key error
        return res.status(403).send("you've already registered");
      console.error("[E] [REGISTER]", err);
      return res.status(500).send("something went wrong");
    });
});

router.post("/upload", userMiddleware, upload.single("image"), function(
  request,
  response
) {
  // @ts-ignore
  console.log("File uploaded successfully.", request.file, request.filename);
  response
    .status(200)
    // @ts-ignore
    .send(`http://${DO.bucket}.${DO.endpoint}/${request.filename}`);
});

export default router;
