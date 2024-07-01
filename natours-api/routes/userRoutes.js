const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const express = require('express')

const router = express.Router();

//AUTHENTICATION END POINTS(NOT REST)
// router.route('/signup').post(authController.signup );
router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)



////////////////////////////////////////
//PASSWORD RESET ENDPOINTS - PUBLIC 
//STEP 1/2(request contains the email - response sends an email with a link that contains the reset token)
router.post('/forgotPassword', authController.forgotPassword)

//STEP 2/2 :request contains the reset token and the new password user wants - 
//PATCH : SINCE I UPDATE ONLY THE PASSWORD FIELD IN THE USER DOCUMENT
//NOTE: THE BELOW URL IS THE URL OF THE LINK SENT TO THE USER EMAIL FORM THE HANDLER of the previous /forgotPassword end point 
// - IT HAS THE EMBEDDED RESET TOKEN(plain text)
router.patch('/resetPassword/:token', authController.resetPassword)


/////////////////////////////////////////
//PROTECTED ROUTES
//REUSE the protect m.w - by registering it to the 'mini-app' router - for all the below protected routes - instead of adding it to each route!
router.use(authController.protect)





router.patch('/updateMyPassword',authController.protect,  authController.updateMyPassword)

router.patch('/updateMe', userController.updateMe)

router.delete('/deleteMe', userController.deleteMe)

///IMPORTANT: MY M.W getMe will "fake" the user id as if it is coming in the URL by the client 
// so the getUser handler will read it from the URL - as if the client set this id !
router.get('/me' , 
    userController.getMe, 
    userController.getUser
)

router.get('/:id', userController.getUser)




/////////////////////////////////////////////
//REST END POINTS FOR USER MANAGEMENT!!!!!
// - ONLY FOR ADMIN ROLE USER- LATER!!!!
//IMPORTANT: I WANT THE ADMING TO BE ABLE DELETING ANY TYPE OF RESOURCE(USER, TOUR ,ETC..)




//ONLY FOR ADMIN 
router.use(authController.restrictTo('admin'))



 router.route('/' )
 .post(userController.createUser)
 .get( userController.getAllUsers)


 router.route('/:id')
    .delete(userController.deleteUser)
    .patch(userController.updateUser
    )
 



module.exports = router;