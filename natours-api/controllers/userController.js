const catchAsync = require('../utils/catchAsync')
const User = require('../models/User')
const factory = require('./handlerFactory')



const filterObj = (obj, ...allowedFields) =>{

    const newObj = {}
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })

    return newObj;
}


//M.W - inject the logged in user id into the req.params
//(then the getUser handler will read this id - as if it passed by the client!)
//the getUser will call the getOne factory - and the id will be available for getOne factory!
exports.getMe = catchAsync(async(req,res,next)=>{
    req.params.id = req.user.id;
    next();
})

exports.updateMe = catchAsync(async(req,res,next) =>{

    //STEP  1: Create error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm)
        return next(new AppError('This route is not for password updates.Please use /updateMyPassword', 400))


    ///FILTERED OUT UNWANTED FIELDS NAMES THAT ARE NOT ALLOWED BE UPDATED!(LIKE ROLE,..)
    const filteredBody = filterObj(req.body, 'name', 'email'); 

   //STEP 2: UPDATE USER ACCOUNT
    const updatedUser = await User.findByIdAndUpdate(req.user.id ,filteredBody, {
        new:true, 
        runValidators:true
    })

    console.log(updatedUser)


    res.status(200).json({
        status:'success', 
        data:{
            user:updatedUser
        }
    })

})


//USED BY THE CURRENT LOGGED IN USER - DOES NOT REMOVE THE CURRENT USER - JUST DEACTIVEATE
exports.deleteMe = catchAsync(async(req,res,next) =>{
    
    //"REMOVE" - THE CURRENT LOGGED IN ACCOUNT
    await User.findByIdAndUpdate(req.user.id, {active: false})


    res.status(204).json({
        status:'success' ,
        data:null
    })

})

/////////////////////////////////////////////////
//ADMIN END POINTS - USERS MANAGEMENT!!
/////////////////////////////////////////////
exports.getAllUsers = factory.getAll(User)

//FOR EFFECTIVELY DELETE USER FROM DB - BY THE ADMIN!
exports.deleteUser = factory.deleteOne(User)

//IMPORTANT!!!!! DO NOT UPDATE PASSWORDS WITH THIS!(SINCE PASSWORD UPDATE IS IMPLEMENTED IN A DIFFERENT FUNCTIONALITY THAT USES PRE-SAVE M.W !!)
exports.updateUser = factory.updateOne(User); 


//NO POPULATE NEEDED!
 exports.getUser = factory.getOne(User);


//THIS ROUTE WILL NEVER BE - CHECK NHAM - HE LET ADMINS TO CREATE USERS! BEFORE HAVING SIGNUP!
exports.createUser = catchAsync(async(req,res,next) =>{


    res.status(500).json({
        status:'error', 
        message:'This route is not defined! Please use /signup instead'
    })

})



//BEFORE THE getAll Factory function refactoring!
// exports.getAllUsers = catchAsync(async(req,res,next) =>{

//     const users = await User.find(); 
//     console.log(users)

//     res.status(200).json({
//         status:'success', 
//         results:users.length, 
//         data:{
//             users
//         }
        
//     })
// })







