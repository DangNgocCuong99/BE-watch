import express from 'express';
import cors from 'cors';
import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv'
import routerUser from './route/user'
import routerAuth from './route/auth';
import routerPayment from './route/payment';

process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
});
dotenv.config();
const {DATABASE_USERNAME,DATABASE_LOCAL,LOCALHOST,DATABASE_PASSWORD,DATABASE,MODE} = process.env


const app = express()
const port = process.env.PORT || 3008

const DB = MODE === "online" ? DATABASE.replace(
    "<password>",
    DATABASE_PASSWORD
).replace("<username>", DATABASE_USERNAME) : DATABASE_LOCAL.replace("localhost", LOCALHOST);

app.use(cors({}));
app.use(express.json());
app.use('/user', routerUser)
app.use('/auth' , routerAuth)
app.use('/payment',routerPayment)

app.use(function (req, res) {
    res.status(404).send({ url: req.originalUrl + " not found" });
});

app.listen(port);

console.log("Server started on: " + port);

mongoose.Promise = global.Promise;
const Connection = async () => {
    try {
        await mongoose.connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as ConnectOptions);
        console.log(`modeMongoDb: ${process.env.mode}`);
        console.log(` Database Connected : ${DB}`);
    } catch (error) {
        console.log(error);
    }
};
Connection();


