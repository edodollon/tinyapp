const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

const generateRandomString = () => {
  const randString = Math.random().toString(36).slice(7);
  return randString;
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Databases
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

const checkEmail = (emailCheck) => {
  for (const em in users) {
    if (users[em].email === emailCheck) {
      return false;
    }
  }
  return true;
};

const checkPassword = (passCheck) => {
  for (const em in users) {
    if (users[em].password === passCheck) {
      return false;
    }
  }
  return true;
};

// Registering new email and password
app.get("/register", (req, res) => {
  res.render("user_registration");
});

app.post("/register", (req, res) => {
  const userRandID = generateRandomString();
  
  if (req.body.email === '' || req.body.password === '') {
    res.sendStatus(400);
    res.redirect("/urls");
  }
  
  if (checkEmail(req.body.email) === false) {
    res.sendStatus(400);
    res.redirect("/urls");
  } else {
    users[userRandID] = {
      id: userRandID, 
      email: req.body.email,
      password: req.body.password 
  };
    console.log(users);
    res.cookie("user_id", userRandID);
    res.redirect("/urls");
  };  
});


// Login
app.get("/login", (req, res) => {
  res.render("user_login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  for (const id in users) {
    if (checkEmail(email) === false && checkPassword(password) === false) {
      res.cookie("user_id", users[id].id);
      res.redirect("/urls");
    } else {
      res.sendStatus(403);
      res.redirect("/login");
    }
  }
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></html></body>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    user: req.cookies["user_id"],
    userDB: users,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

// New URLS page
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: req.cookies["user_id"],
    userDB: users,
  };
  
  if (!req.cookies.user_id === true) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
  
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    user: req.cookies["user_id"],
    userDB: users,
    shortURL: req.params['shortURL'],
    longURL: urlDatabase[shortURL]
  };
  res.render("urls_show", templateVars);
});

// Generate new URL and redirect to URL page
app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Delete URL from index page after clicking delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// Edit URL
app.get("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { 
    shortURL: req.params['shortURL'],
    longURL: urlDatabase[shortURL]
  };
  res.redirect(`/urls/${shortURL}`, templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/new", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.newURL;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}!`);
});