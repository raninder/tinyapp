// Program that allows users to shorten long URLs

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { response } = require("express");
const { getUserByEmail, getUserEmail, generateRandomString } = require('./helpers.js');


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

//create new url
app.get("/urls/new", (req, res) => {
    const userID = req.session.user_id;
    const userEmailId = getUserEmail(userID, users);
    const templateVars = {
        user_id: userID,
        useremail: userEmailId
    };
    //check if user logged in
    if (!userID) {
        return res.redirect('/login');
    }
    res.render("urls_new", templateVars);


});

//creating a database of shortURLs and longURLs 
const urlDatabase = {};
app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    const userID = req.session.user_id;

    // urlDatabase[shortURL] = {
    //     longURL: longURL,
    //     userID: userID
    // };
    if (longURL.includes('https://')) {
        urlDatabase[shortURL] = { longURL, userID };
    } else {
        urlDatabase[shortURL] = { longURL: `https://${longURL}`, userID };
    }
    console.log("urlDatabase", urlDatabase[shortURL]);
    res.redirect('/urls');
    //res.redirect(`/urls/${shortURL}`);
});

//create a new DB, if users DB id matches with url DB id
const urlsForUser = (userID) => {
    const userDB = {};
    for (const key in urlDatabase) {
        if (urlDatabase[key].userID === userID) {
            const longURL = urlDatabase[key].longURL;
            const userID = urlDatabase[key].userID
            userDB[key] = { longURL, userID };
        }
    }
    console.log("userdb", userDB);
    return userDB;
};

//display all short and long urls stored in url database for logged user
app.get("/urls", (req, res) => {
    const user_id = req.session.user_id;
    const userEmailId = getUserEmail(user_id, users);
    let urlUser = urlsForUser(user_id);

    //const templateVars = { users, user_id, urlUser };
    const templateVars = {
        user_id: user_id,
        urls: urlUser,
        useremail: userEmailId
    };

    //user only displaying urls for own

    res.render("urls_index", templateVars);

});


//displays shortURL for a given longURL
app.get("/urls/:shortURL", (req, res) => {
    const userID = req.session.user_id;
    const userEmailId = getUserEmail(userID, users);
    let urlUser = urlsForUser(userID);

    if (userEmailId) {
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
    }
    else {
        res.send("Please Login First");
    }

});

//redirect user to longURL when shorURL clicked
app.get("/u/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[req.params.shortURL].longURL;
    const reg = new RegExp('([a-zA-Z\d]+://)?((\w+:\w+@)?([a-zA-Z\d.-]+\.[A-Za-z]{2,4})(:\d+)?(/.*)?)', 'i')

    //check if url is valid
    if (reg.test(longURL)) {
        res.redirect(`https://${longURL}`);
    }
    else {
        res.send("Error: not valid url");
    }
});

//delete shortURLs
app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.params.shortURL;
    const userID = req.session.user_id;
    const userEmailId = getUserEmail(userID, users);
    let urlUser = urlsForUser(userID);

    if (userID) {
        if (!urlUser) {
            return res.send(" Error: You can not delete");
        }
        delete urlDatabase[shortURL];
        const templateVars = {
            user_id: userID,
            urls: urlDatabase,
            useremail: userEmailId
        };
        res.render("urls_index", templateVars);
    }
    else {
        res.send("Please login first");
    }

});

//Edit longURL for a given shortURL
app.post("/urls/:shortURL", (req, res) => {
    const longURL = req.body.longURL;
    const shortURL = req.params.shortURL;
    const userID = req.session.user_id;
    let urlUser = urlsForUser(userID);

    //error if user not logged in
    if (!userID) {
        return res.send("Login First");
    }
    //error if url not belongs to user
    if (!urlUser) {
        return res.send(" Error: You can not edit");
    }
    if (!longURL.includes('https://')) {
        urlDatabase[shortURL] = { longURL: `https://${longURL}`, userID };
    } else {
        urlDatabase[shortURL] = { longURL, userID };
    }
    res.redirect('/urls');
});

// login form

app.get("/login", (req, res) => {
    const userID = req.session.user_id;
    console.log("login");
    if (!userID) {
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
    if (userID) {
        return res.redirect('/urls');
    }
    res.render("user_register", templateVars);

});

// add new user in users database
app.post("/register", (req, res) => {
    const id = generateRandomString();
    const email = req.body.email;
    const user = getUserByEmail(email, users);
    const password = req.body.password;
    const hashed = bcrypt.hashSync(password, 10);

    if (!email || !password) {
        return res.status(400).send('email and password cannot be blank');
    }
    if (user) {
        return res.status(400).send({ error: '400 Email already exists' });
    }
    const newUser = { id, email, password: hashed };
    users[id] = newUser;
    res.redirect('/urls');
});


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

