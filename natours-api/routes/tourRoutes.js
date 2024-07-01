const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')
//const reviewController = require('../controllers/reviewController')
const reviewRouter = require('../routes/reviewRoutes')
const express = require('express')

const tourRouter = express.Router(); 


//NESTED ROUTE (LECTURE 158 - WITHOUT EXPRESS MERGE PARAMS! CONFUSING + DUPLICATE CODE)
    //NESTED ROUTES (LECTURE 158 - counter intuitive - logic for calling review controller  here in the tour routeer)
    //WILL BE FIXED NEXT LECTURE 159 - USING EXPRESS MERGE PARAMS!
   // tourRouter.route('/:tourId/reviews')
    // .post(
    //     authController.protect,
    //     authController.restrictTo('user'),
    //     reviewController.createReview
    //     )


///////////////////////////////////////////////////
//NESTED ROUTE - WITH EXPRESS!
////////////////////////////////////
//(express router  is a M.W  - LIKE the app! =>  Can call use on it)
//MOUNT THE /:tourId/reviews on the reviewRouter - "REROUTE INTO THE REVIEW ROUTER"
tourRouter.use('/:tourId/reviews', reviewRouter)






//ALIAS ROUTE - FOR THE USER TO GET POPULAR RESOURCE WITH EASY TO REMEMBER URL AND PREPOPULATED QUERY STRINGS! 
//PUBLIC 
tourRouter.get('/top-5-cheap',tourController.aliasTopTours, tourController.getAllTours)


//////////////////
//STATS ROUTE - AGGREGATION PIPELINE - PUBLIC TO ALL
tourRouter.route('/tour-stats').get(tourController.getTourStats);



/////////////////////////////////////////
//GEOLOCATION ROUTE 
//NOT CLEAN - WITH QUERY PARAMS
//'/tours-within?distance=233&&center=40,45&unit=km'
tourRouter
.route('/tours-within/distance/:distance/center/:latlng/unit/:unit')
.get(tourController.getToursWithin)


//FIND ALL DISTANCE FROM ALL TOURS IN DB - FROM A GIVEN POINT BY THE CLIENT(NOT NEED RADIUS LIKE BEFORE!)
tourRouter
.route('/distances/:latlng/unit/:unit')
.get(tourController.getDistances)



//ENABLE ONLY FOR THE EMPLOYEES(not normal users!)
tourRouter.route('/monthly-plan/:year')
    .get(
        authController.protect, 
        authController.restrictTo('guide' ,'lead-guide', 'admin'),
        tourController.getMonthlyPlan);


///////////////
//API (get is the API features)
tourRouter.route('/')
///PUBLIC ROUTES!!
.get( tourController.getAllTours) 
.post(authController.protect,authController.restrictTo('admin', 'lead-guide') ,tourController.createTour) 

tourRouter.route("/:id")
    .get(tourController.getTour)
    .patch(authController.protect,
        authController.restrictTo('admin', 'lead-guide') ,
        tourController.updateTour)
    
    //restrictTo "m.w" :a wrapper function takes roles args - and returns my m.w (template) that takes the roles (since can not pass to a m.w parameters)
    .delete( 
         authController.protect,
         authController.restrictTo('admin','lead-guide'), 
         tourController.deleteTour)


    
module.exports = tourRouter;