//return user data for given email
const getUserByEmail = (email, users) => {
    for (let key in users) {
        let user = users[key];
        if (user.email === email) {
            return user;
        }
    }
}

//create a new DB, if users DB id matches with url DB id
const urlsForUser = (urlDatabase,userID) => {
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

//get user email for a given userid
const getUserEmail = (userID, users) => {
    for (let key in users) {
        if (users[key].id === userID) {
            return users[key].email;
        }
    }
}

//generate 6 letter random string to use as shortURL
const generateRandomString = () => {
    return Math.random().toString(36).slice(2, 8);
    
}
module.exports = { getUserByEmail, urlsForUser,getUserEmail,generateRandomString };