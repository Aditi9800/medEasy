const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const { dirname } = require("path");
const mongoose = require("mongoose");
const md5 = require("md5");
const ejs = require("ejs");
const e = require("express");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static('images'));
app.set('view engine', 'ejs')

//framework of mongodb
mongoose.connect("mongodb+srv://admin:test1234@cluster0.uvertd2.mongodb.net/medicineDB", { useNewUrlParser: true });

const foodSchema = new mongoose.Schema({
  name: String,
  manufacturingdate: String,
  address: String,
  expirydate: String,
  city: String,
  symptoms: String,
  phoneNo: Number,
  noOfPlates: Number
});
const donarSchema = new mongoose.Schema({
  name: String,
  username: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    unique: true
  },
  phoneNo: Number,
  password: String,
  gender: String,
  donations: [foodSchema],
});
const volunteerSchema = new mongoose.Schema({
  name: String,
  idNumber: String,
  email: String,
  phoneNo: Number,
  password: String,
});
const feedbackSchema = new mongoose.Schema({
  name: String,
  val: Number,
  email: String,
  exp: String,
  date: String
});

const Donar = mongoose.model("Donar", donarSchema);
const Volunteer = mongoose.model("Volunteer", volunteerSchema);
const Feedback = mongoose.model("Feedback", feedbackSchema);


app.get("/", function(req, res) {
  //res.sendFile(__dirname+"/index.html");
  Feedback.find({}, (err, feeds) => {
    if (feeds) {
      res.render("index", { feeds: feeds });
    }
    else {
      res.json(feeds)
      // console.log(feeds[0].username);
      // res.render("index", { name:feeds});
    }
  });
})
app.get("/about", function(req, res) {
  res.sendFile(__dirname + "/about.html");
})
app.get("/contact", function(req, res) {
  res.sendFile(__dirname + "/contact.html")
})
app.get("/RegisterLoginDonar", function(req, res) {
  res.render("p1", { warning: '' });
})
app.post("/RegisterLoginDonar", function(req, res) {
  if (req.body.button === "Register") {
    const email = req.body.emailId;
    Donar.findOne({ email: email }, function(err, foundUser) {
      // console.log(foundUser);
      if (err) {
        res.render("p1", { warning: "User already registered" })
      }
      else {
        const donar = new Donar({
          name: req.body.name,
          username: req.body.username,
          email: req.body.email,
          phoneNo: req.body.phoneNo,
          password: md5(req.body.password),
          gender: req.body.gender
        });
        Donar.create(donar, function(err) {
          if (err) {
            console.log(err);
            res.render("p1", { warning: "User already registered" })
          }
          else {
            const username = req.body.username
            const url = "/finaldonate/" + username
            res.redirect(url);
          }
        });

      }
    })
  }
  else if (req.body.button === "LogIn") {
    const email = req.body.emailId;
    const password = md5(req.body.password);
    Donar.findOne({ email: email }, function(err, foundUser) {
      if (foundUser) {
        if (foundUser.password === password) {
          const username = foundUser.username
          const url = "/finaldonate/" + username
          res.redirect(url);
        }
        else {
          res.render("p1", { warning: "Wrong Password" });
        }
      }
      else {
        res.render("p1", { warning: "User not found" });
      }
    })

  }
  else if (req.body.button == "Forgot Password?") {
    res.render("resetPassDonar", { warning: "" });
  }
  else if (req.body.button === "Reset") {
    const email = req.body.emailId;
    const password = md5(req.body.password);
    Donar.findOneAndUpdate({ email: email }, { password: password }, function(err, foundUser) {
      if (!foundUser) {
        res.render("resetPassDonar", { warning: "Email not found." })
      }
      else {
        res.render("p1", { warning: "Password changed succesfully!! Login again." });
      }
    })
  }
  else {
    res.render("p1", { warning: "" });
  }
})

app.get("/RegisterLoginVolunteer", function(req, res) {
  res.render("volunteerLogin", { warning: "" });
})
app.post("/RegisterLoginVolunteer", function(req, res) {
  if (req.body.button === "Register") {
    const idNumber = req.body.idNumber;
    Volunteer.findOne({ idNumber: idNumber }, function(err, foundUser) {
      if (foundUser) {
        res.render("volunteerLogin", { warning: "User already exists. Login with that email id." });
      }
      else {
        const volunteer = new Volunteer({
          name: req.body.name,
          idNumber: req.body.idNumber,
          email: req.body.email,
          phoneNo: req.body.phoneNo,
          password: md5(req.body.password)
        });
        Volunteer.create(volunteer, function(err) {
          if (err) {
            console.log(err);
          }
        });
        res.redirect("/donations");
      }
    })
  }
  else if (req.body.button === "LogIn") {
    const idNumber = req.body.idNumber;
    const password = md5(req.body.password);
    Volunteer.findOne({ idNumber: idNumber }, function(err, foundUser) {
      if (foundUser) {
        if (foundUser.password === password) {
          res.redirect("/donations")
        }
        else {
          res.render("volunteerLogin", { warning: "Wrong password. Login with correct password." });
        }
      }
      else {
        res.render("volunteerLogin", { warning: "User does exists. Register if new user." });
      }
    })

  }
  else if (req.body.button === "Forgot Password?") {
    res.render("resetPassVol", { warning: "" })
  }
  else if (req.body.button === "Reset") {
    const idNumber = req.body.idNumber;
    const password = md5(req.body.password);
    Volunteer.findOneAndUpdate({ idNumber: idNumber }, { password: password }, function(err, foundUser) {
      if (!foundUser) {
        res.render("resetPassVol", { warning: "Id number not found" })
      }
      else {
        res.render("volunteerLogin", { warning: "Password changed successfully." });
      }
    })
  }
  else {
    res.render("volunteerLogin", { warning: "" });
  }
})



app.get("/finaldonate/:username", function(req, res) {
  res.sendFile(__dirname + "/finaldonate.html")
})
app.post("/finaldonate/:username", function(req, res) {
  const username = req.params.username
  const url = "/foodDetails/" + username
  res.redirect(url);
})
app.get("/donations", function(req, res) {
  res.render("volunteer", { name: [] })
})



app.post("/donations", function(req, res) {
  if (req.body.button === "Submit") {
    const City = req.body.city
    const todayDate = req.body.todayDate
    const foodName = req.body.name
    Donar.find({}, (err, itms) => {
      if (err) {
        console.log(err);
      }
      else {
        let cards = []
        for (let i = 0; i < itms.length; i++) {
          const donation = itms[i].donations
          const username = itms[i].name
          const phoneNo = itms[i].phoneNo
          for (let j = 0; j < donation.length; j++) {
            console.log(donation[j].expirydate)
            if (donation[j].city == City && donation[j].name == foodName &&  todayDate <= donation[j].expirydate && todayDate>=donation[j].manufacturingdate) {
              cards.push({
                name: username,
                address: donation[j].address,
                expirydate: donation[j].expirydate,
                food: donation[j].name,
                phoneNo: phoneNo
              });
            }
          }
        }
        res.render("volunteer", { name: cards });
      }
    })

  }

})




app.get("/foodDetails/:username", function(req, res) {
  res.sendFile(__dirname + "/foodDetails.html");
})
app.post("/foodDetails/:username", function(req, res) {
  const food = {
    name: req.body.name,
    manufacturingdate: req.body.manufacturingdate,
    address: req.body.address,
    expirydate: req.body.expirydate,
    city: req.body.city,
    symptoms: req.body.symptoms,
    phoneNo: req.body.phoneNo,
    noOfPlates: req.body.NumberOfPlates

  }
  Donar.findOneAndUpdate(
    { username: req.params.username },
    { $push: { donations: food } },
    function(err, success) {
      if (err) {
        console.log(err);
      }
    });
  const username = req.params.username
  const url = "/finaldonate/" + username
  res.redirect(url);

})

app.post("/contact", function(req, res) {
  const feedback = new Feedback({
    name: req.body.name,
    email: req.body.email,
    exp: req.body.exp,
    val: req.body.val,
    date: new Date()
  });
  console.log(feedback.date);
  Feedback.create(feedback, function(err) {
    if (err) {
      console.log(err);
    }
  });
  res.redirect("/contact");
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8080;
}

app.listen(port, function() {
  console.log("server is started successfully");
});
