const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var Rollbar = require('rollbar');

const app = express();
// #hello
const port = process.env.PORT || 3000;

// Initialize Rollbar
var rollbar = new Rollbar({
  accessToken: '6968af1154014807b95ad58608cbe63e',
  environment: 'production', // or 'development', 'staging', etc.
  checkIgnore: function(isUncaught, args, payload) {
    // Check if the error is a 400 error
    if (payload.data && payload.data.body && payload.data.body.message) {
      const messageBody = payload.data.body.message.body;
      if (messageBody.includes('400') || payload.data.body.message.extra.statusCode === 400) {
        return true; // Ignore this error
      }
    }
    return false; // Process other errors normally
  }
});

// Database connection with mongoose (MongoDB)
mongoose.connect("mongodb://localhost:27017", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// To get the CSS file from the public folder
app.use(express.static(__dirname + '/public'));

// Interact with index.ejs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Mongoose schema
let todoSchema = new mongoose.Schema({
  name: String
});

let Todo = mongoose.model("Todo", todoSchema);

// Routes
app.get("/", (req, res) => {
  Todo.find({}, (error, todoList) => {
    if (error) {
      rollbar.error(error); // Log error to Rollbar
      console.log(error);
    } else {
      res.render("index.ejs", { todoList: todoList });
    }
  });
});

// Route for adding a new task
app.post("/newtodo", (req, res) => {
  if (!req.body.task || req.body.task.trim() === '') {
    const errorMsg = "Task name is required";
    rollbar.error(errorMsg, { statusCode: 400 }); // Log error to Rollbar with status code
    res.status(400).send(errorMsg);
    return;
  }

  let newTask = new Todo({
    name: req.body.task
  });

  Todo.create(newTask, (err, Todo) => {
    if (err) {
      rollbar.error(err); // Log error to Rollbar
      res.status(500).send(err);
    } else {
      console.log(`Inserted ${newTask} to the database todo`);
      res.redirect("/");
    }
  });
});

// Route to delete a task by ID
app.get("/delete/:id", (req, res) => {
  let taskId = req.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    const errorMsg = "Invalid task ID";
    rollbar.error(errorMsg, { statusCode: 400 }); // Log error to Rollbar with status code
    res.status(400).send(errorMsg);
    return;
  }

  mongoose.model('Todo').deleteOne({ _id: taskId }, (err, result) => {
    if (err) {
      rollbar.error(err); // Log error to Rollbar
      res.status(500).send(err);
    } else {
      console.log("Task successfully deleted from database");
      res.redirect("/");
    }
  });
});

// Route for deleting all tasks
app.post("/delAlltodo", (req, res) => {
  mongoose.model('Todo').deleteMany({}, (err, result) => {
    if (err) {
      rollbar.error(err); // Log error to Rollbar
      res.status(500).send(err);
    } else {
      console.log(`Deleted all tasks`);
      res.redirect("/");
    }
  });
});

// Catch invalid GET requests
app.get("*", (req, res) => {
  const errorMsg = "Invalid Page";
  rollbar.error(errorMsg, { statusCode: 400 }); // Log error to Rollbar with status code
  res.status(400).send("<h1>Invalid Page</h1>");
});

// Use the Rollbar error handling middleware before other error handlers
app.use(rollbar.errorHandler());

app.use((err, req, res, next) => {
  res.status(500).send('Something broke!');
});

// Listen on port 3000
if (require.main === module) {
  app.listen(port, (error) => {
    if (error) {
      rollbar.error(error); // Log error to Rollbar
      console.log("Issue in connecting to the server");
    } else {
      console.log("Successfully connected to the server");
    }
  });
} else {
  module.exports = app;
}
