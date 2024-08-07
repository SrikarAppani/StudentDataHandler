const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const uri = "mongodb://127.0.0.1:27017/MyDB";

app.use(express.urlencoded({ extended: false }));

mongoose
  .connect(uri)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const studentSchema = new mongoose.Schema({
  name: String,
  rollnum: String,
  course: String,
  dob: Date,
  address: String,
  enrollmentDate: Date,
});
const Students = new mongoose.model("Students", studentSchema);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.post("/submit", async (req, res) => {
  const r = await Students.findOne({rollnum:req.body.rollnumber.toUpperCase()});
  if(!r)
  {
    try {
      const newStudent = new Students({
        name: req.body.name,
        rollnum: req.body.rollnumber.toUpperCase(),
        course: req.body.courseselect,
        dob: req.body.birthdate,
        address: req.body.addressspace,
        enrollmentDate: req.body.enrollmentdate
      });
      
      await newStudent.save();
      
      res.sendFile(path.join(__dirname, "public", "RegistrationSuccess.html"));
    } catch (error) {
      console.error(error);
      res.send("Internal Server Error");
    }
  }
  else
  {
    // alert("Roll Number already exists!");
    console.log("Roll Number already exists!");
    res.sendFile(path.join(__dirname, "public", "register.html"));
  }
});

app.get("/select", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "details.html"));
});

app.get("/details", async (req, res) => {
  const rollNumber = req.query.rollnumber.toUpperCase();
  try {
    const student = await Students.findOne({ rollnum: rollNumber });
    if (!student) {
      return res.status(404).send("Student not found");
    }
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/update", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "update.html"));
});

app.post("/updatedetails", async (req, res) => {
  const rollNumber = req.body.defaultrollnum;
  const namechecked = req.body.CheckboxName;
  const coursechecked = req.body.CheckboxCourse;
  const DOBchecked = req.body.CheckboxDOB;
  const addresschecked = req.body.CheckboxAddress;

  
  try {
    const result = await Students.findOneAndDelete({ rollnum: rollNumber });
    let newName = result.name;
    let newCourse = result.course;
    let newdob = result.dob;
    let newaddress = result.address;
    if(namechecked=="changed")
      newName = req.body.updatedName;
    if(coursechecked=="changed")
      newCourse = req.body.updatedCourseSelect;
    if(DOBchecked=="changed")
      newdob = req.body.updatedDOB;
    if(addresschecked=="changed")
      newaddress = req.body.updatedAddress;
    try {
      const newStudent = new Students({
        name: newName,
        rollnum: result.rollnum,
        course: newCourse,
        dob: newdob,
        address: newaddress,
        enrollmentDate: result.enrollmentDate
      });
  
      await newStudent.save();
  
      res.sendFile(path.join(__dirname, "public", "UpdationSuccess.html"));
    } catch (error) {
      console.error(error);
      res.send("Internal Server Error");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/delete", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "delete.html"));
});

app.post("/deletestudent", async (req, res) => {
  const rollNumber = req.body.rollnumber;
  console.log(rollNumber);
  try {
    const result = await Students.findOneAndDelete({ rollnum: rollNumber });
    if (result) {
      res.status(200).sendFile(path.join(__dirname, "public", "DeletionSuccess.html"));
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.listen(3000, () => {
  console.log("Server listening at http://localhost:3000");
});
