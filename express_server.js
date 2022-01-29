// Express
const express = require("express");
const app = express();
const PORT = 8080;

// ejs
app.set("view engine", "ejs");

// Body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Cookie-session
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['7f69fa85-caec-4d9c-acd7-eebdccb368d5', 'f13b4d38-41c4-46d3-9ef6-8836d03cd8eb']
}));

// Password Hash
const bcrypt = require('bcryptjs');
const saltRounds = 10;


// Helper Functions
const { urlsForUser, checkEmail, checkPassword, getUserByEmail, generateRandomString } = require("./helpers");


// Databases
const users = {
  aJ48lW: {
    id: 'aJ48lW',
    email: 'temp@email.com',
    password: bcrypt.hashSync("password", saltRounds)
  }
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
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
  
  if (checkEmail(req.body.email, users) === false) {
    res.sendStatus(400);
    res.redirect("/urls");
  } else {
    users[userRandID] = {
      id: userRandID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, saltRounds)
    };
    req.session.user_id = userRandID;
    res.redirect("/urls");
  }
});


// Login
app.get("/login", (req, res) => {
  res.render("user_login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userPass = checkPassword(password, users);

  for (const id in users) {
    if (checkEmail(email, users) === false) {
      if (bcrypt.compareSync(password, userPass)) {
        req.session.user_id = users[id].id;
        res.redirect("/urls");
      } else {
        res.status(403).send("403 Forbidden: Wrong Password");
      }
    } else {
      res.status(403).send("403 Forbidden : Please Register");
    }
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
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

// Index page
app.get("/urls", (req, res) => {
  const templateVars = {
    user: req.session.user_id,
    userDB: users,
    urls: urlsForUser(req.session.user_id, urlDatabase),
  };
  res.render("urls_index", templateVars);
});

// New URLS page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.session.user_id,
    userDB: users,
  };

  if (!req.session.user_id === true) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
  
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    user: req.session.user_id,
    userDB: users,
    shortURL: req.params['shortURL'],
    longURL: urlDatabase[shortURL]
  };
  res.render("urls_show", templateVars);
});

// Generate new URL and redirect to URL page
app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Delete URL from index page after clicking delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("Not permitted");
  }
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
  urlDatabase[shortURL] = {
    longURL: newURL,
    userID: req.session.user_id
  };
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}!`);
});