let mysql = require("../utils/dbConnection");
let response = require("../utils/responseStatus");
let { validationResult } = require('express-validator');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
let config = require("../config/app-config");
let randToken = require('rand-token');
let refreshTokens = {};

userLogin = async function (req, res, next) {
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
        let valError = errors.array().map(e => e.param + ' ');
        let errordata = valError.toString().slice(0, -1);
        return response.sendInvalidDataError(res, valError);
    }

    let tempConnection;
    try {
        tempConnection = await mysql.connection();
        let userData = await tempConnection.query("select user_id, user_type_id, email, password, salt from user_master where email = ?;", [req.body.username]);
      //  await tempConnection.releaseConnection();
        console.log(userData)
        if (userData.length == 0) {
           return response.sendUnauthorizedError(res, 401, "Invalid username or password");
        }
        else if (bcrypt.hashSync(req.body.password, userData[0].salt) == userData[0].password) {
            let userLogin = {};
            userLogin.user_id = userData[0].user_id;
            userLogin.user_type_id = userData[0].user_type_id;
            let refreshToken = randToken.uid(256);
            refreshTokens[refreshToken] = req.body.username;
            await tempConnection.query("update user_master set refresh_token = ? where email = ?;", [refreshToken, req.body.username]);
            await tempConnection.releaseConnection();
            userLogin.token = createToken({ user_id: userData[0].user_id, user_type_id: userData[0].user_type_id });
            userLogin.refreshToken = refreshToken;
           return response.sendSuccess(res, "Logged in successfully", userLogin)
        }
        else {
           return response.sendUnauthorizedError(res, 401, "Invalid username or password");
        }

    }
    catch (e) {
        console.log(e);
        await tempConnection.releaseConnection();
        return response.sendError(res, e.code);
    }
}


userToken = async function (req, res, next) {
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
        let valError = errors.array().map(e => e.param + ' ');
        let errordata = valError.toString().slice(0, -1);
        return response.sendInvalidDataError(res, valError);
    }

    let tempConnection;
    try {
        tempConnection = await mysql.connection();
        let userData = await tempConnection.query("select user_id, user_type_id, email, refresh_token from user_master where email = ?;", [req.body.username]);
        if((userData[0].refresh_token == req.body.token)) {
            let userLogin = {};
            userLogin.user_id = userData[0].user_id;
            userLogin.user_type_id = userData[0].user_type_id;
            let refreshToken = randToken.uid(256);
            refreshTokens[refreshToken] = req.body.username;
            await tempConnection.query("update user_master set refresh_token = ? where email = ?;", [refreshToken, req.body.username]);
            await tempConnection.releaseConnection();
            userLogin.token = createToken({ user_id: userData[0].user_id, user_type_id: userData[0].user_type_id });
            userLogin.refreshToken = refreshToken;
            return response.sendSuccess(res, "token generated successfully", userLogin)
        }
        

    }
    catch (e) {
        console.log(e);
        await tempConnection.releaseConnection();
        return response.sendError(res, e.code);
    }
}

// create json wen token
function createToken(user) {
    return jwt.sign(user, config.secretKey, { expiresIn: '120000ms' });
}

module.exports = {
    userLogin: userLogin,
    userToken: userToken
}