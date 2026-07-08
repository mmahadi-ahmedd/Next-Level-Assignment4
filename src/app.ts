import cookieParser from "cookie-parser";
import cors from "cors";
import express ,{ Application, Request, Response } from "express";
import config from "./config";
import { AuthRoutes } from "./modules/auth/auth.routes";

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

app.use("/api/auth", AuthRoutes)

export default app;