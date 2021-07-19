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
    if (!errors.isEmpty()) {
        let valError = errors.array().map(e => e.param + ' ');
        let errordata = valError.toString().slice(0, -1);
        return response.sendInvalidDataError(res, valError);
    }

    let tempConnection;
    try {
        tempConnection = await mysql.connection();
        let userData = await tempConnection.query("select user_id, user_type_id, user_name, user_password, salt, is_active, login_attempt from user_master where user_name = ?;", [req.body.username]);
        await tempConnection.releaseConnection();
        if (userData.length == 0) {
           return response.sendUnauthorizedError(res, 401, "Invalid username or password");
        }
        else if (bcrypt.hashSync(req.body.password, userData[0].salt) == userData[0].user_password) {
            let userLogin = {};
            userLogin.user_id = userData[0].user_id;
            userLogin.user_type_id = userData[0].user_type_id;
            let refreshToken = randToken.uid(256);
            refreshTokens[refreshToken] = req.body.username;
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


// create json wen token
function createToken(user) {
    return jwt.sign(user, config.secretKey, { expiresIn: '120000ms' });
}

module.exports = {
    userLogin: userLogin
}