import {Router, Request, Response, NextFunction} from 'express';
import Create from './create';
import Remove from './remove';
import Update from './update';
import Query from './query';

const router: Router = Router();

// test authen
const requireAuthen = (req: Request, res: Response, next: NextFunction) => {
    if (req.header("password") != 'superstrongpassword') {
        return res.status(403).send({
            success: false,
            msg: "please enter password",
        })
    }
    else {
        next();
    }
}

router.use(requireAuthen)

router.use('/create', Create);
router.use('/remove', Remove);
router.use('/update', Update);
router.use('/query', Query);



export default router;