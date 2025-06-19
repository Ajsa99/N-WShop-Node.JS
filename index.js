// const express = require('express');
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// app.use(express.json());
// app.use(cors());

// const RegLog = require("./Router/RegLog/reg_log");
// const User = require("./Router/Users/User");
// const Product = require("./Router/Product/product");

// app.use("/", User);
// app.use("/", RegLog);
// app.use("/", Product);

// module.exports = (req, res) => {
//     app(req, res);
// };

const express = require('express');
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const Port = 5000;

const RegLog = require("./Router/RegLog/reg_log");
const User = require("./Router/Users/User");
const Product = require("./Router/Product/product");

app.use("/", User);
app.use("/", RegLog);
app.use("/", Product);

app.listen(process.env.PORT || Port, () => {
  console.log(`Service running on port ${Port}`);
});
