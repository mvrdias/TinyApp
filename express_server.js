
/*

hello world.

*/
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

const PORT = process.env.PORT || 8080;
const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

// Step by Step - Duration
// app.use((req, res, next) => {
//   const ts = new Date().getTime();
//   next();
//   const after = ts - new Date().getTime();
//   console.log('Request took %s ms', after)
// })

app.set("view engine", "ejs");


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

//new route handler for "/urls" and use res.render()
//to pass the URL data to your template.
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// urls_show route
app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL  = urlDatabase[shortURL];
  let templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
});


// This code should output any request parameters to your terminal.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


// to handle shortURL requests
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // let longURL = ... "/u/:shortURL" that redirects to its longURL ???
  res.redirect(longURL);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

//Login
app.post("/login", (req, res) => {
  const user = req.body.username;
  res.cookie (user);
  res.redirect("/urls");
});

//Logout
app.post("/logout", (req, res) => {
  // cookie ?
  res.redirect("/urls");
});

//Delete Informations
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


//Update Informations
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL  = req.body.longURL;
  urlDatabase[shortURL] = newURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString() {
  var letras = 'ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  var aleatorio = '';
  for (var i = 0; i < tamanho; i++) {
      var rnum = Math.floor(Math.random() * letras.length);
      aleatorio += letras.substring(rnum, rnum + 1);
  }
  return aleatorio;
}