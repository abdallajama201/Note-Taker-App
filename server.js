const uniqid = require('uniqid');
const express = require('express');
const path = require('path');
const fs = require("fs");
const util = require("util")

// Helper function to read files
const readFromFile = util.promisify(fs.readFile);

// Simplified fs writeFile function
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
);

// simplified fs appendFile function
const readAndAppend = (content, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Route to /notes
app.get('/notes.html', (req, res) =>
res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// API for getting notes
// reads from db and sends back a json response
app.get("/api/notes", (req, res) => {
  readFromFile('./db/db.json').then((data) => {
    res.json(JSON.parse(data))
  });
});

// API to add notes
// pulls out the title and text of the request
// creates an object the request elements 
// and a unique id and appends it to the db file
app.post("/api/notes", (req, res) => {
  const {title, text} = req.body;
  if(req.body) {
    const newNote = {
      id: uniqid(),
      title,
      text,
    };
    readAndAppend(newNote, "./db/db.json");
    res.json("note added");
  } else {
    res.error("could not add note")
  }
});

// API to delete notes
// Reads the db.json filters out note based on id
// Rewrites the file without that entry
app.delete("/api/notes/:id", (req, res) => {
  readFromFile('./db/db.json')
    .then((data) => JSON.parse(data))
    .then((json) => {
      const result = json.filter((note) => note.id !== req.params.id);
      writeToFile('./db/db.json', result);
      res.json(`Item ${req.params.title} has been deleted 🗑️`);
    });
})

// Route to index
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// Sets router to listen on PORT
app.listen(PORT, () =>
console.log(`App listening at http://localhost:${PORT} 🚀`)
);