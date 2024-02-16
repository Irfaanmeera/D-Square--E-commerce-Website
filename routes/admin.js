const express = require('express');
const { adminHomeController, addUser, editUser, deleteUser, adminLogin, adminLoginPostController, addUserPost, editUserPost, adminlogout} = require('../controller/adminController');
const app = express.Router()



app.get('/',adminHomeController)
app.get('/login',adminLogin);
app.get("/adduser",addUser)
app.get("/edituser",editUser)
app.get("/deleteuser",deleteUser)

app.post('/login',adminLoginPostController)
app.post('/adduser',addUserPost)
app.post('/edituser',editUserPost)
app.get('/logout',adminlogout)

module.exports = app;     