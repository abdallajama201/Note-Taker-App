const uniqid = require('uniqid');
const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

app.listen(PORT, () =>
console.log(`App listening at http://localhost:${PORT} 🚀`)
);