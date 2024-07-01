const Tour = require('../models/Tour')
const catchAsync = require('../utils/catchAsync')

const appError = require('../utils/appError')


exports.getOverview = catchAsync(async(req,res,next) =>{

    //1) GET TOURS FROM DB
    const tours = await Tour.find(); 

    //2) Build the template 

    //3) Render this template using data from 1
    res.status(200).render('overview', {
        title: 'All Tours', 
        tours

    })

})

//IMPORTANT - POPULATE THE REVIEWS HERE IN THE CONTROLLER - NOT IN PRE FIND M.W IN THE TOUR SCHEMA
//SINCE THE API SHOULD NOT PRE FETCH ALL REVIEWS OF THE TOUR
exports.getTour = catchAsync( async(req,res,next)=>{
    
    
     //STEP 1  GET TOUR DATA FROM COLLECTION - INCLUDING IT'S REVIEWS AND TOUR-GUIDES
    //POPULATE THE REVIEWS(THE tour-guides ARE POPULATED IN THE SCHEMA ALREADY USING THE PRE-FIND M.W)
    const tour = await Tour.findOne({slug: req.params.slug})
        .populate({path:'reviews', fields:'review rating user'})


    //STEP 2: BUILD A TEMPLATE
    //STEP 3: RENDER THAT TEMPLATE USING TOUR DATA FROM STEP 1
    res.status(200).render('tour', {
        title:`Natours | ${tour.name}`,
        tour

    })
    
})

//NOT ASYNC?? JUST SERVE THE TEMPLATE!
exports.getLogin = (req,res) => {
    res.status(200).render('login', {
        title:`Log into your account`
    })
}