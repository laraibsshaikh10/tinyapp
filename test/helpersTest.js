const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // assert: if returned user exists
    assert.isDefined(user);

    //assert: if user has the expected user id
    assert.equal(user.id, expectedUserID);
  });


  it("should return undefined if email does not exist in the database", () => {
    const user = getUserByEmail("notfound@example.com", testUsers);

    //assert: return undefined
    assert.isUndefined(user);
  });
});