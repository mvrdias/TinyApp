
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 8080;
const COOKIE_NAME = "userId";
const app = express();

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "mvrdias@uol.com.br",
    password: "pass"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

var urlDatabase = {
  "b2xVn2": {
    usId: "xxxxxx",
    longURL: "http://www.lighthouselabs.ca"
  },

  "9sm5xK": {
    usId:"yyyyyy",
    longURL: "http://www.google.com"
  }
};

app.locals.error = null;

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function userMiddleware(req, res, next) {
  const userId = req.cookies[COOKIE_NAME];
  const user = getUserById(userId);
  req.user = res.locals.user = user;
  res.locals.loggedIn = !!user;
  next();
});


app.set("view engine", "ejs");


function createUser(email, password) {
  const id = generateRandomString(6);
  const newUser = { email, password, id };
  users = newUser;

  return newUser;
}

function authenticate(email, password) {
  const user = findUserByEmail(email);

  if(!user) { return; }
  if(user.password !== password) { return; }

  return user;
}

function findUserByEmail(email) {
  for(var userId in users) {
    var user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
}

function getUserById(id) {
  return users[id];
}

function generateRandomString(tamanho) {
  var letras = 'ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  var aleatorio = '';
  for (var i = 0; i < tamanho; i++) {
      var rnum = Math.floor(Math.random() * letras.length);
      aleatorio += letras.substring(rnum, rnum + 1);
  }
  return aleatorio;
}

app.param("shortURL", (req, res, next, shortURL) => {
  const longURL = urlDatabase[shortURL];

  res.locals.shortURL = shortURL;
  res.locals.longURL = longURL;

  next();
});


app.get("/", (req, res) => res.redirect("/urls"));

//new route handler for "/urls" and use res.render() to pass the URL data to your template.
app.get("/urls", (req, res) => res.render("urls_index", { urls: urlDatabase }));

// This code should output any request parameters to your terminal.
app.get("/urls/new", (req, res) => res.render("urls_new"));

// urls_show route
app.get("/urls/:shortURL", (req, res) => res.render("urls_show"));

// to handle shortURL requests
app.get("/u/:shortURL", (req, res) => res.redirect(res.locals.longURL));

app.get("/urls.json", (req, res) => res.json(urlDatabase));

app.get("/users.json", (req, res) => res.json(users));

app.get('/register', (req, res) => res.render('register'));


//Register
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const user = createUser(email, password);
  res.cookie(COOKIE_NAME, user.id);
  res.redirect('/');
});

//Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = authenticate(email, password);
  if (!user) {
    res.render('urls_index', { error: 'Email and Password not found', urls: urlDatabase });
  } else {
    res.cookie('userId', user.id);
    res.redirect('/urls');
  }
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.redirect("/urls");
});

//Delete Informations
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// New Informations
app.post("/urls", (req, res) => {
  console.log('Cookies: ', req.cookies)
  const newURL  = req.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = newURL;
  urlDatabase[shortURL].usId = req.cookies.userId;
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