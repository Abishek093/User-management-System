const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/user_management_system');
const path = require('path')

const express = require('express');
const app = express();


app.use('/static', express.static(path.join(__dirname, 'public/assets')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));


//for user router

const userRoute = require('./routes/userRoute')
app.use('/',userRoute)
app.listen(3000, () =>{
  console.log('Server Started...');
})