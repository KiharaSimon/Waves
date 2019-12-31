const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');


const app = express();
const mongoose = require('mongoose');
dotenv.config();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
    
})
    .then(connection => {
        console.log('Connected to MongoDB')
    })
    .catch(error => {
      console.log(error.message)
     })

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

//Users routes
const { User } = require('./models/user');

app.post('/api/users/register', (req,res) => {
    const user = new User(req.body);

    user.save((err,doc) => {
        if(err) return res.json({success:false,err});
        res.status(200).json({
            success:true,
            userdata:doc
        })
    })
})


app.post('/api/users/login', (req,res) => {

    User.findOne({'email':req.body.email},(err,user)=>{
        if(!user) return res.json({loginSuccess:false,message:'Auth failed, Email not found'});

        user.comparePassword(req.body.password,(err,isMatch)=>{
            if(!isMatch) return res.json({loginSuccess:false,message:'wrong password'});

            user.generateTokens((err,user)=>{
                if(err) return res.status(400).send(err);
                res.cookie('w-auth',user.token).status(200).json({
                    loginSuccess:true
                })
            })
        })

    })
})



const port = process.env.PORT || 3002;

app.listen(port, () => {
    console.log(`Server Running at ${port}`)
})