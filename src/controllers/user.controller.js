const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");

// TODO: CRIO_TASK_MODULE_CART - Update function to process url with query params
/**
 * Get user details
 *  - Use service layer to get User data
 * 
 *  - If query param, "q" equals "address", return only the address field of the user
 *  - Else,
 *  - Return the whole user object fetched from Mongo

 *  - If data exists for the provided "userId", return 200 status code and the object
 *  - If data doesn't exist, throw an error using `ApiError` class
 *    - Status code should be "404 NOT FOUND"
 *    - Error message, "User not found"
 *  - If the user whose token is provided and user whose data to be fetched don't match, throw `ApiError`
 *    - Status code should be "403 FORBIDDEN"
 *    - Error message, "User not found"
 *
 * 
 * Request url - <workspace-ip>:8082/v1/users/6010008e6c3477697e8eaba3
 * Response - 
 * {
 *     "walletMoney": 500,
 *     "address": "ADDRESS_NOT_SET",
 *     "_id": "6010008e6c3477697e8eaba3",
 *     "name": "crio-users",
 *     "email": "crio-user@gmail.com",
 *     "password": "criouser123",
 *     "createdAt": "2021-01-26T11:44:14.544Z",
 *     "updatedAt": "2021-01-26T11:44:14.544Z",
 *     "__v": 0
 * }
 * 
 * Request url - <workspace-ip>:8082/v1/users/6010008e6c3477697e8eaba3?q=address
 * Response - 
 * {
 *   "address": "ADDRESS_NOT_SET"
 * }
 * 
 *
 * Example response status codes:
 * HTTP 200 - If request successfully completes
 * HTTP 403 - If request data doesn't match that of authenticated user
 * HTTP 404 - If user entity not found in DB
 * 
 * @returns {User | {address: String}}
 *
 */



const getUserByEmail = async (req, res) => {
  try {
    const {email} = req.params;
    const userResponse = await userService.getUserByEmail(email);
    res.send(userResponse);
  } catch (error) {
    res.sendStatus(404).json({message: "User not found"})
  }
}

const createUser = async (req, res) => {
  try {
    const response = await userService.createUser(req.body);
    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error occured", true, "")
  }
}

const getUser = catchAsync(async (req, res) => {
  try {
    const userId = req.params.userId;
    const queryParam = req.query && req.query.q
    const oid = req.user._id.toString();
    res.setHeader("Authorization", `${req.headers.authorization}`);
    
    if (oid !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, "Not Allowed");
    }
    if(queryParam){
      const {address} = await userService.getUserAddressById(userId, queryParam)
      return res.send({address})
    }
    userResponse = await userService.getUserById(userId);
    res.send(userResponse);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).send({ message: "User not found" });
    }
    if (error.statusCode === 403) {
      return res.status(httpStatus.FORBIDDEN).send({
        code: httpStatus.FORBIDDEN,
        message: error.message
      });
    }
    if (error.statusCode === 400) {
      return res.status(httpStatus.BAD_REQUEST).send({
        code: httpStatus.BAD_REQUEST,
        message: error.message
      });
    }
    
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      code: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message
    });
  }
});


const setAddress = catchAsync(async (req, res) => {
  if(req.body.address && req.body.address.length < 20){
    throw new ApiError(httpStatus.BAD_REQUEST, "User address is Short, Must be 20 character Long")
  }
  // console.log(req.body.address)
  const user = await userService.getUserById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.email != req.user.email) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "User not authorized to access this resource"
    );
  }

  const address = await userService.setAddress(user, req.body.address);
  if(!address){
    throw new ApiError(httpStatus.BAD_REQUEST, "User Not Found")
  }
  res.send({
    address: address,
  });
});

module.exports = {
  getUser,
  setAddress,
  getUserByEmail,
  createUser
};
