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
    const templateVars = {username: req.cookies["username"]};
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
    const templateVars = { username: req.cookies["username"], urls: urlDatabase };
    res.render("urls_index", templateVars);
});

//renders shortURL for a given url
app.get("/urls/:shortURL", (req, res) => {

    console.log("edit:",req.body);
    const templateVars = { username: req.cookies["username"],shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
    const templateVars = { username: req.cookies["username"],urls: urlDatabase };
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

app.post("/login", (req,res) => {
    const cookie = req.body.username;
    res.cookie('username', cookie);
    
    if(cookie) {
        res.redirect('/urls');
        //res.send(req.cookies);
    }
})

app.post("/logout", (req,res) => {
    res.clearCookie("username");
    res.redirect('/urls');
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
