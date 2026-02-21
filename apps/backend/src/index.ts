import  express ,{ Express } from "express";
import dotenv from "dotenv";

dotenv.config();

import { prisma } from "@repo/db";



const app: Express = express();

app.get("/", async(req, res) => {
  res.send("Hello World!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});