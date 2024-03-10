
const getUserByEmail = function(email, database) {
  // to iterate over each user's id in the users database
  for (const userId in usersDatabase) {
    //get the user object available in the user's database
    const user = usersDatabase[userId];
    //check if the provided email matches an email in the database
    if (user.email === email) {
      //if email is already registered, return user object
      return user;
    }
  }
  //if email does not match any users in the database, return null
  return null;
};


module.exports = {getUserByEmail};