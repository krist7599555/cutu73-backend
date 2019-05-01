import requests from "superagent";
import { Router, Request, Response, NextFunction } from "express";
import _ from "lodash";
import db from "../../database/index";
import config from "../../config";
import fetch from "isomorphic-fetch";

const router: Router = Router();
const client = requests.agent();

const url = "https://account.it.chula.ac.th";
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
  // if (req.query && !req.query.force) {
  // return res.status(405).send("ปิดระบบ");
  // }
  let { username, password } = req.body;
  // console.log("LOGIN =", username, password);
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
    body: `username=${username.slice(
      0,
      8
    )}&password=${password}&service=https%3A%2F%2Faccount.it.chula.ac.th%2Fhtml%2F&serviceName=Chula+SSO`,
    method: "POST",
    mode: "cors"
  })
    .then(async (result: any) => {
      let txt = await result.text();
      // console.log("LOGIN RESULT=", txt);
      let ticket = JSON.parse(txt).ticket;
      // console.log("TICKET=", ticket);
      if (ticket)
        return res
          .cookie("ticket", ticket, { maxAge: 1 * 60 * 60 * 1000, path: "/" })
          .status(200)
          .send(ticket);
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
  // return res.status(405).send("ปิดระบบ");
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
      // @ts-ignore
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

router.post("/updateRole", (req, res) => {
  let { ouid, ฝ่าย } = req.body;
  if (!ouid || !ฝ่าย) return res.status(400).send("no ouid or ฝ่าย in " + JSON.stringify(req.body));
  db.users
    .updateOne({ รหัสนิสิต: ouid }, { ฝ่าย }, { upsert: true })
    .then(() => db.users.findOne({ รหัสนิสิต: ouid }).then(doc => res.status(200).send(doc)));
});
router.post("/register", userMiddleware, (req, res) => {
  // @ts-ignore
  const studentId = req.user.ouid;
  let { form } = req.body;
  if (typeof form == "string") form = JSON.parse(form);
  // console.log("FORM =");
  // console.log(form);
  if (_.isError(form) || (form && form.validateSync && _.isError(form.validateSync())))
    return res.status(400).send("bad request");
  form.studentId = form.รหัสนิสิต;
  if (form.studentId != studentId) return res.status(400).send("bad request studentId");
  db.users
    .updateOne({ รหัสนิสิต: studentId }, form, { upsert: true })
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

router.get("/card", (req, res) => {
  return res.status(300).send({
    message: "require /card/???"
  });
});

import shell from "shelljs";
import { ConfigurationServicePlaceholders } from "aws-sdk/lib/config_service_placeholders";

router.get("/card/:ouid", (req, res) => {
  const ouid = req.params.ouid;
  db.users
    .findOne({ studentId: ouid })
    .then(async doc => {
      if (doc === null)
        return res.status(300).send({
          message: "not found " + ouid
        });
      else if (doc != null) {
        // @ts-ignore
        const convert = {
          "27": "ครุฯ",
          "38": "จิตวิทยา",
          "32": "ทันตะ",
          "34": "นิติ",
          "28": "นิเทศ",
          "36": "พยาบาล",
          "26": "บัญชี",
          "30": "แพทย์",
          "33": "เภสัช",
          "24": "รัฐศาสตร์",
          "23": "วิทยา",
          "39": "วิทย์กีฬา",
          "21": "วิศวฯ",
          "35": "ศิลปกรรม",
          "29": "Econ",
          "25": "สถาปัตย์",
          "37": "สหเวช",
          "31": "สัตวะ",
          "22": "อักษร",
          "40": "SAR"
        };
        const doc2 = doc.toObject();
        // @ts-ignore
        doc2["_facultyexl"] = convert[doc2["รหัสคณะ"]];
        console.log(">>>>>");
        console.log(doc2);
        console.log(doc2["รหัสคณะ"]);
        console.log(doc2["_facultyexl"]);
        console.log("<<<<<");

        shell.cd(
          process.env.NODE_ENV == "production"
            ? "/root/cutu73/app/controllers/user/card-generator/preset/cutu73"
            : "~/Documents/cutu73-backend/app/controllers/user/card-generator/preset/cutu73"
        );
        shell.echo(JSON.stringify(doc2)).to("tmp.txt");
        const genconf = shell.exec("python3 run.py < tmp.txt > newconfig.txt");
        new Promise((resolve, reject) =>
          shell.exec(
            "python3 ../../main.py < newconfig.txt",
            (code: number, stdout: string, stderr: string) => {
              if (code == 0) {
                shell.cp(`output/${ouid}.png`, `/root/filesharing/cutu73/card/${ouid}.png`);
                return resolve(`/card/${ouid}.png`);
              } else {
                return reject(
                  "error run python\n" +
                    stdout +
                    "\n" +
                    stderr +
                    "\n" +
                    "we are on: " +
                    shell.pwd().toString()
                );
              }
            }
          )
        )
          .then(txt => res.status(200).send(txt))
          .catch(txt => res.status(400).send(txt));
      }
    })
    .catch(err => {
      console.error(err);
      return res.status(400).send(err);
    });
});

export default router;
