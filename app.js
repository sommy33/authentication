//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const session= require('express-session');                         //to create cookie in browser
const passport=require('passport');                               //to Authenticate
const passposrtLocalMongoose = require('passport-local-mongoose') //Authenticate in mongoDB

const PORT = 3000;
const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret:"little secret",
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());              //initialize the passport
app.use(passport.session());                //will create cookie

mongoose.connect("mongodb://localhost:27017/userDB",{ useNewUrlParser: true , useUnifiedTopology: true });
mongoose.set('useCreateIndex',true);
const userScheam = new mongoose.Schema({
  email:String,
  password:String
});

userScheam.plugin(passposrtLocalMongoose);

const UserModel = new mongoose.model("users",userScheam);

passport.use(UserModel.createStrategy()); //this creats a local login strategy

passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

app.post("/register",function(req,res){
  const useremail = req.body.username ;
  const userpassword = req.body.password;

   UserModel.register({username:useremail},userpassword,function(err,user){
     if(err){
       console.log(err);
       res.redirect("/register");
     }else{
       passport.authenticate("local")(req,res,function(){
         res.redirect("/secrets");
       });
     }
   });
});

app.post("/login",function(req,res){
  const useremail = req.body.username ;
  const userpassword = req.body.password ;

  const user = new UserModel({
    username:useremail,
    password:userpassword
  });

  req.login(user,function(err){
    if(!err){
      passport.authenticate('local')(req,res,function(){
        res.redirect("/secrets");
      });
    }else{
      console.log(err);
    }
  });
});


app.listen(PORT,function(){
  console.log("port "+PORT+" is going live");
});
