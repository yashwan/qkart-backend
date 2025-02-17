const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { authService, userService, tokenService } = require("../services");
const ApiError = require("../utils/ApiError");

/**
 * Perform the following steps:
 * -  Call the userService to create a new user
 * -  Generate auth tokens for the user
 * -  Send back
 * --- "201 Created" status code
 * --- response in the given format
 *
 * Example response:
 *
 * {
 *  "user": {
 *      "_id": "5f71b31888ba6b128ba16205",
 *      "name": "crio-user",
 *      "email": "crio-user@gmail.com",
 *      "password": "$2a$08$bzJ999eS9JLJFLj/oB4he.0UdXxcwf0WS5lbgxFKgFYtA5vV9I3vC",
 *      "createdAt": "2020-09-28T09:55:36.358Z",
 *      "updatedAt": "2020-09-28T09:55:36.358Z",
 *      "__v": 0
 *  },
 *  "tokens": {
 *      "access": {
 *          "token": "eyJhbGciOiJIUz....",
 *          "expires": "2020-10-22T09:29:01.745Z"
 *      }
 *  }
 *}
 *
 */
const register = catchAsync(async (req, res) => {
  try {
    if(!req.body.email || !req.body.password || !req.body.name){
      throw new ApiError(httpStatus.BAD_REQUEST, "Please Enter Email and Password and username")
    }
    const response = await userService.createUser(req.body);
    const {access} = await tokenService.generateAuthTokens(response);
    const resp = {
      user:response,
      tokens:{access}
    }
    res.setHeader('Authorization', `Bearer ${resp.tokens.access.token}`);
    res.status(httpStatus.CREATED).send(resp)
  } catch (error) {
    if(error.statusCode === 200){
      res.send(httpStatus.OK)
    }
    if(error.statusCode === 400){
      res.status(httpStatus.BAD_REQUEST).send({
        code:error.statusCode,
        message: error.message
      })
    }
    if(error.statusCode === 409){
      res.status(httpStatus.CONFLICT).send({
        code:error.statusCode,
        message: error.message
      })
    }
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      code:error.statusCode,
      message: error.message
    })
  }
});

/**
 * Perform the following steps:
 * -  Call the authservice to verify is password and email is valid
 * -  Generate auth tokens
 * -  Send back
 * --- "200 OK" status code
 * --- response in the given format
 *
 * Example response:
 *
 * {
 *  "user": {
 *      "_id": "5f71b31888ba6b128ba16205",
 *      "name": "crio-user",
 *      "email": "crio-user@gmail.com",
 *      "password": "$2a$08$bzJ999eS9JLJFLj/oB4he.0UdXxcwf0WS5lbgxFKgFYtA5vV9I3vC",
 *      "createdAt": "2020-09-28T09:55:36.358Z",
 *      "updatedAt": "2020-09-28T09:55:36.358Z",
 *      "__v": 0
 *  },
 *  "tokens": {
 *      "access": {
 *          "token": "eyJhbGciOiJIUz....",
 *          "expires": "2020-10-22T09:29:01.745Z"
 *      }
 *  }
 *}
 *
 */
const login = catchAsync(async (req, res) => {
try {
  const {email, password} = req.body;
  if(!email || !password){
    throw new ApiError(httpStatus.BAD_REQUEST, (!email && "Please Enter Email") || (!password && "Please Enter Password"))
  }
  const response = await authService.loginUserWithEmailAndPassword(email, password);
  const {access} = await tokenService.generateAuthTokens(response);
  const resp = {
    user:response,
    tokens:{
      access
    }
  }
  res.setHeader('Authorization', `Bearer ${resp.tokens.access.token}`);
  res.status(httpStatus.OK).send(resp)
} catch (error) {
  if(error.statusCode === 400){
    res.status(httpStatus.BAD_REQUEST).send({code: httpStatus.BAD_REQUEST, message: error.message})
  }
  if(error.statusCode === 401){
    res.status(httpStatus.UNAUTHORIZED).send({code: httpStatus.UNAUTHORIZED, message: error.message})
  }
  res.status(httpStatus.INTERNAL_SERVER_ERROR).send({code: httpStatus.INTERNAL_SERVER_ERROR, message: error.message})
  
}
});

module.exports = {
  register,
  login,
};
