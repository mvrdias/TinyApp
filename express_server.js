
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

//const password = "purple-monkey-dinosaur"; // you will probably this from req.params
//const hashedPassword = bcrypt.hashSync(password, 10);


const PORT = process.env.PORT || 8080;
const COOKIE_NAME = "userId";
const app = express();

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "mvrdias@uol.com.br",
    password: bcrypt.hashSync("pass", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
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
    const newUser = {id , email, password};
    users[id] = newUser;
    return users[id];

}

function authenticate(email, password) {
  const user = findUserByEmail(email);

  if(!user) { return; }
  //if(user.password !== password) { return; }
  if (!bcrypt.compareSync(password, user.password)) {return;}

  return user;
}

function findUserByEmail(email) {
  for(var userId in users) {
    var user = users[userId];
    if ((user.email === email) || (email ==="")) {
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
app.get("/urls/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  let shortURL = req.params.shortURL;
  let data = {
    longURL: longURL,
    shortURL: shortURL
  };
  console.log(data);
  res.render("urls_show",data);
});

// to handle shortURL requests
app.get("/u/:shortURL", (req, res) => res.redirect(res.locals.longURL));

app.get("/urls.json", (req, res) => res.json(urlDatabase));

app.get("/users.json", (req, res) => res.json(users));

app.get('/register', (req, res) => res.render('register'));


//Register
app.post('/register', (req, res) => {
  //const { email, password } = req.body;
  var email = req.body.email;
  var passprel = req.body.password;
  var password = bcrypt.hashSync(passprel, 10);


  const user = findUserByEmail(email);
  //console.log(user);
  if(user){
    //Email already exists
    //res.send("Email already registered. Try again");
    res.redirect('/urls');

  } else{
    //New User Registration can be done here
    //console.log("we can register");
    let newUser = createUser(email,password);
    res.cookie('userId', newUser.id);
    res.redirect('/urls');
  }

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
  //console.log('id do site', urlDatabase[shortURL].usId);
  res.redirect("/urls");
});

//Update Informations
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL  = req.body.longURL;
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = newURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});