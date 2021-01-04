//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bcrypt = require('bcrypt');

const saltRounds = 10;
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

 bcrypt.hash(userpassword,saltRounds,function(err,hash){

  const newUser = new UserModel({
    email: useremail,
    password: hash
  });

  newUser.save(function(err){
    if(!err){
      res.render("secrets");
    }else{
      console.log(err);
    }
  });
 });
});

app.post("/login",function(req,res){

  const userEmail = req.body.username ;
  const userPassword = req.body.password ;

 UserModel.findOne({email:userEmail},function(err,foundUser){
  if(!err){
    if(foundUser){
      bcrypt.compare(userPassword,foundUser.password,function(err,result){
        if(result === true){
          res.render("secrets");
        }else{
          console.log(err);
        }

      });


    }

  }else{
    console.log(err);
  }
 });
});


app.listen(PORT,function(){
  console.log("port "+PORT+" is going live");
});
