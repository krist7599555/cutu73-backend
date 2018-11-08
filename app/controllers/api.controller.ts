import {Request, Response, Router} from 'express';
import UserAPI from './user/index';
import SyncAPI from './sync/index';
const router: Router = Router();

router.use('/user', UserAPI);
router.use('/sync', SyncAPI);


// this just output any body sent to it
router.post('/debug', (req: Request, res: Response) => {
    console.log(req.body);
    return res.send("OK");
});
export const APIController : Router = router;