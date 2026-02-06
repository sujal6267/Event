import express from "express"

const app = express();//create express app

app.use(express.json());


//routes
import userRoute from "./routes/user.route.js";


//decalre route
app.use("/api/v1/users",userRoute)

//example route:https://localhost:4000/api/v1/users/register

export default app;