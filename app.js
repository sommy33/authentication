//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const encrypt = require('mongoose-encryption')

const PORT = 3000;
const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/userDB",{ useNewUrlParser: true , useUnifiedTopology: true });

const userScheam = new mongoose.Schema({
  email:String,
  password:String
});

const secret =  process.env.SECRET;                                             //THIS IS FROM .env file
userScheam.plugin(encrypt,{secret:secret,encryptedFields:["password"]});      //ALWAYS DECLEARE THIS LINE BEFORE CREATING A MODEL

const UserModel = new mongoose.model("users",userScheam);

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){

  const useremail = req.body.username ;
  const userpassword = req.body.password ;

  const newUser = new UserModel({
    email: useremail,
    password: userpassword
  });
  newUser.save(function(err){
    if(!err){
      res.render("secrets");
    }else{
      console.log(err);
    }
  });
});

app.post("/login",function(req,res){

  const userEmail = req.body.username ;
  const userPassword = req.body.password ;

 UserModel.findOne({email:userEmail},function(err,foundUser){
  if(!err){
    if(foundUser){
      if(foundUser.password === userPassword){
        res.render("secrets");
      }
    }

  }else{
    console.log(err);
  }
 });


});










app.listen(PORT,function(){
  console.log("port "+PORT+" is going live");
});