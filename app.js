//Should import package in Hyper terminal.

//Like importing packages.
require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose");
var fs = require('fs');
var path = require('path');
var multer = require('multer');
// testing
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
//till here

const bcrypt = require("bcrypt");
const saltRounds = 10;


// Related to gridfs from here.
const conn = mongoose.createConnection('mongodb+srv://admin-vineeth:Test123@cluster0.rbcaz.mongodb.net/imaDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: 'mongodb+srv://admin-vineeth:Test123@cluster0.rbcaz.mongodb.net/imaDB',
  file: (req, file) => {
    return new Promise((resolve, reject) => {
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
    });
  }
});
const upload = multer({ storage });

//Till here



//Connecting to real Database in mongoose website.//just un comment the below line.
mongoose.connect('mongodb+srv://admin-vineeth:Test123@cluster0.rbcaz.mongodb.net/imaDB', {useNewUrlParser: true, useUnifiedTopology: true});
//Connecting to local db in our computer.
// mongoose.connect('mongodb://localhost:27017/imaDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

const app = express();

app.use(methodOverride('_method'));

app.use(bodyParser.urlencoded({
  extended: true
})); //To grab the form that is entered by user.
app.use(bodyParser.json())
app.use(express.static("public")); //folders like css and images and sounds etc.
app.set('view engine', 'ejs'); //install ejs also.

var imageSchema = new mongoose.Schema({
  notno:Number,
  name: String,
  desc: String,
  dept: String,
  date: Date,
  img: {
    data:[],
    type:[],
    ide:[]
  },
  uofques:[],
  tofques:[],
  justtime:[],
  ques: [],
  answ: []
});

const imgModel = mongoose.model("Image", imageSchema);

///PRACTISE BELOW MONTH///
// imgModel.find({date:{ $gte: '2021-02-01', $lte: '2021-02-28' },dept:'CSE'},'name dept',function(err,file){
// console.log(file);
//
// });

///PRACTISE ABOVE///



//**************************************************************************Tesing**********************************************//

const userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  uname: String,
  staffid: String,
  dept: String,
  email: String,
  typeofuser:String,
  password: String
});

const User = new mongoose.model("User", userSchema)


app.get("/", function(req, res) {
  res.render("home")
});

app.get("/login", function(req, res) {
  res.render("login")
});

app.post("/login", function(req, res) {
  tou = '';//To idetify the current type of user.....
  User.findOne({
    email: req.body.username
  }, function(err, foundOne) {
    if (foundOne) {
      bcrypt.compare(req.body.password, foundOne.password, function(err, result) {
        if (result === true) {
          currentuseremailid = req.body.username;
          tou = foundOne.typeofuser;
          // console.log(tou)
          // app.locals.toue = 'ff';
          res.redirect('/wishes?valid=' + foundOne._id)
        } else {
          res.status(404).send("<style> body {background-color: #f2dede;} h2 {text-align: center; margin: 22rem}  </style> <h2 style='color:	#c3737b;'> USERNAME OR PASSWORD IS WORNG CHECK ONCE AGAIN</h2>");
        }
      });
    } else {
      res.status(404).send("<style> body {background-color: #f2dede;} h2 {text-align: center; margin: 22rem}  </style> <h2 style='color:	#c3737b;'> NOT YET REGISTERED</h2>");
    }
  });
});


app.post('/testotp',function(req,res){

  // console.log(req.body.ide);
  // console.log(req.body.otp);
  // console.log(currentuseremailid)

  if (ot === req.body.otp){

    res.redirect('/wishes?valid=' + req.body.ide)
  }
  else{
    var ff = mongoose.Types.ObjectId(req.body.ide)
    User.findByIdAndRemove(ff, function(err) {
      if (err) {
        console.log(err);
      } else {
        //console.log("successfully deleted!");
        //Code below is to retrive the images of that department after deleted
        currentuseremailid = '' ;
        tou = '';
        res.redirect("/register");
      }
    });

  }

});


app.get("/register", function(req, res) {
  res.render("register")
});

app.post("/register", function(req, res) {
  //USER - STAFF //REMEMBER//
  tou = '';
  currentuseremailid =  req.body.username;//GLOBAL
  var temp = ''

  const paragraph = currentuseremailid;
  const regex = '^[a-zA-Z0-9]+\.[a-zA-Z]{2}[0-9]{2}@[rvce]+\.[edu]+\.[in]{2}$';
  const found = paragraph.match(regex);
  if(found===null){
    temp = 'staff'
  }else{
    temp = 'student'
  }

  ot = Math.floor(Math.random()*(999-100+1)+100).toString();
  let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: enter your email id,
      pass: enter your password
    }
  });

  let mailDetails = {
    from: enter your email id,
    to: req.body.username,
    subject: 'Test mail',
    text: ot
  };

  mailTransporter.sendMail(mailDetails, function(err, data) {
    if(err) {
      console.log(err);
    } else {
      console.log("Mail sent!!! Check Your Mail");
    }
  });

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new User({
      fname: req.body.fname,
      lname: req.body.lname,
      uname: req.body.uname,
      staffid: req.body.sid,
      dept: req.body.dname,
      email: req.body.username,
      typeofuser:temp,
      password: hash
    });

    User.find({
      email: req.body.username
    }, function(err, foundItem) {
      if (!err) {
        //console.log(foundItem)
        if (foundItem.length === 0) {
          newUser.save(function(err) {
            if (!err) {
              tou = newUser.typeofuser;
              res.render('otpcheck',{ido:newUser._id})
              //res.redirect('/wishes?valid=' + newUser._id)
            } else {
              console.log(err);
            }
          });
        } else {
          res.status(404).send("<style> body {background-color: #f2dede;} h2 {text-align: center; margin: 22rem}  </style> <h2 style='color:	#c3737b;'>The specified email is already registered please enter different one!</h2>");
        }
      }
    });

  });

});





//**************************************************************************Tesing**********************************************//





//To send html and css to the initail screen.
app.get("/addNotice", function(req, res) {

  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      res.render('index.ejs', {
        files: items,
        item:globalinfoofuser
      });
    }
  });
});

//First posts it into the location spcified in action in html like "/" and
//and server picks it up that is in the form and posts to the screen after user hits submit butto or something.
app.post('/addNotice', upload.array('myfile',4), (req, res, next) => {

//console.log(globalinfoofuser)

  var arr = []
  var arr1=[]
  var arr2=[]

  req.files.forEach(function(file){
     arr.push(file.filename)
     arr2.push(file.id)
     if (
       file.contentType === 'image/jpeg' ||
       file.contentType === 'image/png'
     ) {
       arr1.push(true)
     } else {
       arr1.push(false)
     }
   });

   noticeno=0;

   imgModel.find({dept: req.body.department}, (err, items) => {
     if (err) {
       console.log(err);
     } else {
       noticeno = items.length+1;
       var obj = {
         notno: noticeno,
         name: req.body.name,
         desc: req.body.desc,
         dept: req.body.department,
         date: req.body.dat,
         img: {
                data:arr,
                type:arr1,
                ide:arr2
              }
       }
       //console.log(imgModel)
       imgModel.create(obj, (err, item) => {
         if (err) {
           console.log(err);
         } else {

           res.redirect('/addNotice');
         }
       });
     }
   });
   //console.log(noticeno)

});


app.get("/delete/:ide/:dept", function(req, res) {

 var ar = []

  imgModel.findById(req.params.ide, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      //console.log(result);
      ar = result.img[0].ide.splice(0)
    }
  });

  // console.log(req.params.ide)
  // console.log(req.params.dept)

  imgModel.findByIdAndRemove(req.params.ide, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("successfully deleted!");
      ar.forEach(function(each){
        gfs.remove({ _id: each, root: 'uploads' }, (err, gridStore) => {
          if (err) {
            console.log(err)
            return res.status(404).json({ err: err });
          }
      });
    });
      //Code below is to retrive the images of that department after deleted
      res.redirect("/notice/" + req.params.dept)
    }
  });
});



app.get("/updateuser/:ide", function(req, res) {
  //console.log(req.params.ide)
  User.findById(req.params.ide, function(err, document) {
    if (err) {
      console.log(err);
    } else {
      //
      res.render("updateuserpage", {
        data: document
      })
    }
  });
});



app.post("/updateuser", function(req, res) {
    //console.log(req.body)
    User.findById(
      req.body.ide
    , function(err, foundOne) {
      if (foundOne) {
        bcrypt.compare(req.body.oldpassword, foundOne.password, function(err, result) {
          if (result === true) {
            if (req.body.newpassword===""){
              User.findByIdAndUpdate(req.body.ide, {
                fname: req.body.fname,
                lname: req.body.lname,
                uname: req.body.uname,
                staffid: req.body.sid,
                dept: req.body.dname,
              }, function(err, document) {
                if (err) {
                  console.log(err)
                } else {
                  console.log("successfully updated!");
                  res.redirect('/wishes?valid=' + req.body.ide);
                }
              });
            } else {


              bcrypt.hash(req.body.newpassword, saltRounds, function(err, hash) {

                User.findByIdAndUpdate(req.body.ide, {
                  fname: req.body.fname,
                  lname: req.body.lname,
                  uname: req.body.uname,
                  staffid: req.body.sid,
                  dept: req.body.dname,
                  password: hash
                }, function(err, document) {
                  if (err) {
                    console.log(err)
                  } else {
                    console.log("successfully updated!");
                    res.redirect('/wishes?valid=' + req.body.ide);
                  }
                });

                });



            }
          } else {
            res.status(404).send("<style> body {background-color: #f2dede;} h2 {text-align: center; margin: 22rem}  </style> <h2 style='color:	#c3737b;'>PASSWORD ENTERED IS WORNG CHECK ONCE AGAIN</h2>");
          }
        });
      } else {
        console.log("Not yet registered");
      }
    });

});



app.get("/update/:ide", function(req, res) {
  //console.log(req.params.ide)
  imgModel.findById(req.params.ide, function(err, document) {
    if (err) {
      console.log(err);
    } else {
      //
      res.render("updatepage", {
        data: document
      })
    }
  });
});


///Below code is to show updated notice.
app.post('/update', upload.array('myfile',4), (req, res, next) => {

  var arr = []
  var arr1=[]
  var arr2=[]

  req.files.forEach(function(file){
     arr.push(file.filename)
     arr2.push(file.id)
     if (
       file.contentType === 'image/jpeg' ||
       file.contentType === 'image/png'
     ) {
       arr1.push(true)
     } else {
       arr1.push(false)
     }
   });

   imgModel.findById(req.body.ide, function(err, result) {
     if (err) {
       res.send(err);
     } else {
       //console.log(result);
       ar = result.img[0].ide.splice(0)
     }
   });

  imgModel.findByIdAndUpdate(req.body.ide, {
    name: req.body.name,
    desc: req.body.desc,
    dept: req.body.department,
    date: req.body.dat,
    img: {
           data:arr,
           type:arr1,
           ide:arr2
         }
  }, function(err, document) {
    if (err) {
      console.log(err)
    } else {
      console.log("successfully updated!");

      ar.forEach(function(each){
        gfs.remove({ _id: each, root: 'uploads' }, (err, gridStore) => {
          if (err) {
            console.log(err)
            return res.status(404).json({ err: err });
          }
      });
    });
      //console.log(document)
      res.redirect("/notice/" + req.body.department)
    }
  });


});

app.get("/noticecomm/:ide", function(req, res) {
//  console.log(req.params.ide)
  imgModel.findById(req.params.ide, (err, item) => {
    if (err) {
      console.log(err);
    } else {
      res.render("showspecnotice.ejs", {
        file: item,
        item:globalinfoofuser
      });
    }
  });

});


app.get("/noticecomm", function(req, res) {
  res.render("deparcomm.ejs", {
    files: [],
    item:globalinfoofuser
  });
});

app.post("/noticecomm", function(req, res) {
  //console.log(req.body.dep)
  imgModel.find({
    dept: req.body.dep
  },'ques tofques notno justtime answ', (err, items) => {
    if (err) {
      console.log(err);
    } else {
      //console.log(items)

      imgModel.distinct('justtime', {
        dept: req.body.dep
      }, (err, ite) => {
        if (err) {
          console.log(err);
        } else {
          //console.log(ite)
          res.render("showcomments.ejs",{item:globalinfoofuser,comms:items,times:ite})
        }
      });
    }
  });

});



app.get("/notice", function(req, res) {
  res.render("depar.ejs", {
    files: [],
    item:globalinfoofuser
  })
})


///JUST PRACTICE BELOW SKIPPING DEPARTMENT//////

// app.get("/notice/specdept", function(req, res) {
//   // console.log(tou)
//   //console.log(globalinfoofuser.dept)
//
//   imgModel.find({
//     dept: globalinfoofuser.dept
//   }, (err, items) => {
//     if (err) {
//       console.log(err);
//     } else {
//       //Below code is to retrive unique dates
//       imgModel.distinct('date', {
//         dept: globalinfoofuser.dept
//       }, (err, ite) => {
//         if (err) {
//           console.log(err);
//         } else {
//
//          //console.log(ite)
//           res.render('specificdept.ejs', {
//             files: items,
//             dates: ite,
//             tou:tou,
//             item:globalinfoofuser
//           });
//
//         }
//       });
//
//     }
//   });
// });


////JUST PRACTISE ABOVE///

app.post("/notice/specdept", function(req, res) {
  // console.log(tou)
  // console.log(app.locals)
  imgModel.find({
    dept: req.body.dep
  }, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      //Below code is to retrive unique dates
      imgModel.distinct('date', {
        dept: req.body.dep
      }, (err, ite) => {
        if (err) {
          console.log(err);
        } else {

         //console.log(ite)
          res.render('specificdept.ejs', {
            files: items,
            dates: ite,
            tou:tou,
            item:globalinfoofuser
          });

        }
      });

    }
  });
});

app.get("/wishes", function(req, res) {
  var passedVariable = req.query.valid;
  //console.log(passedVariable)

  User.findById(passedVariable, function(err, item) {

    globalinfoofuser = item;//GLOBAL INFO TO ACCESS USER INFO IN ALL THE ROUTES.
    //console.log(typeofuser)
    if (item != null) {
      res.render("admin.ejs", {
        item: item,
      });
    } else {
      console.log("No such User")
    }
  });


});

///PRACTISE BELOW///

// app.post("/wishes", function(req, res) {
//   // console.log(req.body.wish)
//   if (req.body.wish == "shownotice") {
//     if (tou =="staff"){
//       res.redirect("/notice")
//     } else {
//       res.redirect("/notice/specdept");
//     }
//   } else {
//     res.redirect("/addNotice")
//   }
// });

///PRACTICE ABOVE///

app.post("/wishes", function(req, res) {
  // console.log(req.body.wish)
  if (req.body.wish == "shownotice") {
    res.redirect("/notice")
  } else {
    res.redirect("/addNotice")
  }
});

//Code below to add recieve questions posted.
app.post("/specdept/addQues", function(req, res) {
  console.log(req.body.idofnot)


  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var d = new Date();
  var day = days[d.getDay()];
  var hr = d.getHours();
  var min = d.getMinutes();
  if (min < 10) {
    min = "0" + min;
  }
 var ampm = "am";
if( hr > 12 ) {
    hr -= 12;
    ampm = "pm";
  }
  var date = d.getDate();
  var month = months[d.getMonth()];
  var year = d.getFullYear();


  timee =  day + " " + hr + ":" + min + ampm + " " + date + " " + month + " " + year;
  // console.log(timee)
  imgModel.findByIdAndUpdate(req.body.idofnot, {
      "$push": {
        "ques": req.body.desc,
        "tofques": timee,
        "justtime":(new Date()).getTime(),
        "uofques":currentuseremailid
      }
    },
    function(err, docs) {
      if (err) {
        console.log(err)
      } else {
        console.log("Updated User : ");
        //Code below is to retrive the images of that department after adding the question.
        res.redirect("/notice/" + req.body.selecteddept)
      }
    });

});

app.get("/notice/:specdept", function(req, res) {
  imgModel.find({
    dept: req.params.specdept
  }, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      imgModel.distinct('date', {
        dept: req.params.specdept
      }, (err, ite) => {
        if (err) {
          console.log(err);
        } else {

          //console.log(items)
          res.render('specificdept.ejs', {
            files: items,
            dates: ite,
            tou:tou,
            item:globalinfoofuser
          });

        }
      });
    }
  });
})

//Code below to add recieve answers posted.


app.post("/specdept/addAnsfromcomm", function(req, res) {
  console.log(req.body.idofnot)

  imgModel.findByIdAndUpdate(req.body.idofnot, {
      "$push": {
        "answ": req.body.desc
      }
    }, {
      "new": true,
      "upsert": true
    },
    function(err, docs) {
      if (err) {
        console.log(err)
      } else {
        console.log("Updated User : ");
        //Code below is to retrive the images of that department after adding the answer.
        res.redirect("/noticecomm/"+ req.body.idofnot);
      }
    });

});



app.post("/specdept/addAns", function(req, res) {
  console.log(req.body.idofnot)

  imgModel.findByIdAndUpdate(req.body.idofnot, {
      "$push": {
        "answ": req.body.desc
      }
    }, {
      "new": true,
      "upsert": true
    },
    function(err, docs) {
      if (err) {
        console.log(err)
      } else {
        console.log("Updated User : ");
        //Code below is to retrive the images of that department after adding the answer.
        res.redirect("/notice/" + req.body.selecteddept)
      }
    });

});


//To display gridfs images and files..

app.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // File exists
    const readstream = gfs.createReadStream(file.filename);
    return readstream.pipe(res);
  });
});



app.post('/files', (req, res) => {
  // console.log(req.body)
  // console.log(req.body.idoffile);
  // console.log(req.body.ind)

  var arr = []//contains data
  var arr1=[]//contains type
  var arr2=[]//contains id



// To split the incoming string to array.
arr= req.body.dataarr.split(",");

var removed = arr.splice(req.body.ind,1);

// To split the incoming string to array and covert to boolean.

arr1= req.body.typearr.split(",");

removed = arr1.splice(req.body.ind,1);


var temp=[]
arr1.forEach(function(a){
  if (a=='false'){
    temp.push(false)
  }
  else{
    temp.push(true)
  }
});

arr1=temp.splice(0)

// To split the incoming string to array and covert to ObjectId.

arr2= req.body.idearr.split(",");

removed = arr2.splice(req.body.ind,1);

var temp=[]
arr2.forEach(function(a){
  temp.push(mongoose.Types.ObjectId(a))
});

arr2 = temp.splice(0)

//Below code is to assign the factored arrays to the database.


imgModel.findByIdAndUpdate(req.body.idoffile, { img : {data: arr , type: arr1 , ide: arr2}},
                          function (err, docs) {
  if (err){
      //console.log("olu")
      console.log(err)
  }
  else{
      console.log("Successfully updated");
  }
});


  gfs.remove({ _id: req.body.idea, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      console.log(arr)
      return res.status(404).json({ err: err });
    }

    res.redirect("/notice/" + req.body.dept)
  });
});

app.get('/imageonbig/:filename', (req, res) => {
  //console.log("iamhere")
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// @route GET /image/:filename
// @desc Display Image
app.get('/image/:filename', (req, res) => {
  //console.log("iamhere")
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});



//Calling the server
app.listen(3000, function() {
  console.log("Server is running in port 3000")
})
