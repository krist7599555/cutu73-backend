import { Router, Request, Response } from "express"
import db from "../../database/index";
import { Document } from "mongoose"
import _ from 'lodash';

const router: Router = Router();

// register a new user
router.get("/get-all", (req: Request, res: Response) => {
    let { limit, fields, exclude } = req.query;

    limit = _.parseInt(limit);
    // make projection arrays
    let projection: any = {}
    fields = _.attempt(JSON.parse, fields);
    if (_.isError(fields)) fields = [];
    let N = exclude === 'true' ? 0 : 1;
    fields.forEach((f: string) => projection[f] = N);

    if (!limit) return res.status(400).send({
        success: false,
        msg: "you need to specify limit"
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
    let { filter, limit, fields, exclude } = req.body;

    filter = _.attempt(JSON.parse, filter);
    limit = _.parseInt(limit);

    // make projection arrays
    let projection: any = {}
    fields = _.attempt(JSON.parse, fields);
    if (_.isError(fields)) fields = [];
    let N = exclude === 'true' ? 0 : 1;
    fields.forEach((f: string) => projection[f] = N);

    if (_.isError(filter) || _.isArrayLike(filter) || !limit) return res.status(400).send({
        success: false,
        msg: "bad limit or filter",
    })

    db.users.find(filter).limit(limit).select(projection).lean().then((docs: Document[]) => {
        return res.send({
            success: true,
            msg: "OK",
            data: docs,
        })
    }).catch((err: Error) => {
        console.error("[E] [QUERY]", err);
        return res.status(500).send({
            success: false,
            msg: "something went wrong",
        })
    })
})

export default router;