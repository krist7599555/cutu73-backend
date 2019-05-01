import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import { digitalocean as DO } from "../../config";

export const diskStorage = (path: string, _filename: string) => {
  return multer({
    storage: multer.diskStorage({
      destination: "/root/filesharing/cutu73" + path,
      filename: (request, file, cb) => {
        // @ts-ignore
        request.filename = file.originalname = _filename;
        return cb(null, _filename);
      }
    })
  });
};

export const awsDo = (path: string, _filename: string) => {
  console.log("aws");
  return multer({
    storage: multerS3({
      s3: new aws.S3({
        endpoint: DO.endpoint + path,
        accessKeyId: DO.accessKeyId,
        secretAccessKey: DO.secretAccessKey
      }),
      bucket: DO.bucket,
      acl: "public-read",
      key: function(request, file, cb) {
        file.filename = file.originalname = _filename;
        return cb(null, _filename);
      }
    })
  });
};
