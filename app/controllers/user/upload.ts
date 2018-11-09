import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import { Request, Router } from 'express'
import { digitalocean as DO } from "../../config";
import bcrypt from 'bcrypt';
aws.config.update({
    accessKeyId: DO.accessKeyId,
    secretAccessKey: DO.secretAccessKey
});

const router: Router = Router();

export const upload = multer({
    storage: multerS3({
        s3: new aws.S3({
            endpoint: DO.endpoint
        }),
        bucket: DO.bucket,
        acl: "public-read",
        key: function (request: Request, file, cb) {
            // @ts-ignore
            const user = request.user;
            bcrypt.hash(user.ouid, 8).then(hash => {
                hash = hash.replace(/[\\\/]/, '_'); // prevent / and \ in file_name
                file.originalname = `${hash}.jpg`;
                console.log('multer S3 listen', file);
                cb(null , file.originalname);
            }).catch((err: Error) => {
                cb(err, "");
            });
        },
    }),
}).single('file');

export const deleteFile = (async (name: string, callback: any) => {
    const s3 = new aws.S3({
        endpoint: DO.endpoint
    });
    const params = {Bucket: DO.bucket, Key: name};
    // @ts-ignore
    s3.deleteObject(params, callback)
})
// take 1 file from field name "image"
// }).array('image', 1); // take <= 1 file which name is "image"
// }).array('image', 5); // take <= 5 file which name is "image"
