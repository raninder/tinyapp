// Program that allows users to shorten long URLs

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//render form to user for entering url
app.get("/urls/new", (req, res) => {
    const uid = req.cookies["user_id"];

    for (let k in users) {
        let key = users[k];
        if (key.id === uid) {
            //userData = {id:key.id, email:key.email, password:key.password};
            userEmailId = key.email;
        }
    }
    const templateVars = {
        user_id: req.cookies["user_id"],
        useremail: userEmailId
    };
    console.log(templateVars);
    res.render("urls_new", templateVars);
});

//creating a database(object) of shortURLs and longURLs
const urlDatabase = {};
app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.status(200).redirect("/urls/" + shortURL);
});



//renders all short and long urls stored in url database
app.get("/urls", (req, res) => {
    const uid = req.cookies["user_id"];
    console.log(uid);
    //let userData= {};
    for (let k in users) {
        let key = users[k];
        if (key.id === uid) {
            //userData = {id:key.id, email:key.email, password:key.password};
            userEmailId = key.email;
        }
    }
    const templateVars = {
        user_id: req.cookies["user_id"],
        urls: urlDatabase,
        useremail: userEmailId
    };
    res.render("urls_index", templateVars);
});

//renders shortURL for a given url
app.get("/urls/:shortURL", (req, res) => {
    const uid = req.cookies["user_id"];
    console.log(uid);
    //let userData= {};
    for (let k in users) {
        let key = users[k];
        if (key.id === uid) {
            //userData = {id:key.id, email:key.email, password:key.password};
            userEmailId = key.email;
        }
    }
    //console.log("edit:", req.body);
    const templateVars = { 
        user_id: req.cookies["user_id"], 
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL],
        useremail: userEmailId
     };
    res.render("urls_show", templateVars);

});

//redirect user to lorngURL when shorURL clicked
app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.status(300).redirect("https://" + longURL);
});

//delete shortURLs
app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    const templateVars = {
        user_id: req.cookies["user_id"],
        urls: urlDatabase,
        useremail: userEmailId
    };
    res.render("urls_index", templateVars);
});

//update url
app.post("/urls/:shortURL", (req, res) => {
    //const id = req.params.id;
    const newURL = req.body.newURL;
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL] = newURL;
    res.redirect('/urls');
    //console.log(req.body);
});

app.post("/login", (req, res) => {
    //const cookie = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    //res.cookie('username', cookie);
    res.cookie('user_id', id);

    if (password && email) {
        for (let k in users) {
            let key = users[k];
            if (key.email !== email) {
                //userData = {id:key.id, email:key.email, password:key.password};
                res.send({ error: '403 Email doesnt exists' });
            }
            else {
                if (key.password === password) {
                    res.cookie('user_id', key.id);
                    res.redirect('/urls');
                }
                else {
                    res.send({ error: '403 Password doesnt match' });
                }
            }
        }
    }

})


app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect('/urls');
});


const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
    }
}
app.get("/register", (req, res) => {

    const templateVars = {
        useremail: null
    }
    res.render("register", templateVars);

});
app.post("/register", (req, res) => {

    const id = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;

    if (password && email) {
        for (let k in users) {
            let key = users[k];
            if (key.email === email) {
                //userData = {id:key.id, email:key.email, password:key.password};
                res.status(400).send({ error: '404 Email already exists' });
                
            }
        }
        const newUser = { id, email, password };
        users.user3RandomId = newUser;
    }
    else {
        res.send({ error: '404 Not found' });
        //res.status(400).redirect("/register");
    }
    //console.log(users);
    res.cookie('user_id', id);
    res.status(200).redirect("/urls/");

});

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
