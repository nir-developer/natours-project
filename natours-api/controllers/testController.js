const catchAsync = require('../utils/catchAsync')




//tests/cookies
exports.getCookies = catchAsync(async (req,res,next) =>{

    const cookies = req.cookies; 
    
    console.log('GET COOKIES HANDLER - COOKIES:')
    console.log(cookies)
    res.status(200).json({
        status:'success', 
        data:{
            cookies:req.cookies
        }
    })


})