const express = require('express');

App = express();

// console.log("Folder", _dirname);

App.get("/index.html", function(req, res) {
    res.sendFile(__dirname = "./index.html");
    console.log("a");
});

App.listen(5500);

console.log("Server listening on port 5500")