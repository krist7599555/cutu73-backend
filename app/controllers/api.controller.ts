import {Request, Response, Router} from 'express';
import {UserAPI} from './user-api';

const router: Router = Router();

router.use('/user', UserAPI);
router.post('/pipe', (req: Request, res: Response) => {
    console.log(req.body);
    return res.send("OK");
});
export const APIController : Router = router;