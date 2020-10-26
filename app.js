//Should import package in Hyper terminal.

//Like importing packages.
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose");
var fs = require('fs');
var path = require('path');
var multer = require('multer');

//Connecting to real Database in mongoose website.
//mongoose.connect('mongodb+srv://admin-vineeth:Test123@cluster0.rbcaz.mongodb.net/<dbname>', {useNewUrlParser: true, useUnifiedTopology: true});
//Connecting to local db in our computer.
mongoose.connect('mongodb://localhost:27017/imaDB', {useNewUrlParser: true, useUnifiedTopology: true});

const app = express();
 app.use(bodyParser.urlencoded({extended:true}));//To grab the form that is entered by user.
 app.use(bodyParser.json())
app.use(express.static("public"));//folders like css and images and sounds etc.
app.set('view engine', 'ejs');//install ejs also.

var imageSchema = new mongoose.Schema({
    name: String,
    desc: String,
    dept:String,
    img:{
        data: Buffer,
        contentType: String
    },
    ques:[],
    answ:[]
});

const imgModel = mongoose.model("Image",imageSchema);

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});



var upload = multer({ storage: storage });

//To send html and css to the initail screen.
app.get("/addNotice",function(req,res){

  imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render('index.ejs', { items: items });
        }
    });
});


//First posts it into the location spcified in action in html like "/" and
//and server picks it up that is in the form and posts to the screen after user hits submit butto or something.
app.post('/addNotice', upload.single('image'), (req, res, next) => {



    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        dept:req.body.department,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    imgModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.redirect('/addNotice');
        }
    });
});


app.post("/delete",function(req,res){
  imgModel.findByIdAndRemove(req.body.cb,function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("successfully deleted!");
      //Code below is to retrive the images of that department after deleted
      imgModel.find({dept:req.body.selecteddept},(err,items)=>{
        if (err) {
            console.log(err);
        }
        else {
            res.render('depar.ejs', { items: items });
        }
      });
    }
  });
});

app.get("/notice",function(req,res){
  res.render("depar.ejs",{ items: [] })
})

app.post("/notice",function(req,res){
  console.log(req.body.dep)
  imgModel.find({dept:req.body.dep},(err,items)=>{
    if (err) {
        console.log(err);
    }
    else {
        res.render('depar.ejs', { items: items });
    }
  })
});

app.get("/wishes",function(req,res){
  res.render("admin.ejs")
});

app.post("/wishes",function(req,res){
  console.log(req.body.wish)
  if (req.body.wish == "shownotice"){
    res.redirect("/notice")
  }
  else{
    res.redirect("/addNotice")
  }
})

//Code below to add recieve questions posted.
app.post("/notice/addQues",function(req,res){
  console.log(req.body.idofnot)

  imgModel.findByIdAndUpdate(req.body.idofnot, { "$push": { "ques":req.body.desc } },
                           function (err, docs) {
   if (err){
       console.log(err)
   }
   else{
       console.log("Updated User : ");
       //Code below is to retrive the images of that department after adding the question.
       imgModel.find({dept:req.body.selecteddept},(err,items)=>{
         if (err) {
             console.log(err);
         }
         else {
             res.render('depar.ejs', { items: items });
         }
       });
   }
});

});

//Code below to add recieve answers posted.

app.post("/notice/addAns",function(req,res){
  console.log(req.body.idofnot)

  imgModel.findByIdAndUpdate(req.body.idofnot, { "$push": { "answ":req.body.desc } },{ "new": true, "upsert": true },
                           function (err, docs) {
   if (err){
       console.log(err)
   }
   else{
       console.log("Updated User : ");
       //Code below is to retrive the images of that department after adding the answer.
       imgModel.find({dept:req.body.selecteddept},(err,items)=>{
         if (err) {
             console.log(err);
         }
         else {
             res.render('depar.ejs', { items: items });
         }
       });
   }
});

});



//Calling the server
app.listen(3000,function(){
  console.log("Server is running in port 3000")
})
