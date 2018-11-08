import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import logger from 'morgan';
import {APIController} from './controllers/index';
import cookieParser from 'cookie-parser';

const port: String = process.env.PORT || '3000';
const app = express(); // somehow i can't define type of this variable
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(cookieParser());

app.use('/api/v1', APIController);
app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})

