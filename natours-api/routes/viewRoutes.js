const authController = require('../controllers/authController')
const viewsController = require('../controllers/viewsController')

const express = require('express')

const router = express.Router(); 

//PASS THE CURRENT USER - TO ALL RENDERED ROUTES OF THE WEBSITE
//SIMILAR TO PROTECT REGISTER  - But with protect  - I protected only some routes of the API) 
router.use(authController.isLoggedIn)


//////////////////////////////////////////////////////
//RENDERED END POINTS
////////////////////////////////////////////////
///- for rendering HTML - use GET
// - NO NEED TO SPECIFY THE FULL PATH - JUST THE TEMPLATE NAME WITH NO EXTENSION - EXPRESS WILL GO TO THE views folder!
router.get('/', viewsController.getOverview)

//URL - BASED ON THE URL IN THE OVERVIEW PAGE ON THE BUTTON LINK!
router.get('/tour/:slug',authController.protect, viewsController.getTour)


router.get('/login', viewsController.getLogin)

module.exports = router;