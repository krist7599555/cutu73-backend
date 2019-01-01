import { Router, Request, Response, NextFunction } from "express";
const router: Router = Router();

import { exec } from "child_process";
async function sh(cmd: string) {
  return new Promise((resolve: any, reject: any) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

router.get("/", (req, res) => {
  return res.sendStatus(200);
});

import * as fs from "fs";

async function writeFile(path: string, value: string) {
  try {
    return await fs.promises.writeFile(
      "/root/filesharing/cutu73" + path,
      value
    );
  } catch (e) {
    return null;
  }
}
async function readFile(path: string) {
  try {
    return await fs.promises.readFile("/root/filesharing/cutu73" + path);
  } catch (e) {
    return null;
  }
}

router.get("/getText", async (req, res) => {
  if (!req.body.path) {
    return res.status(300).send("no path in: " + JSON.stringify(req.body));
  }
  return res.status(200).send(await readFile(req.body.path));
});
router.post("/setText", async (req, res) => {
  if (!req.body.value || !req.body.path)
    return res
      .status(300)
      .send("no value or path in: " + JSON.stringify(req.body));
  try {
    await writeFile(req.body.path, req.body.value);
    return res.status(200).send(await readFile(req.body.path));
  } catch (e) {
    return res.status(400).send(e);
  }

  return;
  // return res.sendStatus(200);
  // return sh(cmd)
  //   .then(r =>
  //     res.status(200).send({
  //       ...r,
  //       cmd
  //     })
  //   )
  //   .catch(e => res.status(300).send(e));
});

export default router;
