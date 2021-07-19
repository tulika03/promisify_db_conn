let express = require('express');
let router = express.Router();
const participantController = require("../../controllers/participantController");

/**
 * @route get /participant
 * @group Participant
 * @returns {object} 200 - Participants data found.
 * @returns {object} 404 - Participants data not found.
 * @returns {Error} 401 - You are unauthorized to perform this operation.
 * @returns {Error} 500 - Unable to process
 * @returns {Error} 504 - Database connection error
 * @security JWT
 */

 router.get("/participant", participantController.getParticipantById);


  module.exports = router;