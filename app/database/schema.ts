import {Schema} from 'mongoose';

export const userSchema: Schema = new Schema({
    time: Date,
    prefix: String,
    gender: String,
    name: String,
    lname: String,
    nickname: String,
    tel: String,
    imageURL: String,
})

