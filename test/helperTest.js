const { assert } = require('chai');

const { getUserByEmail, getUserEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "user1RandomID", 
    email: "user1@example.com", 
    password: "user1"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "user2"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user1@example.com", testUsers)
    const expectedUserID = "user1RandomID";
    // Write your assert statement here
    assert.equal(testUsers[user].id,expectedUserID);
  });
  it('should return undefined if email not in database', function() {
    const user = getUserByEmail("user4@example.com", testUsers)
    const expectedUser = undefined;
    // Write your assert statement here
    assert.equal(testUsers[user],expectedUser);
  });
});

describe('getUserEmail', function() {
    it('should return email of a user based on ID', function() {
      const userEmail = getUserEmail("user1RandomID", testUsers)
      const expectedEmail = "user1@example.com";
      // Write your assert statement here
      assert.equal(userEmail,expectedEmail);
    });
}); 