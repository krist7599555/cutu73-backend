import {Router, Request, Response} from "express"
import db from "../../database/index";
import {Document} from "mongoose"

const router : Router = Router();

// register a new user
router.post("/drop", (req : Request, res : Response) => {
    const confirm = req.body.confirm;
    if (confirm === 'yes i will drop') { // to prevent accident drop LUL
        db.users.collection.drop().then(() => {
            console.log("[W] [DROP] collection was dropped.")
            return res.send({
                success: true,
                msg: "droped",
            })
        }).catch((err: Error) => {
            console.error("[E] [DROP]", err);
            return res.status(500).send({
                success: false,
                msg: "something went wrong",
            })
        })
    }
    else {
        return res.status(400).send({
            success: false,
            msg: "please confirm that you will drop",
        })
    }
})

router.post("/remove-many", (req: Request, res: Response) => {
    const filter = req.body.filter;

    db.users.remove(filter).then(() => {
        return res.send({
            success: true,
            msg: "removed",
        })
    }) .catch((err: Error) => {
        console.error("[E] [QUERY]", err);
        return res.status(500).send({
            success: false,
            msg: "something went wrong",
        })
    })
})

export default router;