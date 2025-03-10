const httpStatus = require("http-status");
const { Cart, Product, User } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");
const { createAdd } = require("typescript");
const { http } = require("winston");


/**
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");


/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */

const getCartByUser = async (user) => {
  const cart = await Cart.findOne({ email: user.email });
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  }
  return cart;
};

/**
const getCartByUser = async (user) => {
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */

const addProductToCart = async (user, productId, quantity) => {
  let userCart = await Cart.findOne({ email: user.email });
  if (!userCart) {
    try {
      userCart = await Cart.create({
        email: user.email,
        cartItems: []
      });
      await userCart.save();
    } catch (error) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Something went wrong while creating cart")
    }
  }
  if (!userCart.cartItems.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Bad Request")
  }
  const exist = userCart.cartItems.some((item) => item.product._id.equals(productId));
  if (exist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product already in cart. Use the cart sidebar to update or remove product from cart");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
  }
  userCart.cartItems.push({
    product: product,
    quantity: quantity
  });
  userCart.save();
  return await userCart;

};

/**
const addProductToCart = async (user, productId, quantity) => {
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {

  const userCart = await Cart.findOne({ email: user.email });
  if (!userCart) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart. Use POST to create cart and add a product")
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
  }

  const productIndex = userCart.cartItems.findIndex((item) => item.product._id.equals(productId));
  if (productIndex === -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }
  userCart.cartItems[productIndex].quantity = quantity
  userCart.save();
  return await userCart
};

/**
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
// const updateProductInCart = async (user, productId, quantity) => {
// };

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
// const deleteProductFromCart = async (user, productId) => {
//   const userCart = await Cart.findOne({ email: user.email });
//   if (!userCart) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
//   }
//   const productExist = userCart.cartItems.findIndex((item) => item.product._id.equals(productId));
//   if (productExist === -1) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
//   }
//   userCart.cartItems.splice(productExist, 1);
//   userCart.save();
//   return await userCart.populate({ path: 'cartItems.product' }).execPopulate();
// };

const deleteProductFromCart = async (user, productId) => {
  const userCart = await Cart.findOne({ email: user.email });
  if (!userCart) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
  }
  const productExist = userCart.cartItems.findIndex((item) => item.product._id.equals(productId));
  if (productExist === -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }
  userCart.cartItems.splice(productExist, 1);
  userCart.save();
  return await userCart;
};


  
  

// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
const deleteProductFromCart = async (user, productId) => {
};

// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */





const checkout = async (customer) => {
  const userCart = await Cart.findOne({ email: customer.email });
  if(!userCart){
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  }
  if(customer.address === config.default_address){
    throw new ApiError(httpStatus.BAD_REQUEST, "Address not set")
  }
  if(userCart.cartItems.length === 0){
    throw new ApiError(httpStatus.BAD_REQUEST, "User Cart have no Products")
  }
  if(!customer.hasSetNonDefaultAddress()){
    throw new ApiError(httpStatus.BAD_REQUEST, "User Cart have no Products")
  }
  var cost = 0
  for(var item of userCart.cartItems){
    cost += item.quantity * item.product.cost
  }
  customer.walletMoney -= cost
  if(customer.walletMoney < 0){
    throw new ApiError(httpStatus.BAD_REQUEST, "User don't have enough balance")
  }
  userCart.cartItems = []
  userCart.save();
  return userCart
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
