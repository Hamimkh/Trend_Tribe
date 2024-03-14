const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;
const cors = require("cors");
const connectToMongo = require("./config/mongoDB");
const authRouter = require("./routes/userRoutes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
connectToMongo();

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Routes
app.use("/api/user", authRouter);

// Middleares
app.use(notFound);
app.use(errorHandler);

// Server listen
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
