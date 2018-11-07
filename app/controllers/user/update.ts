import { Router, Request, Response } from "express"
import db from "../../database/index";
import { Document } from "mongoose"

const router: Router = Router();


// prevent accidentially update many
router.post("/update-one", (req: Request, res: Response) => {
    const { filter, update, upsert } = req.body;

    db.users.find(filter).then((docs: Document[]) => {
        if (docs.length === 0) {
            if (upsert == true) {
                db.users.create(update).then(() => {
                    return res.send({
                        success: true,
                        msg: "upserted"
                    })
                })
            }
            else {
                return res.status(404).send({
                    success: true,
                    msg: "no value to update",
                })
            }
        } 
        else if (docs.length > 1){
            return res.status(400).send({
                success: true,
                msg: "ambiguos filter, must have only one value to update",
            })
        }
        else {
            docs[0].update(update).then(() => {
                return res.send({
                    success: true,
                    msg: "OK",
                })
            }) // let them catch
        }
    }).catch((err: Error) => {
        console.error("[E] [QUERY]", err);
        return res.status(500).send({
            success: false,
            msg: "something went wrong",
        })
    })
})

router.post("/update-many", (req: Request, res: Response) => {
    const { filter, update, upsert } = req.body;

    db.users.find(filter).then((docs: Document[]) => {
        if (docs.length === 0) {
            return res.status(404).send({
                success: true,
                msg: "no value to update",
            })
        } 
        else if (docs.length > 1){
            return res.status(400).send({
                success: true,
                msg: "ambiguos filter, must have only one value to update",
            })
        }
        else {
            docs[0].update(update).then(() => {
                return res.send({
                    success: true,
                    msg: "OK",
                })
            }) // let them catch
        }
    }).catch((err: Error) => {
        console.error("[E] [QUERY]", err);
        return res.status(500).send({
            success: false,
            msg: "something went wrong",
        })
    })
})

export default router;