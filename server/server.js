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
    useCreateIndex: true,
    useFindAndModify:false
    
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
//models
const { User } = require('./models/user');

//middlewares
const { auth } =require('./middleware/auth');

app.get('/api/users/auth', auth, (req,res)=>{
    res.status(200).json({
        isAdmin: req.user.role === 0 ? false : true ,
        isAuth: true,
        email: req.user.email,
        name:req.user.name,
        lastname:req.user.lastname,
        role:req.user.role,
        cart:req.user.cart,
        history:req.user.history
    })

})

app.post('/api/users/register', (req,res) => {
    const user = new User(req.body);

    user.save((err,doc) => {
        if(err) return res.json({success:false,err});
        res.status(200).json({
            success:true
            
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
                res.cookie('w_auth',user.token).status(200).json({
                    loginSuccess:true
                })
            })
        })

    })
})


app.get('/api/users/logout',auth,(req,res)=>{

    User.findOneAndUpdate(
        {_id:req.user._id },
        { token:'' },
        (err,doc)=>{
            if(err) return res.json({success:false,err});
            return res.status(200).send({
                success:true
            })
        }
    )
})



const port = process.env.PORT || 3002;

app.listen(port, () => {
    console.log(`Server Running at ${port}`)
})