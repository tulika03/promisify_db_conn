const router = require('express').Router();
console.log("yaha aaya")
router.use('', require('./loginRouter'));
router.use('', require("../../utils/auth"), require('./participantRouter'));

module.exports = router;