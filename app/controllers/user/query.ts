import {Router, Request, Response} from "express"
import db from "../../database/index";
import {Document} from "mongoose"
import _ from 'lodash';

const router : Router = Router();

// register a new user
router.get("/get-all", (req : Request, res : Response) => {
    let {limit} = req.query;
    
    limit = _.parseInt(limit);

    if (!limit) return res.status(400).send({
        success: false,
        msg: "you need to specify query"
    })

    db.users.find().limit(limit).then((docs: Document[]) => {
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
    let {filter, limit} = req.body;

    filter = _.attempt(JSON.parse, filter);
    limit = _.parseInt(limit); 

    if (_.isError(filter) || !limit) return res.status(400).send({
        success: false,
        msg: "bad limit or filter",
    }) 

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