const express = require("express");
const app = express();
const nocache = require("nocache");
const bodyparser = require("body-parser");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const hbs = require("hbs");
const path = require("path");
const dotenv = require("dotenv").config();
const connection = require("./config/dbConnect");
connection();
const session = require("express-session");
const flash = require("express-flash");

const PORT = 3000;

app.use(
  session({
    secret: "Secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 6000000 },
  })
);
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Register partials
hbs.registerPartials(path.join(__dirname, "views", "partials"));

//register helpers
hbs.registerHelper("product", (val1, val2) => val1 * val2);
hbs.registerHelper("sum", (val1, val2) => val1 + val2);
hbs.registerHelper("lessThan", (val1, val2) => val1 < val2);
hbs.registerHelper("gt", (val1, val2) => val1 > val2);
hbs.registerHelper("equal", (val1, val2) => val1 == val2);
hbs.registerHelper("arrayLength", (val) => val.length);
hbs.registerHelper("ifCond", function (v1, v2, options) {
  if (v1 == v2) {
    return options.fn(this);
  }
  return "";
});

app.use(express.static(__dirname + "/public"));
// app.use(express.static('public'));
app.use(nocache());
app.use(flash());

app.use("/admin", adminRouter);
app.use("/", userRouter);

app.use((req,res)=>{
  res.render('user/404')
});

app.listen(PORT, () => {
  console.log("Server is connected successfully");
});
