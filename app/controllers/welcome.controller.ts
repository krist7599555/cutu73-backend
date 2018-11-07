import {Router, Request, Response } from 'express';


const router: Router = Router();


router.get('/', (req: Request, res: Response) => {
    return res.send("Hello world");
})

router.get('/:name', (req: Request, res: Response) => {
    let {name} = req.params;
    return res.send(`Hello, ${name}`);
})

export const WelcomeController: Router = router; // rename and export
