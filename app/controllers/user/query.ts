import {Router, Request, Response} from "express"
import db from "../../database/index";
import {Document} from "mongoose"

const router : Router = Router();

// register a new user
router.get("/get-all", (req : Request, res : Response) => {
    const limit : Number = req.query.limit || 50;
    // need to validate user

    db.users.find().then((docs: Document[]) => {
        return res.send({
            success: true,
            msg: "OK",
            data: docs,
        })
    }).catch((err: Error) => {
        console.error("[E] [QUERY-ALL]", err)
        return res.status(500).send({
            success: false,
            msg: "something went wrong",
            data: [],
        })
    })
})

router.post("/get", (req: Request, res: Response) => {
    const filter = req.body.filter;
    const limit = req.body.limit || 50; 

    db.users.find(filter).limit(limit).then((docs: Document[]) => {
        return res.send({
            success: true, 
            msg: "OK",
            data: docs,
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