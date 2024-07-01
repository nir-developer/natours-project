const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')

const AppError = require('../utils/appError')

exports.deleteOne = Model => catchAsync(async(req,res,next) =>{

   const doc =  await Model.findByIdAndDelete(req.params.id)

   if(!doc) 
    return next( new AppError('No document found with that ID', 404))


    res.status(204).json({
        status:'success', 
    })
})



exports.updateOne = Model => catchAsync( async (req,res,next) =>{
    
    //const tour = await Tour.findById(req.params.id)
    const doc  = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new:true, 
        runValidators:true
    })


    if(!doc) 
        return next( new AppError('No document found with that ID', 404))
    
    res.status(200).json({
    status:'success', 
        data:{
            doc
        }
    })
})


exports.createOne = Model =>  catchAsync(async (req,res,next) =>{

    console.log(req.body.guides)
     const newDoc = await Model.create(req.body); 

     res.status(201).json({
        status:'success',
        data:{
            doc:newDoc
        }
          
     })
})


/**
 * IMPORTANT : the popOptions is to be able to use this getOne on the Tour resource 
 * which has the getTour controller - that populate the reviews on the Tour.findById query ! 
 * 
//SIMILAR LOGIC AS WITH THE API FEATURES - BUILD THE QUERY STEP BY STEP - BEFORE EXECUTING IT
//First Get the query without executing it 
//UPDATE THE QUERY IF THERE IS POPULATE 
 */
exports.getOne = (Model, popOptions) => 
    catchAsync(async (req,res,next) =>{
    
       let query =  Model.findById(req.params.id) 

       if(popOptions) query = query.populate(popOptions)
       
    //EXECUTE THE QUERY TO GET THE DOCUMENT
     const doc = await query; 

       if(!doc) 
        return next( new AppError('No document found with that ID', 404))
    
    
    res.status(200).json({
        status:'success', 
        data:{
            data:doc
        }
    })
})



 //IMPORTANT - FOR THE FEFACTORING TO WORK: 
 //"HACK SOLUTION" - FOR THE LOGIC THAT THE getAllReviews has the logic of creating the filter object 
//but the TOur and User does not have :
 //CHECK IF THERE IS tourId on the nested route(MUST ENABLE Express Merge params before -on the review router)
exports.getAll = Model => catchAsync(async (req,res,next)=>
{
   
    //HACK!(the filter object logic - is extracted to this method from the previous getAllReviews !)
    let filter = {}
    if(req.params.tourId)  filter.tour = req.params.tourId;
    
 
    //EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .paginate();
       

       //The query contains all the chain I build above - now execute the query:  
        const docs = await features.query;
        
        
        //EXPLAIN METHOD: TEST PERFORMANCE OF THE INDEX -  WITH EXPLAIN METHOD
        //const docs = await features.query.explain("executionStats");
    
        //SEND RESPONSE
        res.status(200).json({
            status:'success', 
            results: docs.length, 
            data:{
                data:docs
            }
        })
    
}

)
