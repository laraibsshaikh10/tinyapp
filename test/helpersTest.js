const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const chai = require("chai");
const chaiHttp = require("chai-http");

// Assuming your server is running on localhost:3000
const serverUrl = "http://localhost:3000";

chai.use(chaiHttp);
const expect = chai.expect;

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


describe("Login and Access with Session Cookie", () => {
  it("should return status code 403 for unauthorized access", () => {
    // Perform login with POST request
    return chai
      .request(serverUrl)
      .post("/login")
      .send({
        email: "user2@example.com",
        password: "dishwasher-funk",
      })
      .then((loginRes) => {
        // Assert that login was successful
        expect(loginRes).to.have.status(200);
        expect(loginRes).to.have.cookie("session"); // Assuming your session cookie is named 'session'

        // Use the session cookie in subsequent requests
        const agent = chai.request.agent(serverUrl);

        // Make GET request with session cookie
        return agent.get("/urls/b2xVn2").then((getResponse) => {
          // Expecting status code 403 for unauthorized access
          expect(getResponse).to.have.status(403);

          // Close the agent to clean up the session
          agent.close();
        });
      });
  });
});


describe("Login and Access Control Test", () => {
  it('should return 403 status code for unauthorized access to "http://localhost:3000/urls/b2xVn2"', () => {
    const agent = chai.request.agent("http://localhost:3000");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b2xVn2").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });
});