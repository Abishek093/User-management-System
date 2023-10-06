const User = require('../models/userModels');
const bcrypt = require('bcrypt');
const { query } = require('express');
const nodemailer = require('nodemailer');

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

const sendVerifyMail = async (name, email, user_id) => {
    try {
        // Create a transporter with your SMTP configuration
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'fileshare543@gmail.com',
                pass: 'igrx vvnc xxul ksyb', 
            },
        });

        // Compose the email
        const mailOptions = {
            from: 'fileshare543@gmail.com',
            to: email,
            subject: 'Email Verification',
            html: `<p>Hi ${name}, please click here to <a href="http://localhost:3000/verify?id=${user_id}">verify your email</a>.</p>`,
        };

        // Send the email
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email has been sent', info.response);
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};

const loadRegister = async (req, res) => {
    try {
        const message = ''; // Initialize the message variable
        res.render('registration', { message }); // Pass it as an empty string
    } catch (error) {
        console.log(error.message);
    }
};

const insertUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.phone,
            image: req.file.filename,
            password: spassword,
            is_admin: 0,
            is_verified: 0, // Initialize is_verified to 0
        });

        const userdata = await user.save(); // Await the save operation

        if (userdata) {
            sendVerifyMail(req.body.name, req.body.email, userdata._id);
            const message = 'Registration successful, verify your email'; // Set success message
            res.render('registration', { message });
        } else {
            const message = 'Registration failed'; // Set failure message
            res.render('registration', { message });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const verifyMail = async (req, res) => {
    try {
        // Update the user's is_verified status
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });
        console.log(updateInfo);
        res.render('email-verified');
    } catch (error) {
        console.log(error.message);
    }
}




//login user method

const loginLoad = async (req, res) => {
    try {
        const message = ''; // Initialize the message variable
        res.render('login', { message }); // Pass it as an empty string
    } catch (error) {
        console.log(error.message);
    }
};

const Verifylogin = async(req, res)=>{

    try {
        const email = req.body.email
        const password = req.body.password
        // console.log('Email received:',email);
        
        const userData = await User.findOne({email:email})
        // console.log('User data:', userData);


        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_verified === 0) { 
                    res.render('login', { message: 'Please verify your mail.' });
                } else {
                    req.session.user_id = userData._id 
                    res.redirect('/home');
                }
            } else {
                res.render('login', { message: 'Email or password is incorrect' });
            }
        } else {
            res.render('login', { message: 'Email or password is incorrect' });
        }
        
    } catch (error) {
        console.log(error.message);
    }
}


const loadHome = async(req, res)=>{

    try {
        // req.session.user_id = userData._id
        const userData = await User.findById({_id:req.session.user_id})
        res.render('home',{user:userData})

    } catch (error) {
        console.log('got',error.message);
    }
}

const userLogout = async(req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}


const editLoad = async(req, res)=>{
    try {
        
        const id = req.query.id;

        const userData = await User.findById({_id:id})
        if (userData) {
            res.render('edit',{user: userData})
        } else {
            res.redirect('/home')
        }
    } catch (error) {
        console.log(error.message);
    }
}


const updateProfile = async(req, res)=>{
    try {
        
        if (req.file) {
            const userData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name, email:req.body.email, phone:req.body.phone, image:req.file.filename}})

        } else {
            const userData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name, email:req.body.email, phone:req.body.phone}})
        }
        res.redirect('/home')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    Verifylogin,
    loadHome,
    userLogout,
    editLoad,
    updateProfile
};
