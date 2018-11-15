import { Router, Response, Request } from 'express'
import { Document } from 'mongoose';
import { google } from 'googleapis';
import _ from 'lodash';

import config from '../../config';
import serviceAccount from '../../firebase-key';
import db from '../../database/index';
import {fields} from '../../database/schema';

const sheets = google.sheets("v4");
const jwtClient = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
})

const router: Router = Router();
// Utility Function
// fields is imported;
const user2array = (user: any) => {
    console.log("USER TO ARRAY");
    console.log(user)
    console.log(Object.keys(user))
    console.log(fields)
    console.log("NEW SET")
    console.log(new Set([...fields, ...Object.keys(user)]))
    console.log(fields.map(key => user[key]));
    return fields.map(key => user[key]);
}

const exportRange = (numRow: number, numCol: number) => {
    const endCol = String.fromCharCode(64+numCol);
    return `A${2}:${endCol}${numRow+1}`;
}



const exportData = async () => {
    jwtClient.authorize().then(() => {
        db.users.find().then((users: Document[]) => {
            const userArray = users.map(user => user2array(user.toObject()));
            const request = {
                auth: jwtClient,
                spreadsheetId: config.spreadsheetId,
                range: exportRange(users.length+1, fields.length),
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values: userArray
                }
            }
            console.log('user array is ', userArray);
            sheets.spreadsheets.values.update(request, {}).then(() => {
                console.log("Update success");
            }).catch((err: Error) => {
                console.error("Error updating sheets:", err);
            })
            return true
        }) // throw
    }) // throw
}



// called by google sheet
router.post('/update-in', async (req: Request, res: Response) => {
    const users : any[] = _.attempt(() => JSON.parse(req.body.data));
    const replace = req.body.replace;
    if (_.isError(users) || !_.isArrayLike(users)) return res.status(400).send({
        success: false,
        msg: "bad request",
    })

    if (replace == 'true')
        await db.users.collection.drop();
    const promises = users.filter((user: any) => {
        const newUser = _.attempt(() => (new db.users(user)));
        return !_.isError(newUser);
    }).map(user => {
        // use studentId as ID
        return db.users.findOneAndUpdate({ studentId: user.studentId }, user, { upsert: true, runValidators: true }).catch(err => {
            console.log('[update-in]',user, 'is invalid!'); 
            return err;   // prevent rejection by catch so if some update fail other should still success
        }) // upsert = when create new row! 
    })


    Promise.all(promises).then((results: any[]) => {
        console.log("update ok", results);
        return res.send("OK");
    }).catch((err: Error) => {
        console.log(err);
        return res.status(500).send("Error");
    })

})
// to-do : delete-in , delete-out

router.get('/export', async (req: Request, res: Response) => {
    exportData().then(() => {
        return res.send("OK");
    }).catch((err: Error) => {
        console.error("Error Exporting", err);
        return res.status(500).send(err);
    })
})




export default router;