import requests from "superagent";
import { Router, Request, Response, NextFunction } from "express";
import _ from "lodash";
import axios from "axios";

import db from "../../database/index";
import config, { digitalocean } from "../../config";
import { upload, deleteFile } from "./upload";
import { digitalocean as DO } from "../../config";
import Axios from "axios";
import fetch from "isomorphic-fetch";
import { json } from "body-parser";

const router: Router = Router();
const client = requests.agent();

const url = "https://account.it.chula.ac.th";
// const HEADER = {
//   Host: "account.it.chula.ac.th",
//   Connection: "keep-alive",
//   Accept: "application/json, text/javascript, */*; q=0.01",
//   Origin: "https://account.it.chula.ac.th",
//   "X-Requested-With": "XMLHttpRequest",
//   "User-Agent":
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
//   "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
//   Referer:
//     "https://account.it.chula.ac.th/html/login.html?service=https%3A%2F%2Faccount.it.chula.ac.th%2Fhtml%2F&serviceName=Chula+SSO",
//   "Accept-Encoding": "gzip, deflate, br",
//   "Accept-Language": "en-US,en;q=0.9,th;q=0.8",
//   // Cookie: "JSESSIONID=CE6365762F63DA35A5501B5336A74B0D" // I think session ID doesn't matter at all
//   Cookie: "JSESSIONID=631EC3945D5AE7E67157F20A056E21A0" // I think session ID doesn't matter at all
// };
const HEADER = {
  Pragma: "no-cache",
  Origin: "https://account.it.chula.ac.th",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en,da;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36",
  Accept: "application/json, text/javascript, */*; q=0.01",
  "Cache-Control": "no-cache",
  "X-Requested-With": "XMLHttpRequest",
  Connection: "keep-alive",
  Referer:
    "https://account.it.chula.ac.th/html/login.html?service=https%3A%2F%2Faccount.it.chula.ac.th%2Fhtml%2F&serviceName=Chula+SSO",
  "Content-Type": "application/x-www-form-urlencoded"
};

router.post("/login", (req, res) => {
  let { username, password } = req.body;
  console.log("LOGIN =", username, password);
  // client
  //   .post(`${url}/login`)
  //   .set(HEADER)
  //   .send({
  //     service: "http://chula.ml",
  //     username: username.slice(0, 8),
  //     password: password,
  //     serviceName: "CUTU73"
  //   })
  // axios({
  //   method: "POST",
  //   url: url + "/login",
  //   headers: HEADER,
  //   withCredentials: false,
  //   data: {
  //     service: "http://128.199.216.159:1991",
  //     serviceName: "Chula SSO",
  //     username: username.slice(0, 8),
  //     password: password,
  //   }
  // })
  fetch("https://account.it.chula.ac.th/login", {
    credentials: "include",
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en,da;q=0.9",
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      pragma: "no-cache",
      "x-requested-with": "XMLHttpRequest"
    },
    referrer:
      "https://account.it.chula.ac.th/html/login.html?service=https%3A%2F%2Faccount.it.chula.ac.th%2Fhtml%2F&serviceName=Chula+SSO",
    referrerPolicy: "no-referrer-when-downgrade",
    body:
      `username=${username.slice(0, 8)}&password=${password}&service=https%3A%2F%2Faccount.it.chula.ac.th%2Fhtml%2F&serviceName=Chula+SSO`,
    method: "POST",
    mode: "cors"
  })
    .then(async (result) => {
      let txt = await result.text();
      console.log("LOGIN RESULT=", txt);
      let ticket = JSON.parse(txt).ticket;
      console.log("TICKET=", ticket);
      if (ticket)
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
    .catch((err: any) => {
      console.error("[E] [LOGIN]", err);
      return res.status(500).send("something went wrong");
    });
});

const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ticket = req.cookies.ticket;
  if (!ticket) return res.status(401).send("no ticket");
  //   console.log(`${url}/serviceValidation`)
  //   console.log(`
  // DeeAppId:${config.appId},
  // DeeAppSecret:${config.appSecret},
  // DeeTicket:${ticket}
  //   `)
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
      // @ts-ignore
      console.log(result.text);
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
  if (typeof form == "string") form = JSON.parse(form);
  console.log("FORM =");
  console.log(form);
  if (
    _.isError(form) ||
    (form && form.validateSync && _.isError(form.validateSync()))
  )
    return res.status(400).send("bad request");
  form.studentId = form.รหัสนิสิต;
  if (form.studentId != studentId)
    return res.status(400).send("bad request studentId");
  db.users
    .update({ รหัสนิสิต: studentId }, form, { upsert: true })
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
  console.log("File uploaded successfully. filename ", request.filename);
  response
    .status(200)
    // @ts-ignore
    .send(`http://${DO.bucket}.${DO.endpoint}/${request.filename}`);
});

export default router;
