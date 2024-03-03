const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


app.use(express.urlencoded({ extended: true }));
function generateRandomString() {
  let randomString = "";
  //to select from a list of characters
  const stringCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  //to ensure the generated string is 6 characters long
  for (let i = 0; i < 6; i++) {
    const randomIndex =  Math.floor(Math.random() * stringCharacters.length);
    randomString += stringCharacters[randomIndex];
    }
    return randomString;
}

// console.log(generateRandomString());



//Set ejs as the view engine.
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars);
  
});

// Redirect any request to "/u/:id" to its longURL
app.get("/u/:id", (req, res) => {
  // const longURL = ...
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  
  //Update your express server so that the id-longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls
  
  //to create a 6 digit id
  const shortURL = generateRandomString();
  //to extract the longURL from the request body
  const longURL = req.body.longURL;

  //to add the id-longURL pair to urlDatabase object
  //set value as longURL
  urlDatabase[shortURL] = longURL;

  //Update your express server so that the id-longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls
  //to redirect the client to the page with details regarding the new URL
  res.redirect(`/urls/${shortURL}`);
});

