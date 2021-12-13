// Program that allows users to shorten long URLs

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { response } = require("express");
const { getUserByEmail, urlsForUser,getUserEmail, generateRandomString } = require('./helpers.js');


const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
    name: 'session',
    keys: ["user_id"]
}));

//users database
const users = {
    "user1RandomID": {
        id: "userRandomID",
        email: "user1@example.com",
        password: "user1"
    }
}
// url Database
const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aaaaaa"
    }
};

///GET urls homepage
app.get("/urls", (req, res) => {
    const user_id = req.session.user_id;
    const userEmailId = getUserEmail(user_id, users);
    let urlUser = urlsForUser(urlDatabase,user_id);

    const templateVars = {
        user_id: user_id,
        urls: urlUser,
        useremail: userEmailId
    };

    //user only displaying urls for own

    res.render("urls_index", templateVars);

});

//creating a database of shortURLs and longURLs 
app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    const userID = req.session.user_id;

    urlDatabase[shortURL] = {
        longURL: longURL,
        userID: userID
    };
    res.redirect(`/urls`);
    //res.redirect(`/urls/${shortURL}`);
});

//create new url
app.get("/urls/new", (req, res) => {
    const userID = req.session.user_id;

    //check if user logged in
    if (!userID) {
        return res.redirect('/login');
    }
    const userEmailId = getUserEmail(userID, users);
    const templateVars = {
        user_id: userID,
        useremail: userEmailId
    };
    res.render("urls_new", templateVars);

});


//displays shortURL for a given longURL
app.get("/urls/:shortURL", (req, res) => {
    const userID = req.session.user_id;
    const userEmailId = getUserEmail(userID, users);
    let urlUser = urlsForUser(urlDatabase,userID);

    if (!userEmailId) {
        return res.status(401).send(`You must <a href='/login'>login</a> first`);
    }
    if (!urlUser) {
        return res.send(" No URLs for you");
    }
    const templateVars = {
        user_id: userID,
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        useremail: userEmailId
    };
    res.render("urls_show", templateVars);
});

//redirect user to longURL when shorURL clicked
app.get("/u/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[req.params.shortURL].longURL;

    //check if shortURL exists in database
    if (!urlDatabase[shortURL]) {
        return res.status(404).send(`We can't find the shortURL`);
    }
    res.redirect(`http://${longURL}`);

});

//delete shortURLs
app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.params.shortURL;
    const userID = req.session.user_id;
    const userEmailId = getUserEmail(userID, users);
    let urlUser = urlsForUser(urlDatabase,userID);

    if (!userID) {
        return res.status(401).send(`You must <a href='/login'>login</a> first`);
    }
    if (!urlUser) {
        return res.send(" Error: You can not delete");
    }
    delete urlDatabase[shortURL];
    res.redirect('/urls');
});

//Edit longURL for a given shortURL
app.post("/urls/:shortURL", (req, res) => {
    const longURL = req.body.longURL;
    const shortURL = req.params.shortURL;
    const userID = req.session.user_id;
    let urlUser = urlsForUser(urlDatabase,userID);

    //error if user not logged in
    if (!userID) {
        return res.send("Login First");
    }
    //error if url not belongs to user
    if (!urlUser) {
        return res.send(" Error: You can not edit");
    }
    urlDatabase[shortURL] = { longURL, userID };
    res.redirect('/urls');
});

// login form

app.get("/login", (req, res) => {
    const userID = req.session.user_id;

    if (!users[userID]) {
        const templateVars = {
            useremail: null   //pass useremail as null to headers 
        }
        res.render("loginform", templateVars);
    }
    else {
        res.redirect('/urls');
    }
});

//login 
app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).send('email and password cannot be blank');
    }

    const user = getUserByEmail(email, users);

    if (!user) {
        return res.status(400).send('no user with that email found')
    }

    // found the user, check if passwords match?
    bcrypt.compare(password, user.password, (err, success) => {
        if (!success) {
            return res.status(400).send('password does not match')
        }

        // telling the browswer to set this cookie
        req.session.user_id = user.id;
        res.redirect('/urls');
    })
});


// logout
app.post("/logout", (req, res) => {
    //delete cookies
    req.session = null;
    res.redirect('/urls');
});

//display registration form
app.get("/register", (req, res) => {
    const userID = req.session.user_id;
    const templateVars = {
        useremail: null //pass useremail as null to partial/_headers 
    }
    if (users[userID]) {
        return res.redirect('/urls');
    }
    res.render("user_register", templateVars);

});

// add new user in users database

app.post("/register", (req, res) => {
    const id = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    const hashed = bcrypt.hashSync(password, 10);

    if (!email || !password) {
        return res.status(400).send('email and password cannot be blank');
    }
    const user = getUserByEmail(email, users);
    if (user) {
        return res.status(400).send({ error: '400 Email already exists' });
    }
    const newUser = { id, email, password: hashed };
    users[id] = newUser;

    req.session.user_id = id;
    res.redirect('/urls');
});

//GET if user logged in redirect /urls or not redirect /login
app.get('/', (req, res) => {
    const id = req.session.user_id;
    if (!id) {
        return res.redirect('/login');
    }
    res.redirect('/urls');
});


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

