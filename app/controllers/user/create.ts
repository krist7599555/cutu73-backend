import {Router, Request, Response} from "express"
import db from "../../database/index";
import _ from 'lodash';
import {Document} from 'mongoose';

const router : Router = Router();

// register a new user
router.post("/", (req : Request, res : Response) => {
    const data = req.body.user;
    // need to validate user

    const newUser = new db.users(data);
    
    const err = newUser.validateSync();
    if (err) {
        console.error("[E] Register :", err);
        return res.status(400).send({
            success: false,
            msg: "user isn't valid",
        })
    } else {
        newUser.save().then(() => {
            console.log("[I] [CREATE] user created");
            return res.send({
                success: true,
                msg: "user created",
            })
        }).catch((err: Error) => {
            console.error("[E] [CREATE]", err)
            return res.status(500).send({
                success: false,
                msg: "something went wrong",
            })
        })
    }
})

router.post("/create-many", (req: Request, res: Response) => {
    let data : any[] = req.body.users;

    // 
    data = data.filter(user => { // filter only valid
        return !_.isError(new db.users(user).validateSync())
    }).map(user => {
        return _.unset(user, '_id'); // no defining id allowed
    })

    db.users.insertMany(data).then((docs: Document[]) => {
        console.log(`[I] [CREATE-MANY] created ${docs.length} documents`);
        return res.send({
            success: true,
            msg: "OK",
            data: {count: docs.length}
        })
    }).catch((err: Error) => {
        console.error("[E] [CREATE-MANY]", err)
            return res.status(500).send({
                success: false,
                msg: "something went wrong",
            })
    })
})

export default router;