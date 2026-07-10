import cookieParser from "cookie-parser";
import cors from "cors";
import routes from './routes';
import express ,{ Application, Request, Response } from "express";
import config from "./config";
import globalErrorHandler from "./middlewares/errorhandler";
import notFound from "./middlewares/notFound";

const app: Application = express();

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser())

app.get("/",(req:Request,res:Response)=>{
    res.status(200).json({
    success: true,
    message: 'FixItNow API is running 🔧',
  });
})

app.use('/api', routes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;