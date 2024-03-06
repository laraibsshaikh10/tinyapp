const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

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
//middleware to pass username to all views
//Pass in the username to all views that include the _header.ejs partial and modify the _header.ejs partial to display the passed-in username next to the form.
app.use((req, res, next) => {
  //checks if request contains a cookie called username
  //if cookie exists, it assigns username cookie to res.locals.username otherwise assigns it a null value
  res.locals.username = req.cookies.username || null;
  //next is a callback function to call on the next middleware function
  next();
})


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
  const templateVars = { 
    urls: urlDatabase, 
    username: users[req.cookies.username] || null 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.username] || null
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { 
    id, 
    longURL,
    users: users[req.cookies.username] || null 
  };
  res.render("urls_show", templateVars);
  
});

// Redirect any request to "/u/:id" to its longURL
app.get("/u/:id", (req, res) => {
  // const longURL = ...
  res.redirect(longURL);
});

//Create a GET /register endpoint, which returns the template you just created.
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.username] || null
  };
  res.render("register", templateVars);
})

// Update GET /login endpoint and pass the entire user object to the template
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.username] || null
  };
  res.render("login", templateVars);
})

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

//Add a POST route that removes a URL resource: POST /urls/:id/delete
app.post("/urls/:id/delete", (req, res) => {
  //to get shortened url id from route parameter
  const id = req.params.id;
  //to see if url is already present in the database
  if (urlDatabase[id]) {
    //delete that url from the database
    delete urlDatabase[id];
    //redirect to the urls index page
    res.redirect("/urls");
  } else {
    //if url is not in the database, send a 400 error
    res.status(400).send("URL does not exist");
  }
});

//Add a POST route that updates a URL resource; POST /urls/:id and have it update the value of your stored long URL based on the new value in req.body. Finally, redirect the client back to /urls.
app.post("/urls/:id", (req, res) => {
  //to get shortened url id from route parameter
  const shortURL = req.params.id;
  //to get updated long url from request body
  const updatedURL = req.body.updatedURL;
  //to see if url is already present in the database
  if (urlDatabase[shortURL]) {
    //updated stored long url
    urlDatabase[shortURL] = updatedURL;
    //redirect the client to the urls index page
    res.redirect("/urls");
  } else {
    //if shortened url is not in the database, send a 400 error
    res.status(400).send("URL does not exist");
  }
});


//Add an endpoint to handle a POST to /login in your Express server.
app.post("/login", (req, res) => {
  const username = req.body.username;

  //set username cookie with a value submitted in the request body
  res.cookie("username", username);

  //redirect the client back to urls index page
  res.redirect("/urls");
})

//logout: Implement the /logout endpoint so that it clears the username cookie and redirects the user back to the /urls page.
app.post("/logout", (req, res) => {
  //clear username cookie
  res.clearCookie("username");
  //redirect the client back to urls index page
  res.redirect("/urls");
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
  for (const userId in users) {
    if (users[userId].email === email) {
      return res.status(400).send("The user account already exists.");
    
    }
  }
  //to generate a six-character unique id for our new user
  const userId = generateRandomString();


  //create an object for new user
  const newUser = {
    id: userId,
    email, 
    password
  }

  //to store new user information into the users object
  users[userId] = newUser;

  //upon succesful registration, redirect user to login page
  res.redirect("/login");
}) 