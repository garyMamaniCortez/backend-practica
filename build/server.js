"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const mongoose_1 = __importDefault(require("mongoose"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const User_1 = __importDefault(require("./models/User"));
const swaggerUi = require('swagger-ui-express'), swaggerDocument = require('../swagger.json');
class Server {
    constructor() {
        this.app = express_1.default();
        this.config();
        this.routes();
    }
    config() {
        //mongoose
        const MongoUri = 'mongodb://localhost/restapis';
        mongoose_1.default.set('useFindAndModify', true);
        mongoose_1.default.connect(MongoUri, {
            useNewUrlParser: true,
            useCreateIndex: true
        })
            .then(db => console.log('DB is connected'));
        //Settings-configuraciones
        this.app.set('port', process.env.PORT || 3000);
        //middelwares
        this.app.use(morgan_1.default('dev'));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: false }));
        this.app.use(helmet_1.default());
        this.app.use(compression_1.default());
        this.app.use(cors_1.default());
    }
    routes() {
        this.app.get("/user/:username", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ username: req.params.username })
                .populate('posts', 'title');
            res.json(user);
        }));
        this.app.post("/addUser", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const newUser = new User_1.default(req.body);
            yield newUser.save();
            res.json({ data: newUser });
        }));
        this.app.put("/user/:username", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { username } = req.params;
            const user = yield User_1.default.findOneAndUpdate({ username }, req.body, { new: true });
            res.json(user);
        }));
        this.app.delete("/user/:username", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { username } = req.params;
            yield User_1.default.findOneAndDelete({ username });
            res.json({ response: 'User Deleted' });
        }));
    }
    start() {
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        this.app.listen(this.app.get('port'), () => {
            console.log('Server on port', this.app.get('port'));
        });
    }
}
const server = new Server();
server.start();
