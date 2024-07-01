const Tour = require('./Tour')
const mongoose = require('mongoose')
const AppError = require('../utils/appError')


const reviewSchema = new mongoose.Schema({

    review:{
        type:String, 
        required:[true, 'Review can not be empty']
    },

    //WHY NOT REQUIRED??
    rating:{
        type:Number, 
        //required:[true, 'A review must have a rating'], 
        min:1, 
        max:5
    },

    createdAt:{
        type: Date, 
        // default:Date.now()
        default:Date.now
    },

    //PARENT REFERENCING TO THE 2 PARENTS(tour , user)
    user: {
        type:mongoose.Schema.ObjectId, 
        ref:'User',
        required:[true, 'Review must belong to belong user'], 
    },
    tour:{
        type: mongoose.Schema.ObjectId,
        ref:'Tour', 
        required:[true, 'Review must belong to  a tour'], 
    }
},

//SCHEMA OPTIONS - ADD VIRTUAL PROPERTIES TO RESULT SET WITH JSON AND OBJECT FORMATS
{
    toJSON:true, 
    toObject:true
}
)



//////////////////////////////////////////////////////////
//QUERY - PRE-FIND M.W -TO PREPOPULATE  THE TOUR AND USER
//PREPOPULATE QUERY OF THE USER AND TOUR 
//REMOVE THE POPULATE OF THE TOURS ON THE REVIEW - SINCE POPULATE CHAIN RECURSION PROBLEM
    //NOTE - ITS MORE CORRECT TO HAVE THE REVIEWS AVAILABLE ON THE TOURS THAN HAVING THE TOURS AVAILABLE ON THE REVIEW
    // this.populate({
    //     path:'tour', 
    //     select:'name'
    // }).populate({
    //     path:'user', 
    //     //DONT LEAK THE REVIEWS  SENSITIVE DATA - AS EMAIL! 
    //     select:('name photo')
    // })
reviewSchema.pre(/^find/, function(next){

    //this - current Query - Review.find({}) 
    this.populate({
        path:'user',
        select:('name photo')
    })
    next()
    
})

///////////////////////////////////////////////////////////
//MODEL  STATIC METHOD - SINCE USES THE AGGREGATE PIPE LINE (STATICSI) - AND NEED TO USE this -> Model(Review Constructor Function)
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};
//JONAS - WORKS(FOR UPDATING THE TOUR AVERAGE RATINGS - AFTER CREATING NEW RATING!)
reviewSchema.post('save', function() {
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
});




/////////////////////////////////////////
//INDEXES 
//COMPOUND INDEX - FOR PREVENTING SAME USER TO REVIEW THE SAME TOUR!
//MUST ADD THE OPTION FOR UNIQUE INDEX!
reviewSchema.index({user:1, tour:1}, {unique:true})


//Q.A SOLUTION :GREAT SOLUTION!! (169 prevent duplicate reviews from same user on same tour!) 
// CREATE DOCUMENT PRE-SAVE M.W - FOR WHEN THE COMPOUND UNIQUE INDEX ON (userid, tourid) DOES NOT WORK
//(JONAS UNIQUE COMPOUND INDEX DOES NOT WORK!)
reviewSchema.pre('save',async function(next) {

    console.log(`INSIDE REVIEW MODEL DOCUMENT PRE-SAVE M.W (for preventing a user to create more than one review on same tour)`)
    console.log(this, this.user._id)
    const existingReview = await Review.findOne({
        tour: this.tour, 
        user: this.user._id    
    })
    console.log('FOUND REVIEW: ')
    console.log(existingReview)

    if(existingReview)
        return next(new AppError(`You already reviewed this tour. You can not add another review for the same tour!`))
   
        next();

})




//Q.A SOLUTION - CORRECT - REPLACE THE 2 QUERY M.W OF JONAS (PRE AND POST M.W) 
//BY A SINGLE QUERY POST M.W - AND PASS IT THE docs PARAM - THE DOC INSTANCE 
// AFTER DOC MODIFIED(UPDATED/DELETE) ON DB!
//OK!
//MUST CHECK IF THERE ARE DOCS DOCS AFTER MODIFYING THE DB WITH findOneAndXXX
//OK! IF NO REVIEWS  DOCS IN DB AFTER UPDATE/DELETE
// - THEN WHEN TRY TO UPDATE A NON EXISTING REVIEW - 404 - OK!
reviewSchema.post(/^findOneAnd/, async function (docs) {
  
    if (docs) await docs.constructor.calcAverageRatings(docs.tour);
    

    //BAD 500!!
    //WILL THROW AN ERROR IF NO DOCS ARE IN THE DB AFTER MODIFIED THE DB - 500 - BAD
   // await docs.constructor.calcAverageRatings(docs.tour);
});



//JONAS!! DOE NOT WORK! LECTURE 169 - Calculate Average Rating of a tour after updating/deleting it review Child!
// findByIdAndUpdate
// findByIdAndDelete
// reviewSchema.pre(/^findOneAnd/, async function(next) {
//   this.r = await this.findOne();
//   // console.log(this.r);
//   next();
// });


const Review = mongoose.model('Review', reviewSchema)


module.exports = Review;