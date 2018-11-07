import { Router, Response, Request } from 'express'
import { Document } from 'mongoose';
import db from '../database/index'
import Faker from 'faker/locale/en_US';
import { promisify } from 'util';
import { google } from 'googleapis';
import serviceAccount from '../firebase-key';
import config from '../config';
import { analytics } from 'googleapis/build/src/apis/analytics';

const sheets = google.sheets("v4");
const jwtClient = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
})

const router: Router = Router();

// Utility Function
const fields = ["time", "prefix", "gender", "name", "lname", "nickname", "tel", "imageURL"];
const user2array = (user: any) => {
    return fields.map(key => user[key]);
}

const exportData = async () => {
    jwtClient.authorize().then(() => {
        db.users.find().then((users: Document[]) => {
            const userArray = users.map(user => user2array(user));
            const request = {
                auth: jwtClient,
                spreadsheetId: config.spreadsheetId,
                range: 'A2:H' + users.length + 1,
                valueInputOption: "RAW",
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
///



router.get("/get", (req: Request, res: Response) => {
    const { limit, filter } = req.query;
    db.users.find(filter || {}).limit(limit || 50).then((docs: Document[]) => {
        return res.send(docs);
    })
})

router.get("/add-mock-user", (req: Request, res: Response) => {
    const newUser = {
        time: Date.now(),
        prefix: Faker.random.arrayElement(["นาย", "นางสาว"]),
        gender: Faker.random.arrayElement(["M", "F"]),
        name: Faker.name.firstName(),
        lname: Faker.name.lastName(),
        nickname: Faker.name.firstName(),
        tel: '000-000-0000',
        age: Faker.internet.avatar(),
    }
    db.users.create(newUser).then((user: Document) => {
        return res.send(user);
    })
        .catch((err: Error) => {
            console.error(err);
            return res.status(500).send("Error");
        })
})

// called by google sheet
router.post('/update-in', (req: Request, res: Response) => {
    try {
        const users: any[] = JSON.parse(req.body.data);
        const nonEmpty = users.filter((user: any) => {
            return !!user.name;
        })
        let promises = nonEmpty.map((user: any) => {
            // use some field as id
            console.log("updating ... ", user);
            return db.users.findOneAndUpdate({ name: user.name }, user, { upsert: true }) // upsert = when create new row! 
        })
        Promise.all(promises).then((results: any[]) => {
        console.log("update ok")
        return res.send("OK");
        }).catch((err: Error) => {
            console.log(err);
            return res.status(500).send("Error");
        })
    }
    catch (err) {
        console.log("Error happened")
        return res.status(400).send("Bad data");
    }
})

router.post('/update-out', (req: Request, res: Response) => {
    try {
        const filter : any = JSON.parse(req.body.filter);
        const update : any = JSON.parse(req.body.update);
        const updateMany : String = req.body.updateMany;
        if (!update) throw new Error("Update must not be empty");
        if (update.hasOwnProperty('name')) throw new Error("You don't update name DansGame"); 
        db.users.find(filter).then((docs: Document[]) => {
            if (docs.length > 1 && updateMany !== "true") return res.status(400).send("more than 1 record will be update, use updateMany: true to update")
            if (docs.length == 0) return res.send("No record to update");
            
            let numUpdate: Number = docs.length;
            const promises = docs.map(doc => doc.update(update))
            Promise.all(promises).then(() => {
                // return res.send("OK");
            }).catch((err: Error) => {
                console.error("Error updating records", err);
                return res.status(500).send("Error updating");
            }).then(() => {
                // maybe should import instead (to restore ?)
                exportData().then(() => {
                    return res.send(`updated ${numUpdate} record(s)`);
                }).catch((err: Error) => {
                    console.error("Error Exporting", err);
                    return res.status(500).send("Error Exporting");
                })
            })

        }).catch((err: Error) => {
            console.error("Error Querying:", err);
            return res.status(500).send("Error");
        })
    }
    catch (err) {
        console.error(err);
        return res.status(400).send("Bad Request")
    }

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



export const UserAPI = router;