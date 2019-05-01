import { Router, Request, Response, NextFunction } from "express";
import _ from "lodash";
import shell from "shelljs";
import express from "express";
const router: Router = Router();

// import { exec } from "child_process";
// async function sh(cmd: string) {
//   return new Promise((resolve: any, reject: any) => {
//     exec(cmd, (err, stdout, stderr) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve({ stdout, stderr });
//       }
//     });
//   });
// }

import serveIndex from "serve-index";

router.use(
  "/static",
  express.static("/root/filesharing/cutu73"),
  serveIndex("/root/filesharing/cutu73", { icons: true })
);
import * as fs from "fs";
console.assert(fs.promises !== undefined);

interface pathInformationType {
  pathOnly: string;
  filenameOnly: string;
  filename: string;
  extension: string;
  fullpath: string;
}
function pathInformation(fullpath: string) {
  fullpath = fullpath.replace("/api/v1", "");
  const dot = fullpath.lastIndexOf(".");
  const slash = fullpath.lastIndexOf("/");
  return {
    pathOnly: fullpath.slice(0, slash),
    filenameOnly: fullpath.slice(slash + 1, dot),
    filename: fullpath.slice(slash + 1),
    extension: fullpath.slice(dot),
    fullpath: fullpath
  };
}

async function writeFile(fullpath: string, value: string) {
  const info = pathInformation(fullpath);
  console.log(info);
  return new Promise((res, rej) => {
    shell.mkdir("-p", "/root/filesharing/cutu73" + info.pathOnly);
    fs.writeFile("/root/filesharing/cutu73" + info.fullpath, value, {}, err => {
      if (err) return rej(err);
      return res(value);
    });
  });
}
async function readFile(fullpath: string) {
  return new Promise((res, rej) => {
    fs.readFile("/root/filesharing/cutu73" + fullpath, (err, data) => {
      if (err) return rej(err);
      return res(data.toString());
    });
  });
}

import util from "util";
import * as upload from "./upload";
import { ConfigurationServicePlaceholders } from "aws-sdk/lib/config_service_placeholders";
import { rejects } from "assert";

router.get("*", async (req, res) => {
  const path = req.url; // /template/_input_form.json
  console.log("path", path);
  try {
    return res.status(200).send(await readFile(path));
  } catch (e) {
    return res.status(404).send("not found file on " + path);
  }
});

function splitPath(req: Request, res: Response, next: NextFunction) {
  const fullpath: string = req.originalUrl.slice(req.baseUrl.length);
  res.locals = _.assign({}, res.locals, pathInformation(fullpath));
  next();
}

router.post(/\.(jpg|jpeg|png)/, splitPath, async (req, res) => {
  const info: pathInformationType = res.locals;
  const awsDo = upload.awsDo(info.pathOnly, info.filename).single("image");
  const diskStorage = upload
    .diskStorage(info.pathOnly, info.filename)
    .single("image");
  Promise.all(
    [awsDo, diskStorage].map(
      m =>
        new Promise((resolve, rej) =>
          m(req, res, (err: any) => {
            // console.log(req.file);
            if (err) {
              rej(err);
            } else {
              resolve(req.file);
            }
          })
        )
    )
  )
    .then(files => {
      // console.log(files);
      // res.status(200).send(files);
      return res.status(200).send(info.fullpath);
    })
    .catch(err => {
      console.error(err);
      return res.status(400).send(err);
    });
});
router.post(/\.(json|txt|csv)/, splitPath, async (req, res) => {
  const value = req.body.value;
  if (!value) return res.status(300).send("no value in body");
  try {
    return res.status(200).send(await writeFile(res.locals.fullpath, value));
  } catch (e) {
    return res.status(404).send("can not write file on " + res.locals.fullpath);
  }
});
// router.post("*", (req, res) => {
//   console.log("DEFAULT");
//   return res.sendStatus(200);
// });

export default router;
