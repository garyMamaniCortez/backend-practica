import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import {body, validationResult} from 'express-validator';
import {Request, Response} from 'express';

import User from './models/User';

const swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('../swagger.json');
class Server{
    public app: express.Application;

    constructor(){
        this.app = express();
        this.config();
        this.routes();
    }

    config(){
        //mongoose
        const MongoUri='mongodb://localhost/restapis';
        mongoose.set('useFindAndModify',true);
        mongoose.connect(MongoUri ,{
            useNewUrlParser: true,
            useCreateIndex: true
        })
            .then(db=> console.log('DB is connected'));
        //Settings-configuraciones
        this.app.set('port',process.env.PORT || 3000);
        //middelwares
        this.app.use(morgan('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended:false}));
    }

    routes(){
        this.app.get("/user/:username",async (req, res)=>{
            const user=await User.findOne({username:req.params.username})
                .populate('posts','title');
            res.json(user);
        });

        this.app.post("/addUser",[
        body('email').isEmail()], async(req: Request, res:Response)=>{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
              return res.status(400).json({ errors: errors.array() });
            }
            const newUser= new User(req.body);
            await newUser.save(); 
            res.json({data: newUser});
        });

        this.app.put("/user/:username", async(req, res)=>{
            const {username}=req.params;
            const user= await User.findOneAndUpdate({username}, req.body,{new:true});
            res.json(user);
        });
        
        this.app.delete("/user/:username", async(req, res)=>{
            const {username}=req.params;
            await User.findOneAndDelete({username});
            res.json({response: 'User Deleted'});
        });
    }

    start(){
        this.app.use('/api-docs', swaggerUi.serve, 
            swaggerUi.setup(swaggerDocument));
        this.app.listen(this.app.get('port'), ()=>{
            console.log('Server on port', this.app.get('port'));
        })
    }
}
const server= new Server();
server.start();
