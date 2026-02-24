import  express ,{ Express } from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import loginRoute from "./routes/authRoute.js";
import adminRoute from "./routes/adminRoute.js";

const app: Express = express();


// abhi ke liye bas itna hi
app.use(cors())
app.use(express.json());



// admin route
app.use("/api/v1/admin", adminRoute)

// login route
app.use("/api/v1/auth", loginRoute)




const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});