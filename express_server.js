const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
//When registering a user, instead of saving the password directly, we can use bcrypt.hashSync and save the resulting hash of the password like this:
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);


//Create a global object called users which will be used to store and access the users in the app. 
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

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
//using it as middleware
app.use(cookieParser());
//middleware to pass user_id to all views
//Pass in the user_id to all views that include the _header.ejs partial and modify the _header.ejs partial to display the passed-in user_id next to the form.
app.use((req, res, next) => {
  //checks if request contains a cookie called user_id
  //if cookie exists, it assigns user_id cookie to res.locals.user_id otherwise assigns it a null value
  res.locals.user_id = req.cookies.user_id || null;
  //next is a callback function to call on the next middleware function
  next();
});

//Set ejs as the view engine.
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  }
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

function setTemplateVars(user_id = null) {
  if (user_id) {
    return {user: users[user_id]};
  } else {
  return {user: null};
  }
}

app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  //if user is not logged in, render error message
  if(!userId || !users[userId]) {
    res.status(401).send("<h1> Please log in to shorten URLs</h1>");
  } else {
  //if user is logged in, render URLs page
    const templateVars = { 
      urls: urlDatabase, 
      //use the spread operator (...) to merge the templateVars object with the object returned by the setTemplateVars function
      ...setTemplateVars(req.cookies.user_id)
    };
    res.render("urls_index", templateVars);
  }
});

//Modify your app so that only registered and logged in users can create new tiny URLs.
function authentication(req, res, next) {
  const userId = req.cookies.user_id;
  //to check if a user is authenticated
  if (userId && users[userId]) {
    //if logged in, move to the next middleware or route handler
    next();
  } else {
    //user not authenticated, redirect to login
    res.redirect("/login");
  }
}

//apply autheticationRequired middleware to GET the route: /urls/new
app.get("/urls/new", authentication, (req, res) => {
  const templateVars = {
  //use the spread operator (...) to merge the templateVars object with the object returned by the setTemplateVars function
  ...setTemplateVars(req.cookies.user_id)  
  };
  res.render("urls_new", templateVars);
});

//redirect GET /urls/new to GET /login
app.get("/urls/new", (req, res) => {
  //redirect to login if user is not autheticated
  res.redirect("/login");
});

//Create a function named urlsForUser(id) which returns the URLs where the userID is equal to the id of the currently logged-in user.
function urlForUser(id) {
  const userURL = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURL[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURL;
}


app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  const id = req.params.id;

  //check if user is not logged in, return error with status code 401
  if (!userId || !users[userId]) {
    return res.status(401).send("Please log in to view the shortened URL.");
  }
  //to check if url is present in the database
  const url = urlDatabase[id];
  //if url not found, return error 404, not found
  if (!url) {
    return res.status(404).send("The requested url not found.");
  }

  //to check if url belongs to a logged in user
  if(url.userID !== userId) {
    return res.status(403).send("Please log in to view the requested URL.");
  }

  //render page with URL details
  const templateVars = { 
    id, 
    longURL,
    //use the spread operator (...) to merge the templateVars object with the object returned by the setTemplateVars function
    ...setTemplateVars(req.cookies.user_id)
  };
  res.render("urls_show", templateVars);
  
});

// Redirect any request to "/u/:id" to its longURL
//Since these short URLs are meant to be shared with anyone, make sure that anyone can still visit the short URLs and get properly redirected, whether they are logged in or not. Unlike the previous examples in this exercise, /u/:id should not be protected based on logged in status.
app.get("/u/:id", (req, res) => {
  //retrieve shortURL id from request paramenters
  const shortURL = req.params.id;
  //check if shortURL is present in the urlDatabase
  if (!urlDatabase[shortURL]) {
     //if shortURL does not exist in urlDatabase, send a 404 message
     res.status(404).send("The short URL provided is not found.") //Status code: 404 not found
  }
  //use shortURL id to retrieve corresponding longURL from urlDatabase
  const longURL = urlDatabase[shortURL].longURL;
  //to check if corresponding longURL exists
  res.redirect(longURL);
});

//Create a GET /register endpoint
app.get("/register", (req, res) => {
  //  //To check if the user is already logged in
  if (req.cookies.user_id && users[req.cookies.user_id]) {
    //If the user is logged in, GET /login should redirect to GET /urls
    res.redirect("/urls");
  } else {
    //if user is not logged in, render the login page
    res.render("register", {user: null});
  }
});

// Update GET /login endpoint 
app.get("/login", (req, res) => {
  //To check if the user is already logged in
  if (req.cookies.user_id && users[req.cookies.user_id]) {
    //If the user is logged in, GET /login should redirect to GET /urls
    res.redirect("/urls");
  } else {
    //if user is not logged in, render the login page
    res.render("login", {user: null});
  }
});

app.post("/urls", (req, res) => {

  //If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs. Double check that in this case the URL is not added to the database.
  const userId = req.cookies.user_id; //to check if user is logged in
  //not logged in, respond with HTML message
  if(!userId || !users[userId]) {
    return res.status(403).send("<h1> Please log in to shorten a URL </h1>");
  }
  
  //Update your express server so that the id-longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls
  
  //to create a 6 digit id
  const shortURL = generateRandomString();
  //to extract the longURL from the request body
  const longURL = req.body.longURL;

  //to add the id-longURL pair to urlDatabase object
  //set value as longURL
  urlDatabase[shortURL] = {
    longURL, 
    userID: userId
  };

  //Update your express server so that the id-longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls
  //to redirect the client to the page with details regarding the new URL
  res.redirect(`/urls/${shortURL}`);
});

//Add a POST route that removes a URL resource: POST /urls/:id/delete
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.cookies.user_id;
  //to get shortened url id from route parameter
  const id = req.params.id;
  //to see if url is not logged in
  if (!userId || !users[userId]) {
    return res.status(401).send("Please log in to delete a URL.");
  //check if id provided exists in urlDatabase
  } else if (!urlDatabase[id]) {
    return res.status(404).send("The requested URL is not found in the database.");
    //to check if a user is logged in and have the permission
  } else if (urlDatabase[id].userID !== userId) {
    return res.status(403).send("Please log in to delete a URL.");
  } else {
    //delete that url from the database
    delete urlDatabase[id];
    //redirect to urls index page
    res.redirect("/urls");
  }
});

//Add a POST route that updates a URL resource; POST /urls/:id and have it update the value of your stored long URL based on the new value in req.body. Finally, redirect the client back to /urls.
app.post("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  //to get shortened url id from route parameter
  const shortURL = req.params.id;
  //to get updated long url from request body
  const updatedURL = req.body.longURL;
  //to check if a user is logged in or not
  if (!userId || !users[userId]) {
    return res.status(401).send("Please log in to make changes to URLs.");
    //check if id exists in the urlDatabase
  } else if (!urlDatabase[shortURL]) {
    return res.status(404).send("The requested URL not found.");
    //authentication error
  } else if (urlDatabase[shortURL].userID !== userId) {
    return res.status(403).send("Please acquire permission to update this URL");
  } else {
    //to see if url is already present in the database
    //updated stored long url
    urlDatabase[shortURL].longURL = updatedURL;
    //redirect the client to the urls index page
    res.redirect("/urls");
  }
});

//Add an endpoint to handle a POST to /login in your Express server.
app.post("/login", (req, res) => {
  //to extract email and password from request body
  const {email, password} = req.body;

  //use email to find users
  // Update the POST /login endpoint to look up the email address (submitted via the login form) in the user object.
  const user = Object.values(users).find(user => user.email === email);

  //If a user with that e-mail cannot be found, return a response with a 403 status code.
  //If a user with that e-mail address is located, compare the password given in the form with the existing user's password. If it does not match, return a response with a 403 status code.
  if (!user || user.password !== password) {
    return res.status(403).send("Invalid email or password.");
  } 
  

  //If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
  res.cookie("user_id", user.id);

  //redirect the client back to urls index page
  res.redirect("/urls");
})

//logout: Implement the /logout endpoint so that it clears the user_id cookie and redirects the user back to the /urls page.
app.post("/logout", (req, res) => {
  //clear user_id cookie
  res.clearCookie("user_id");
  //redirect the client back to the login page
  res.redirect("/login");
})

//Create a POST /register endpoint.
app.post("/register", (req, res) => {
  //to extract email and password from request body
  const {email, password} = req.body;

  //for invalid email/password and to make sure email has proper format
  const emailFormatRegex = /^\S+@\S+\.\S+$/;
  //.test(email) is a method call on regex object and is used to test if a string matches the regex pattern
  if (!email || !password || !emailFormatRegex.test(email)) {
    return res.status(400).send("Invalid email or password.");
  } 
  
  //to see if email is already registered
  if (Object.values(users).find(user => user.email === email)) {
      return res.status(400).send("The user account already exists.");
  }

  //use bcrypt to hash the password
  const hashedPassword = bcrypt.hashSync(password, 10); 
  
  //to generate a six-character unique id for our new user
  const userId = generateRandomString();


  //create an object for new user
  const newUser = {
    id: userId,
    password: hashedPassword,
    email 
  };

  //to store new user information into the users object
  users[userId] = newUser;

  //If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
  res.cookie("user_id", userId);

  //upon succesful registration, redirect user to login page
  res.redirect("/login");
}); 



// Test
// Compare a plain text password with the hashed password
const isPasswordCorrect1 = bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword); // returns true
const isPasswordCorrect2 = bcrypt.compareSync("pink-donkey-minotaur", hashedPassword); // returns false

console.log(isPasswordCorrect1); // Output: true
console.log(isPasswordCorrect2); // Output: false
