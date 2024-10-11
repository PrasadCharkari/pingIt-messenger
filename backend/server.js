const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

dotenv.config();
connectDB();
const app = express();
app.use(express.json());

app.use("/api/user", userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(3000, console.log(`Server started on PORT ${PORT}`.yellow.bold));
