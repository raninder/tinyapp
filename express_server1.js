const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });