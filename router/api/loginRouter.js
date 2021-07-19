const router = require('express').Router();
let { check } = require('express-validator');
let loginController = require("../../controllers/loginController");

/**
 * @typedef Login
 * @property {string} username.required - username - eg: Tulika03
 * @property {string} password.required - password - eg: Lattice@123
 */

/**
 * @route post /login
 * @group Authorization
 * @param {Login.model} login.body.required
 * @returns {object} 200 - Logged in successfully
 * @returns {Error} 400 - Invalid Credentials
 * @returns {Error} 422 - Invalid or missing parameter
 * @returns {Error} 500 - Unable to process
 * @returns {Error} 504 - Database connection error
 */

router.post('/login', [check('username').notEmpty(), check('password').notEmpty().isLength({ min: 10, max: 50 })], loginController.userLogin);


module.exports = router;