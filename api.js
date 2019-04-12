var host = "http://localhost:3000/";
var express = require("express");
var app = express();
var fs = require("fs");
var bodyParser = require("body-parser");

var torExits = fs.readFileSync("tor-exit.txt", "utf-8").split("\n");
torExits = torExits.splice(3, torExits.length - 3);
console.log(torExits);

var data = [
//{ url: "url", id: "id", targetName: "takuto"}  
];

var log = [
//{ id: "id", ip: "ip addr", userAgent: "firefox" }
];

function currentTime() {
  var date = new Date();
  return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

log = JSON.parse(fs.readFileSync("log.json", "utf-8"));
data = JSON.parse(fs.readFileSync("register.json", "utf-8"));

function makeID() {
  var l = 10;
  var c = "abcdefghijklmnopqrstuvwxyz0123456789";
  var cl = c.length;
  var r = "";
  for(var i=0; i<l; i++){
    r += c[Math.floor(Math.random()*cl)];
  }
  return r;
}

app.use(bodyParser.json());

app.get("/:id", function(req, res) {
  var id = req.params.id;
  var ip = req.ip.replace(/[a-f]/g, "").replace(/\:/g, "");
  var url = null;
  data.forEach(function(record) {
    if (record.id == id) {
      if (torExits.includes(ip)) {
        url = record.tor;
      } else {
        url = record.url;
      }
    }
  });
  if (!url) {
    res.json({ message: "not registered" });
    return;
  }
  log.push({
    id: id,
    ip: ip,
    userAgent: req.headers["user-agent"],
    at: currentTime()
  });
  saveLog();
  res.redirect(url);
});

app.post("/register", function(req, res) {
  var url = req.body.url;
  var id = makeID();
  var tor = req.body.tor;
  var targetName = req.body.targetName;
  data.push({
    url: url,
    id: id,
    tor: tor,
    targetName: targetName
  });
  saveRegisteredInfo();
  res.send(host + id);
});

function saveLog() {
  fs.writeFileSync("log.json", JSON.stringify(log));
}

function saveRegisteredInfo() {
  fs.writeFileSync("register.json", JSON.stringify(data));
}

app.listen(3000);
