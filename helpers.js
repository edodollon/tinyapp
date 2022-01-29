const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Helper functions
const generateRandomString = () => {
  const randString = Math.random().toString(36).slice(7);
  return randString;
};


const urlsForUser = (idCheck, urlDatabase) => {
  const personalDB = {};

  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === idCheck) {
      personalDB[id] = urlDatabase[id];
    }
  }
  console.log(personalDB);
  return personalDB;
};

const checkEmail = (emailCheck, users) => {
  for (const em in users) {
    if (users[em].email === emailCheck) {
      return false;
    }
  }
  return true;
};

const checkPassword = (passCheck, users) => {
  for (const em in users) {
    if (bcrypt.compareSync(passCheck, users[em].password)) {
      return users[em].password;
    }
  }
  return false;
};

// Mocha testing for compass
const getUserByEmail = (email, db) => {
  for (let key in db) {
    if (db[key].email === email) {
      return db[key];
    }
  }
  return undefined;
};

module.exports = { urlsForUser, checkEmail, checkPassword, getUserByEmail, generateRandomString };