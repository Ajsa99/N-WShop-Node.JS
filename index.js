// const express = require('express');
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// app.use(express.json());
// app.use(cors());

// const Port = 5000;

// const RegLog = require("./Router/RegLog/reg_log");
// const User = require("./Router/Users/User");
// const Product = require("./Router/Product/product");

// app.use("/", User);
// app.use("/", RegLog);
// app.use("/", Product);

// app.listen(process.env.PORT || Port, () => {
//   console.log(`Service running on port ${Port}`);
// });

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
