//For fetching the corresponding guides 
const User = require('./User')

const mongoose = require('mongoose')
const slugify = require('slugify')



const tourSchema = new mongoose.Schema({
    name:{
        type:String, 
        required:[true, 'A tour must have a name'], 
        unique:true, 
        trim:true, 
        maxlength: [40, 'A tour name must have less or equal 40 characters'], 
        minlength: [10, 'A tour name must have more or equal 10 characters']
    }, 
    //NOTE - I MUST HAVE THIS PROPERTY DEFINED HERE IN THE SCHEMA! 
    //OTHERWISE THE CODE IN THE PRE-SAVE M.W : this.slug = slugify(this.name...)
    //WILL NOT PERSIST THE DOC!
    slug:String, 
    duration:{
        type:Number, 
        required:[true, 'A tour must have a duration']
    }, 
    maxGroupSize:{
        type:Number, 
        required:[true, 'A tour must have a group size']
    }, 
    difficulty:{
        type:String, 
        required:[true, 'A tour must have a difficulty'],
        //IMPORTANT ENUM ADDING THE ERROR MESSAGE TO ENUM - Create an extra object:
        enum:{
            values:['easy', 'medium', 'difficult'], 
            message:'Difficulty is either: easy, medium, difficult'
        }
    }, 
    ratingsAverage:{
        type:Number,
        default:4.5 ,
        //min-max :;ON NUMBERS AND DATES!
        min:[1,'Rating must be above 1.0'],
        max:[5,'Rating must be below 5.0'],
        //JONAS (169)SETTER FUNCTION - TRIGGERED WHEN ratingsAverage is set/updated
        //NOTE THE TRICK - Math.round(4.66667) = 5 - BUT I WANT 4.7
        set: val => Math.round(val * 10) / 10 
        //Q.A SOLUTION - USE val.toPrecision(3) - For the case of val = 3.75 - I will get 3.75(Instead of jonas getting 3.8!)
        //set:val => val.toPrecision(3)
    }, 
    ratingsQuantity:{
        type:Number, 
        default:0 ,
    }, 
    price:{
        type:Number, 
        required:[true, 'A tour must have a price']
    }, 
    //MY CUSTOM VALIDATOR: price must be >= priceDiscount
    priceDiscount:{
        type:Number, 
        validate: {
            //THIS ONLY POINTS TO CURRENT DOC ON - NEW - DOCUMENT CREATION!!(not update!)
            validator: function(val){
                return val < this.price;
            }, 
            //MONGOOSE SYNTAX ({VALUE}} -  refers to the input value
            message:'Discount price ({VALUE}) should be below regular price'

        }
    },
    summary:{
        type:String, 
        trim:true, 
        required:[true, 'A tour must have a description']
    }, 
    description:{
        type:String ,
        trim:true
    }, 
   
    imageCover:{
        type:String, 
        required:[true, 'A tour must have a cover image']
    }, 
    images:[String], 
    createdAt:{
        type:Date, 
        //timestamp (m.s) - mo
        default:Date.now(),
        //EXCLUDE THIS FIELD FROM THE SCEMA - SO USER CAN NOT SEE IF TOUR IS OUTDATED
        select:false
    }, 
    startDates:[Date], 
    //SECRET TOUR - TO BE FETCHED BY PRE FIND M.W!
    secretTour: {
        type:Boolean, 
        default: false
    }, 
    startLocation:{
        //GeoJSON(Must have at least the 2 fields name: type and coordinates)
        type:{
           type:String, 
           default:'Point', 
           enum:['Point']
        },
        coordinates:[Number], 
        //Optionals properties for GeoJSON
        address:String,
        description:String
    },
    //EMBED Location DOCUMENT Into this Tour document - must use an array of GeoJSON type !
    locations:[
        {
        //GeoJSON(Must have at least the 2 fields name: type and coordinates)
        type:{
           type:String, 
           default:'Point', 
           enum:['Point']
        },
        coordinates:[Number], 
        //Optionals properties for GeoJSON
        address:String,
        description:String,
        day:Number
    }
        
    ], 
    //THE REFERENCING SOLUTION - USED IN THIS PROJECT(FOR PREVENTING MULTIPLE UPDATES FOR WHEN UPDATE THE USER I DONT HAVE TO TO UPDATE THE TOUR)
    guides:[
       { 
        //SCHEMA TYPE DEFINITION
        type: mongoose.Schema.ObjectId, 
        //By using ref - I dont  need to import the User.js
        ref:'User'
       }
    ]
    /**
     * guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
     */

    //THE EMBEDDING SOLUTION - JUST FOR DEMO!!
    //DO I NEED TO ADD IT - OR LET IT BE CREATED LATER WHEN ADDING GUIDES IN THE REQUEST??
    //YES! OTHERWISE - I WILL GET CAN NOT RUN MAP ON UNDEFINED!
    //guides:Array
    //OR
    //guides:[]

},
//MUST ADD THIS OPTIONS OBJECT TO THE SCHEMA - OTHERWISE V.P WILL NOT BE RETURNED IN THE OUTPUT!!
{
    //EACH TIME THE DATA IS OUTPUT  AS JSON - I WANT THE VIRTUAL
    toJSON: {virtuals:true}, 
    toObject:{virtuals:true}

}

)



////////////////////////////////////////////////////
//VIRTUAL PROPERTIES(not persisted!): Convert #days in db to #weeks in the output!
//get => Will be called each time something returned from db(getter)
//REGULAR FUNCTION - NOT ARROW - SINCE THE FUNCTION IS AN INSTANCE METHOD ON THE DOC OBJECT
//////////////////////////////////////////////
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7; 
})


////////////////////////////
//INDEXES
/////////////////////////
//COMPOUND INDEX:  => GREAT : examined : 3, returned : 3 (WITHOUT THIS INDEX: 3/9 -> BAD!)
tourSchema.index({price:1, ratingsAverage:-1})

//SINGLE FIELD INDEX 
tourSchema.index({slug:1})
//WRONG!!!!!!
// tourSchema.index({price: {$lt: 1000}, ratingsAverage: {$gt: 4.5}})


//GEOSPATIAL INDEX: type = 2dsphere for a REAL earth like sphere (2d for FICTIONAL POINT ON  A2D plain)
tourSchema.index({startLocation: '2dsphere'})


//CREATE A COMPOUND INDEX => #scanned = #returned = 2 (WITHOUT THE INDEX:  2/9)
tourSchema.index({price:1, ratingsAverage:-1})

//CREATE A SINGLE FIELD INDEX ON THE SLUG - SINCE  LATER I WANT USE THE UNIQUE SLUG TO QUERY THE TOURS
//THE SLUG WILL BE PROBABLY  THE MOST  QUERIED FIELD!
tourSchema.index({slug:1})

//////////////////////////////////////////////////////////////
//VIRTUAL POPULATE - GET ACCESS TO THE REVIEWS - WITHOUT HAVING CHILD REFERENCING ARRAY STORED IN DB
////////////////////////////////////
tourSchema.virtual('reviews', {
    ref:'Review',
    //CONNECTING THE 2 MODELS: tour is the name of the field that stores the id of the current tour document in the review document 
    foreignField: 'tour',
    localField:'_id'

})

//IMPORTANT: I MUST HAVE THE slug PROPERTY ON THE SCHEMA DEFINED! OTHERWISE - this.slug = value - WILL NOT BE PERSISTED TO DB! 

/////////////////////////////////////////////////////////////////////
//PRE SAVE DOCUMENT M.W : cb  m.w execute  ONLY between calling .save() and .create()
//////////////////////////////////////////////////
// [NOT ON insertMany] OR findByIdAndUpdate, findOneAndUpdate() ! SINCE THEY RETURNS QUERY
//this is the currently processed doc
// console.log('-----INSIDE PRE SAVE M.W----')
// console.log(this);- CURRENT DOCUMENT
//CHECK WHY PRINT ALSO THE V.P??
tourSchema.pre('save', function(next){

    this.slug = slugify(this.name, {lower: true})

    next();
})

//PRE-SAVE M.W FOR ADDING EMBEDDING THE USERS  WITH THE IDS FROM THE REQUEST - INTO THE TOUR - RIGHT BEFORE IT IS SAVED 
tourSchema.pre('save', async function(next) {
    
    //CREATE AN ARRAY OF PROMISE<User> 
    const guidesPromises = this.guides.map(async id =>  User.findById(id))

    //RUN ALL THE  PROMISES IN THE ARRAY AT THE SAME TIME! 
    this.guides = await Promise.all(guidesPromises);


    next(); 
})


//PRE-FIND QUERY M.W 
//THIS M.W WILL BE EXECUTED RIGHT BEFORE THE API Features :  await Tour.find({}..)
//this -> current processing Query instance
//=> THIS IS THE TIME TO CHAIN LOGIC TO THE BASIC LOGIC
tourSchema.pre(/^find/, async function(next) {
   
    //const notSecretTours =  this.find({secretTour: {$ne : true}})
    //ADD TO THE current Query object a property (in ms)
    this.start = Date.now(); 

    next();
    
})


/**
 * 
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

 */
//MAKE ALL THE QUERIES (findXXX - to populate the users into the tour)
//POPULATE THE REVIEWS  OF THIS TOUR - IN THE getTour OF THE RENDERING WEBSITE 
//- DONT POPULATE IN THE API!
tourSchema.pre(/^find/, function(next){

    //this - points to the current Query Object: Tour.findById() etc..
    this.populate({
        path:'guides', 
        select:'-__v -passwordChangedAt'
    })

    next(); 
})


//POST FIND M.W 
tourSchema.post(/^find/, function(docs, next) {

    console.log(`Query took:   ${Date.now() - this.start} ms`)

    next();
})


//REMOVE THIS MM.W - FOR THE GEOSPATIAL PIPELINE!
//MUCH BETTER TO IMPLEMENT SECRET TOUR HERE IN THE MODEL - THEN IN THE CONTROLLER
//PRE AGGREGATION M.W - EXCLUDE THE SECRET TOURS FROM THE RESULT SET
// tourSchema.pre('aggregate', function(next) {

//     //ADD A NEW FIRST ELEMENT (stage) OF THE PIPELINE ARRAY OF THE CURRENT AGGREGATION
//     this.pipeline().unshift({ $match: { secretTour: {$ne: true}}})


//     console.log('PRE-AGGREGATE AFTER ADDING A STAGE TO THE PIPE LINE')
//     console.log(this.pipeline())
//     next(); 
//     //REFFERS TO THE CURRENT Aggregate instnce
//     //console.log(this)

//     //REMOVE
// })

const Tour = mongoose.model('Tour' , tourSchema)



//TESTS PRE M.W AND POST M.W
// tourSchema.pre('save', function(next){
//     console.log('IN THE SECOND(LAST) PRE SAVE M.W - going to save')
//     next();
// })

// //POST SAVE M.W()  - doc is the final document - 
// tourSchema.post('save', function(doc, next){


//     next();
// })


module.exports = Tour; 


/**SUMMARY - TOURS MODELLING
 * 
 * KEY NOTES: 
 *  1)The ratingsAverage & ratingsQuantity - ARE NOT REQUIRED ! 
 *      SINCE THEIR VALUES ARE NOT SET BY THE USER THAT CREATED THE TOUR 
 *      BUT ARE DERIVED BASED ON THE LATER WILL BE ADDED Review Model!
 * 
 *  2.IF SOME TOUR DATA IS NOT ON THE OVERVIEW PAGE OF THE WEBSITE - IT IS NOT REQUIRED!
 *      THE OVERVIEW PAGE: 
 *           Presents 3 cards of tours- each contains tour data:
 *           name,Difficulty duration, summary(prefix..), start location,amount of locations ,
 *           start date, Max group size , price , ratingAverage
 *           ratingQuantity , image 
 *       
 * 
 *  3.trim data property (only on string s) 
 * 
 *  4.imageCover - the image name as it is stored in the F.S
 *    image not stored in the DB! the db stores only the image name
 * 
 *  5.images:(other than the coverImage) - stored in an array !!
 *      type:[String]
 *  
 *  6.createdAt: timestamp(m.s) when the user creates the tour!
 *       => SHOULD SET TO TYPE OF DATE(JS DATA TYPE - SO I CAN USE IT) - AND BE ADDED AUTOMATICALLY: 
 *        Mongoose converts timestamp automatically to current date 
 *          type:Date , 
 *          default: Date.now(); 
 *              
 * 
 *  7.startDates: [Date] - each tour can starts at different dates ! 
 *     Different instances of the same tour document can starts at different date
 *           mongodb will parse the Date string in the format  I pass to it : 
 *                  like 2021-03-21,11:32, or timestamp ,,
 *                  to a JS Date object 
 *            If it can not parse - then throw an error!
 * 
 * 
 * 
 * 
 * 
 * ALL PROPERTIES( FOR NOW -BEFORE ADDING CUSTOM VALIDATORS...)
 * - name: String, required, unique
 * - price:Number ,required 
 * - Difficulty: String  , required
 * 
 * - ratingsQuantity  and ratingsAverage
 *       - Number
 *       - NOT REQUIRED: 
 *            since they are not create by the user that create the tour 
 *            they are derived calculations
 * 
 *      
 *   
 * 
 * 
 * 
 * 
 */