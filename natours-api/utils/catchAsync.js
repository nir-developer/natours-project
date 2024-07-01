//CATCH ASYNC(ERROR HANDLING)
//DO I HAVE TO PASS next to fn??
module.exports = fn => (req,res,next) => fn(req,res,next).catch(next)
