import { Router, Request, Response } from "express"
import db from "../../database/index";
import _ from 'lodash';
import { Document } from 'mongoose';
import Faker from 'faker/locale/en_US'

const router: Router = Router();

//test 
const generateUser = function () {
    return {
        studentId: Faker.random.number({min: 6000000000, max: 6300000000, precision: 1}),
        image: Faker.internet.avatar(),
        prefix: Faker.random.arrayElement(['นาย', 'นาง', 'นางสาว']),
        name: Faker.name.firstName(),
        lastname: Faker.name.findName(),
        gender: Faker.random.arrayElement(['ชาย', 'หญิง', 'อื่นๆ', 'ไม่ระบุ']),
        year: Faker.random.number({min: 1, max: 6, precision: 1}),
        faculty: Faker.commerce.department(),
        facultyId: Faker.random.number({min: 21, max: 40, precision: 1}),
        division: Faker.random.arrayElement([
                "ผู้เข้าร่วมงาน",
                "บัตรและอุปกรณ์",
                "ATและทะเบียน",
                "ถ่ายภาพ",
                "วิทยุสื่อสาร",
                "สวัสดิการ",
                "สถานที่",
                "พยาบาล",
                "ประสาน กบจ.",
                "ประสานจุดนัดพบ",
                "ประสานขบวน",
                "หลบฝน",
                "ประธานจัดงาน",
                "รองประธานจัดงาน",
                "อำนวยการ 1",
                "อำนวยการ 2",
                "ประสาน",
                "เลขา",
                "เหรัญญิก"
            ]),
        birthday: Faker.date.past(20),
        tel: '000-000-0000',
        lineID: Faker.internet.userName(),
        facebook: Faker.internet.userName(),
        instragram: Faker.internet.userName(),
        isInRcu: Faker.random.arrayElement(["ไม่อยู่", "อยู่"]),
        RcuBuilding: '-',
        RcuRoom: '-',
        RcuBed: '-',
    }
}

// register a new user
router.post("/", (req: Request, res: Response) => {
    let { user } = req.body;
    // need to validate user
    let newUser;
    try {
        user = JSON.parse(user);
        newUser = new db.users(user);
    }
    catch (err) {
        console.log("[I] [CREATE] ", err.message);
        return res.status(400).send({
            success: false,
            message: "bad user data",
        })
    }

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
    let data: any[] = req.body.users;

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
            data: { count: docs.length }
        })
    }).catch((err: Error) => {
        console.error("[E] [CREATE-MANY]", err)
        return res.status(500).send({
            success: false,
            msg: "something went wrong",
        })
    })
})

router.get('/mock', (req: Request, res: Response) => {
    const newUser = new db.users(generateUser());

    newUser.save().then(() => {
        return res.send({
            success: true,
            msg: "OK",
        })
    }).catch((err: Error) => {
        console.error("[E] [MOCK-USER]", err);
        return res.status(500).send({
            success: false,
            msg: "Error,"
        })
    })
})

export default router;

