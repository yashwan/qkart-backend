const httpStatus = require("http-status");
const userService = require("./user.service");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");

/**
 * Login with username and password
 * - Utilize userService method to fetch user object corresponding to the email provided
 * - Use the User schema's "isPasswordMatch" method to check if input password matches the one user registered with (i.e, hash stored in MongoDB)
 * - If user doesn't exist or incorrect password,
 * throw an ApiError with "401 Unauthorized" status code and message, "Incorrect email or password"
 * - Else, return the user object
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  try{
    const userResp = await userService.getUserByEmail(email);
    if(!userResp){
      throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect Email")
    }
    const isPasswordMatch = await userResp.isPasswordMatch(password);
    if(!isPasswordMatch){
        throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect Password")
    }
    return userResp
  }catch(error){
    throw new ApiError(error.statusCode, error.message)
  }
};
// const loginUserWithEmailAndPassword = async (email, password) => {
//   try {
//     const user = await userService.getUserByEmail(email);
//     if (!user) {
//       throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
//     }

//     const isPasswordMatch = await user.isPasswordMatch(password);
//     if (!isPasswordMatch) {
//       throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
//     }

//     return user;
//   } catch (error) {
//     console.error(error);
//     throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
//   }
// };


module.exports = {
  loginUserWithEmailAndPassword,
};
