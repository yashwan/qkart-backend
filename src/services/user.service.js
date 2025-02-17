const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserById(id)
/**
 * Get User by id
 * - Fetch user object from Mongo using the "_id" field and return user object
 * @param {String} id
 * @returns {Promise<User>}
 */

const getUserAddressById = async (userId, queryPa) => {
    const responseByAddressAndId = await User.findOne({_id:userId}, {address:1, email: 1})
    return responseByAddressAndId
}
const getUserById = async (userId) => {
        const userResponse = await User.findOne({_id: userId})
        if(!userResponse){
            throw new ApiError(httpStatus.NOT_FOUND, "User Not Found")
        }
        return userResponse;
}

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserByEmail(email)

/**
 * Get user by email
 * - Fetch user object from Mongo using the "email" field and return user object
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
    // try {
        const response = await User.findOne({email:email})
        // if(!response){
        //     throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect Email")
        // }
        // const isPasswordMatch = await response.isPasswordMatch(password);
        // if(!isPasswordMatch){
        //     throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect Password")
        // }
        return response
    // } catch (error) {
    //     throw new ApiError(httpStatus.FORBIDDEN, error.message)
    // }
}
// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement createUser(user)

/**
 * Create a user
 *  - check if the user with the email already exists using `User.isEmailTaken()` method
 *  - If so throw an error using the `ApiError` class. Pass two arguments to the constructor,
 *    1. “200 OK status code using `http-status` library
 *    2. An error message, “Email already taken”
 *  - Otherwise, create and return a new User object
 *
 * @param {Object} userBody
 * @returns {Promise<User>}
 * @throws {ApiError}
 *
 * userBody example:
 * {
 *  "name": "crio-users",
 *  "email": "crio-user@gmail.com",
 *  "password": "usersPasswordHashed"
 * }
 *
 * 200 status code on duplicate email - https://stackoverflow.com/a/53144807
 */
const createUser = async (userBody) => {
    try {
        const isEmailTaken = await User.isEmailTaken(userBody.email)
        if (isEmailTaken){
            throw new ApiError(httpStatus.OK, "Email Already Taken")
        }
        const resp = await User.create(userBody);
        resp.walletMoney = 500;
        const {_id, name, email, walletMoney} = resp
        return {
            _id,
            name,
            email,
            walletMoney
        };
    } catch (error) {
        if(error.statusCode){
            if(error.statusCode === 409){
                throw new ApiError(httpStatus.CONFLICT, error.message)
                }
                if(error.statusCode === 400){
                    throw new ApiError(httpStatus.BAD_REQUEST, error.message)
                }
                if(error.statusCode === 200){
                    throw new ApiError(httpStatus.OK, error.message)
                }
        }else{
            error.newErrors = {
                email: null,
                password: null
            }
            if(error.message.toLowerCase().search("password:") > -1 && error.message.toLowerCase().search("email") > -1){
                throw new ApiError(httpStatus.BAD_REQUEST, "Please Enter Valid Email and Password")
            }
            else if(error.message.toLowerCase().search("password:") > -1){
                // error.newErrors.password = error.errors.password.message
            throw new ApiError(httpStatus.BAD_REQUEST, error.errors.password.message)

            }
            else if(error.message.toLowerCase().search("email") > -1){
                // error.newErrors.email = error.errors.email.message
            throw new ApiError(httpStatus.BAD_REQUEST, error.errors.email.message)

            }
            // throw new ApiError(httpStatus.BAD_REQUEST, error.newErrors.email || email.newErrors.password)
        }
    }

}

const getUserByEmailAndPassword = async (email, password) => {
        const response = await User.findOne({email:email});
        if(!response){
            throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect Email")
        }
        const isPasswordMatch = await response.isPasswordMatch(password);
        if(!isPasswordMatch){
            throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect Password")
        }
        return response
}

const setAddress = async (user, address) => {
    const res = await User.findOneAndUpdate({_id: user._id}, {address}, {new: true})
    return res && res.address
}
module.exports = {
    getUserById,
    getUserByEmail,
    createUser,
    getUserByEmailAndPassword,
    getUserAddressById,
    setAddress
}

// /**
//  * Get subset of user's data by id
//  * - Should fetch from Mongo only the email and address fields for the user apart from the id
//  *
//  * @param {ObjectId} id
//  * @returns {Promise<User>}
//  */
// const getUserAddressById = async (id) => {
// };

// /**
//  * Set user's shipping address
//  * @param {String} email
//  * @returns {String}
//  */
// const setAddress = async (user, newAddress) => {
//   user.address = newAddress;
//   await user.save();

//   return user.address;
// };

