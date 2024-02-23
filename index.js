const express = require ('express')
const app = express();
const nocache = require("nocache");
const bodyparser = require("body-parser");
const authRouter = require('./routes/authRoute')
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const hbs = require('hbs');
const path = require('path');
const connection = require("./config/dbConnect");
connection();
const session = require("express-session");
const flash = require('express-flash')

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
app.set('views', path.join(__dirname, 'views'));

// Register partials
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));


app.use(express.static(__dirname + '/public'));
// app.use(express.static('public'));
app.use(nocache());
app.use(flash());




app.use('/api/user',authRouter);
app.use("/", userRouter);
app.use("/admin", adminRouter);



app.listen(PORT,()=>{
    console.log('Server is connected successfully')
})