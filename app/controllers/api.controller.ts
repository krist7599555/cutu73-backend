import {Request, Response, Router} from 'express';
import DBAPI from './db/index';
import SyncAPI from './sync/index';
import UserAPI from './user/index';
const router: Router = Router();

router.use('/user', UserAPI);
router.use('/sync', SyncAPI);
router.use('/db', DBAPI);

// this just output any body sent to it
router.post('/debug', (req: Request, res: Response) => {
    console.log(req.body);
    return res.send("OK");
});
export const APIController : Router = router;