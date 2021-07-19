let mysql = require("../utils/dbConnection");
let response = require("../utils/responseStatus");

getParticipantById = async function (req, res) {
    let tempConnection;
    try {
        tempConnection = await mysql.connection();
        let participantData = await tempConnection.query("Select * from participant_master where participant_id = ?;", [80]);
        console.log("participantData: ", participantData);
        await tempConnection.query("COMMIT");
        await tempConnection.releaseConnection();
        response.sendSuccess(res, "Data fetched successfully", participantData);
    }
    catch (e) {
        console.log(e);
        await tempConnection.query('ROLLBACK');
        await tempConnection.releaseConnection();
        response.sendError(res, e.code);
    }
}


module.exports = {
    getParticipantById
};
