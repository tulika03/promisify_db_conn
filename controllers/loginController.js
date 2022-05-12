let mysql = require("../utils/dbConnection");
let response = require("../utils/responseStatus");
let { validationResult } = require('express-validator');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
let config = require("../config/app-config");
let refresh_secret_key = require('../config/app-config').refresh_secret_key;
let refreshTokens = {};
let client = require("../utils/redis-connect").client;
let blackListToken = require("./blackListToken.json");
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
        await tempConnection.releaseConnection();
        console.log(userData)
        if (userData.length == 0) {
            return response.sendUnauthorizedError(res, 401, "Invalid username or password");
        }
        else if (bcrypt.hashSync(req.body.password, userData[0].salt) == userData[0].password) {
            await client.connect();
            let userLogin = await getToken(userData);
            await client.quit();
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


getNewToken = async function (req, res, next) {
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
        let valError = errors.array().map(e => e.param + ' ');
        let errordata = valError.toString().slice(0, -1);
        return response.sendInvalidDataError(res, valError);
    }

    let tempConnection;
    try {
        let token = req.body.token;
        if (token) {
            // verifies secret and checks exp
            let dataDecoded = jwt.verify(token, refresh_secret_key);
            await client.connect();
            let data = await client.hGet(token, "email")
            console.log("data decoded :   ", dataDecoded.email, data)
            if (data != dataDecoded.email) {
                await client.quit();
                return res.status(401).json({ error: 1, message: 'Failed to authenticate the refresh token.' });

            }
            await client.del(token);
            tempConnection = await mysql.connection();
            let userData = await tempConnection.query("select user_id, user_type_id, email, password, salt from user_master where email = ?;", [dataDecoded.email]);
            await tempConnection.releaseConnection();
            console.log(userData)
            let userLogin = await getToken(userData);
            await client.quit();
            return response.sendSuccess(res, "token generated successfully!", userLogin);
        } else {
            client.quit();
            return res.status(403).send({ success: 0, message: 'No token provided.' });
        }

    }
    catch (e) {
        console.log("=====> ", e);
        if (e.message === "jwt expired")
            return response.sendUnauthorizedError(res, "Token has expired. Please relogin.", "TEXP");
        else if (e.message === "invalid signature", "UNAUTH")
            return response.sendUnauthorizedError(res, "You are unauthorized.", "UNAUTH")
        else if (e.message === "Unexpected token")
            return response.sendUnauthorizedError(res, "Invalid token.", "UNAUTH")
        else
            return response.sendError(res, e.code);
    }
}


revokeToken = async function (req, res, next) {
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
        let valError = errors.array().map(e => e.param + ' ');
        let errordata = valError.toString().slice(0, -1);
        return response.sendInvalidDataError(res, valError);
    }
    try {
        let token = req.body.token
        await client.connect();
        let accessToken = await client.hGet(token, "jwtToken");
        console.log("accessToken is: ", accessToken);
        await client.sAdd("accessToken", accessToken);
        if (accessToken == null) {
            await client.quit();
            return response.sendNotExists(res, "Token does not exist")
        }
        await client.del(token);
        await client.quit();
        return response.sendSuccess(res, "token revoked successfully!", userLogin);

    }
    catch (e) {
        console.log("=====> ", e);
        return response.sendError(res, e.code);
    }
}

// create json wen token
function createToken(user) {
    return jwt.sign(user, config.secretKey, { expiresIn: '120000ms' });
}

function createRefreshToken(userEmail) {
    return jwt.sign(userEmail, config.refresh_secret_key, { expiresIn: '180000ms' });
}

async function getToken(userData) {
    let userLogin = {};
    userLogin.user_id = userData[0].user_id;
    userLogin.user_type_id = userData[0].user_type_id;
    let refreshToken = createRefreshToken({ email: userData[0].email });
    userLogin.refreshToken = refreshToken;
    userLogin.token = createToken({ user_id: userData[0].user_id, user_type_id: userData[0].user_type_id });
    let data = {email: userData[0].email, accessToken: userLogin.token};
    client.hSet(refreshToken, "email", data.email);
    client.hSet(refreshToken, "jwtToken", userLogin.token);
    return userLogin;
}

module.exports = {
    userLogin: userLogin,
    getNewToken: getNewToken,
    revokeToken: revokeToken
}