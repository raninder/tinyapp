// Program that allows users to shorten long URLs

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { response } = require("express");


const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const users = {
    "user1RandomID": {
        id: "userRandomID",
        email: "user1@example.com",
        password: "user1"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "user2"
    },
    "user3RandomID": {
        id: "user3RandomID",
        email: "user3@example.com",
        password: "user3"
    }
}
//get user email for a given 
function getUserEmail(userID, users) {
    for (let key in users) {
        if (users[key].id === userID) {
            return users[key].email;
        }
    }
}
//create new url
app.get("/urls/new", (req, res) => {
    const userID = req.cookies["user_id"];
    const userEmailId = getUserEmail(userID, users);
    const templateVars = {
        user_id: userID,
        useremail: userEmailId
    };
    //check if cookies id match with users database id
    if (userEmailId) {
        res.render("urls_new", templateVars);
    }
    else {
        res.render("loginform", templateVars);
    }
});

//creating a database(object) of shortURLs and longURLs 
const urlDatabase = {};
app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    const userID = req.cookies["user_id"];
    urlDatabase[shortURL] = {
        longURL: longURL,
        userID: userID
    };
    res.redirect(`/urls/${shortURL}`);
});

//create a new DB, if users DB id matches with url DB id
const urlsForUser = (userID) => {
    //similar to the requested urlsForUser function
    const userDB = {};
    for (const key in urlDatabase) {
        if (urlDatabase[key].userID === userID) {
            const longURL = urlDatabase[key].longURL;
            const userID = urlDatabase[key].userID
            userDB[key] = { longURL, userID };
        }
    }
    return userDB;
};

//display all short and long urls stored in url database
app.get("/urls", (req, res) => {
    const userID = req.cookies["user_id"];
    console.log("id",userID);
    const userEmailId = getUserEmail(userID, users);

    let urlUser = urlsForUser(userID);
    //console.log(urlUser);
    const templateVars = {
        user_id: userID,
        urls: urlUser,
        useremail: userEmailId
    };
    console.log("tt",templateVars);
    if (urlUser) {
        
        res.render("urls_index", templateVars);
    }
    else {
        res.render("loginform", templateVars);
    }
});


//displays shortURL for a given longURL
app.get("/urls/:shortURL", (req, res) => {
    const userID = req.cookies["user_id"];
    const userEmailId = getUserEmail(userID, users);
    console.log(req.params.shortURL);
    console.log(urlDatabase);
    if (userEmailId) {
        const templateVars = {
            user_id: userID,
            shortURL: req.params.shortURL,
            longURL: urlDatabase[req.params.shortURL].longURL,
            useremail: userEmailId
        };
        
        res.render("urls_show", templateVars);
    }
});

//redirect user to longURL when shorURL clicked
app.get("/u/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL];
    res.redirect("https://" + longURL);
});

//delete shortURLs
app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.params.shortURL;
    const userID = req.cookies["user_id"];
    const userEmailId = getUserEmail(userID, users);

    if (userID) {
        delete urlDatabase[shortURL];
        const templateVars = {
            user_id: userID,
            urls: urlDatabase,
            useremail: userEmailId
        };
        res.render("urls_index", templateVars);
    }
    else {
        res.redirect("/login");
    }

});

//Edit longURL for a given shortURL
app.post("/urls/:shortURL", (req, res) => {
    const longURL = req.body.longURL;
    console.log("longurl",longURL);
    const shortURL = req.params.shortURL;
    const userID = req.cookies["user_id"];
    console.log(urlDatabase[shortURL],longURL);
    if (userID) {
        urlDatabase[shortURL] = { longURL, userID };
        res.redirect('/urls');
    }
    else {
        res.redirect("/login");
    }
});

function getUserByEmail(email, users) {
    for (let key in users) {
        let user = users[key];
        if (user.email === email) {
            return key;
        }
    }
}

//login 
app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = getUserByEmail(email, users);

    if (user) {
        if (users[user].password !== password) {
            res.send({ error: '403 Password doesnt match' });
        }
        res.cookie('user_id', users[user].id);
        res.redirect('/urls');
    }
})

// logout
app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect('/urls');
});

// display registration form
app.get("/register", (req, res) => {
    //pass useremail as null to partial/_headers 
    const templateVars = {
        useremail: null
    }
    res.render("user_register", templateVars);

});

// add new user in users database
app.post("/register", (req, res) => {
    const id = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    const user = getUserByEmail(email, users);

    if(user) {
        return res.status(400).send({ error: '404 Email already exists' });
    }
    const newUser = { id, email, password };
    users[id] = newUser;
    res.redirect("/urls/");
});

// login form
app.get("/login", (req, res) => {
    const templateVars = {
        useremail: null
    }
    res.render("loginform", templateVars);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

//generate 6 letter random string to use as shortURL
function generateRandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
