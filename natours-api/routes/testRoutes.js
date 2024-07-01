const testController = require('../controllers/testController')

const express = require('express')

const testRouter = express.Router(); 


testRouter.route('/cookies').get(testController.getCookies )



module.exports = testRouter;