const express = require('express');
const user_route = express();

const session = require('express-session')
const config=require('../config/config')

user_route.use(session({secret:config.sessionSecret}))

const auth =  require('../middleware/auth')

user_route.set('view engine','ejs')
user_route.set('views','./views/users')



const bodyParser = require('body-parser')
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))

const multer =require('multer')
const path = require('path')


user_route.use(express.static('public'));

const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null,path.join(__dirname, '../public/userImages'))
    },
    filename:function(req, file, cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})

const upload = multer({storage:storage});


const user_contoller = require("../controllers/userController")

user_route.get('/register', auth.isLogout ,user_contoller.loadRegister);

user_route.post('/register',upload.single('image'),user_contoller.insertUser)

user_route.get('/verify',user_contoller.verifyMail)

user_route.get('/', auth.isLogout ,user_contoller.loginLoad);
user_route.get('/login', auth.isLogout ,user_contoller.loginLoad);

user_route.post('/login',user_contoller.Verifylogin);

user_route.get('/home', auth.isLogin ,user_contoller.loadHome);

user_route.get('/logout', auth.isLogin ,user_contoller.userLogout);

user_route.get('/edit', auth.isLogin ,user_contoller.editLoad);

user_route.post('/edit',upload.single('image'),user_contoller.updateProfile);


module.exports = user_route;