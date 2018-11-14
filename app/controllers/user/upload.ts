import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import { digitalocean as DO } from "../../config";

aws.config.update({
    accessKeyId: DO.accessKeyId,
    secretAccessKey: DO.secretAccessKey
  });
   
  export const upload = multer({
    storage: multerS3({
      s3: new aws.S3({
        endpoint: DO.endpoint
      }),
      bucket: DO.bucket,
      acl: "public-read",
      key: function(request, file, cb) {
        console.log('multer S3 listen =>', file);
        // @ts-ignore
        cb(null, request.filename = file.originalname);
      }
    })
  })
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
