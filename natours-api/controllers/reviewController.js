// const catchAsync = require('../utils/catchAsync')
const Review = require('../models/Review')

const factory = require('./handlerFactory')



//SUPER IMPORTANT - FOR REFACTORING!!!
//EXTRACT FUNCTION:(M.W) - Decoule the logic that is not relevant for creating a review 
//and prevent refactoring to createOne !
//ALLOW NESTED ROUTES
//FIRST CHECK IF THE tour id and user id passed manually by the client in the request body(GOOD FOR DEVELOPMENT)
//IF NOT TAKE USER ID FROM THE CURRENTLY LOGGED IN USER AND TOUR ID FROM THE URL(IDEAL SOLUTION! REAL WORLD - THIS IS HOW IT WORKS!)
exports.setTourUserIds = (req,res,next) =>{

    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id

    next();

}

//THE ABOVE M.W - MAKE IT POSSIBLE TO USE factory.createOne!
exports.createReview = factory.createOne(Review)

exports.deleteReview = factory.deleteOne(Review)
exports.updateReview  = factory.updateOne(Review)
exports.getReview = factory.getOne(Review);

//APPLY ALL THE API FEATURES - LIKE THE TOURS! :) - CHECK THE HACK OF EXTRACTING THE FILTER LOGIC FROM HERE TO THE FACTORY!!
exports.getAllReviews = factory.getAll(Review)


//APPLY API FEATURES - ON THE REVIEWS :) 
//BEFORE REFACTORING TO THE createOne Factory
// exports.createReview= catchAsync(async (req,res,next) =>{

    
//     //REFACTOR TO THE setTourUserIds - above - m.w - to be able the createOne Factory
//     // if(!req.body.tour) req.body.tour = req.params.tourId;
//     // if(!req.body.user) req.body.user = req.user.id

//     const review = await Review.create(req.body)

//     console.log(review); 

//     res.status(201).json({
//         status:'success', 
//         data:{
//             review
//         }
//     })

// })


//GREAT! BEFORE APPLYING THE getAll Factory !
// exports.getAllReviews = catchAsync(async (req,res,next)=>{

//     let filter = {}
//     //CHECK IF THERE IS tourId on the nested route(MUST ENABLE Express Merge params before -on the review router)
//     if(req.params.tourId)  filter.tour = req.params.tourId;
    
   
//     const reviews =  await Review.find(filter)
//     console.log(reviews);


//     res.status(200).json({
//         status:'success',
//         results: reviews.length, 
//         data:{
//             reviews
//         }
//     })
// })


