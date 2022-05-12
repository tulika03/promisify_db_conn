
sendSuccess = function(res, message, data) {
    res.status(200).json({
        success: 1,
        message: message,
        data: data
    })
}

sendError = function(res, code) {
    if(code === 'ER_BAD_DB_ERROR') {
        res.status(504).json({
            error: 1,
            message: "Unable to connection to the DB."
        })
    }
    else {
        res.status(504).json({
            error: 1,
            message: "Unable to process. Please try again."
        })
    }

}

sendInvalidDataError = function(res, val) {
    res.status(422).json({
        error: 1,
        message: "Missing data " + val
    })
}

sendNotExists = function(res, message) {
    res.status(200).json({
        success: 0,
        message: message
    })
}

sendUnauthorizedError = function(res, message, code) {
    res.status(401).json({
        error: 1,
        message: message,
        code: code
    })
}





module.exports = {sendSuccess, sendError, sendNotExists, sendInvalidDataError, sendUnauthorizedError} ;



