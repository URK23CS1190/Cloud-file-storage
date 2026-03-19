import dotenv from "dotenv";
dotenv.config();
console.log("REGION:", process.env.AWS_REGION);
console.log("ACCESS KEY PRESENT:", !!process.env.AWS_ACCESS_KEY_ID);
console.log("SECRET KEY PRESENT:", !!process.env.AWS_SECRET_ACCESS_KEY);

import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://main.d2f39hoitjigz3.amplifyapp.com"
  ]
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/", uploadRoutes);

<<<<<<< HEAD
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  });
});
app.get("/", (req, res) => {
  res.send("Backend is running");
});
=======
const PORT = process.env.PORT || 5000;
>>>>>>> 6720bdf (Added Amplify S3 storage integration and removed hardcoded AWS secrets)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});