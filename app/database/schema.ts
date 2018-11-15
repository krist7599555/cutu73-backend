import { Schema } from 'mongoose';

// export const fields = ['studentId', 'image', 'prefix', 'name', 'lastname', 'gender', 'year', 'faculty',
//     'facultyId', 'division', 'birthday', 'tel', 'lineID', 'facebook',
//     'instragram', 'isInRcu', 'RcuBuilding', 'RcuRoom', 'RcuBed']

export const fields = ["รหัสนิสิต", "image", "คำนำหน้า", "ชื่อ", "สกุล", "เพศ", "ชั้นปี", "คณะ", "รหัสคณะ", "วันเกิด", "เบอร์โทร", "lineID", "facebook", "instagram", "ฝ่าย", "หอใน"]

export const userSchema = new Schema({
    studentId: {
        type: String,
        // required: true,
        unique: true,
        validate: {
            validator: function (id: any) {
                return /^[0-9]{10}$/.test(id)
            },
            message: `invalid student id. make sure it's 10 digits`
        }
    },
    image: {
        type: String,
    },
    prefix: {
        type: String,
        enum: ['นาย', 'นาง', 'นางสาว'],
        // required: true,
    },
    name: {
        type: String,
        // required: true,
    },
    lastname: {
        type: String,
        // required: true,
    },
    gender: {
        type: String,
        enum: ['ชาย', 'หญิง', 'อื่นๆ', 'ไม่ระบุ'],
    },
    year: {
        type: Number,
        // required: true,
        min: 1,
        max: 6,
    },
    faculty: {
        type: String,
        // required: true, // can't select by user
    },
    facultyId: {
        type: String,
        // required: true,// can't select by user
    },
    division: {
        type: String,
        // required: true,
        enum: [
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
        ],

    },
    birthday: {
        type: Date,
        // required: true,
    },
    tel: {
        type: String,
        // required: true,
        validate: {
            validator: function (tel: string) {
                return /^0[0-9]{2}-[0-9]{3}-[0-9]{4}$/.test(tel) ||
                    /^0[0-9]{1}-[0-9]{3}-[0-9]{4}$/.test(tel);
            },
            msg: ``
        }
    },
    lineID: {
        type: String,
    },
    facebook: {
        type: String,
    },
    instragram: {
        type: String,
    },
    isInRcu: {
        type: String,
        // required: true,
        enum: ["ไม่อยู่", "อยู่"],
    },
    RcuBuilding: {
        type: String,
        // required: [
            // () => {
            //     // @ts-ignore
            //     return this.isInRcu == 'อยู่';
            // required if stay in RCU']
    },
    RcuRoom: {
        type: String,
        // required: [
            // () => {
            //     // @ts-ignore
            //     return this.isInRcu == 'อยู่';
            // required if stay in RCU']
    },
    RcuBed: {
        type: String,
        // required: [
            // () => {
            //     // @ts-ignore
            //     return this.isInRcu == 'อยู่';
            // required if stay in RCU']
    },
}, { strict: false })

