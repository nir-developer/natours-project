const {isEmail} = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type:String, 
        required:[true, "Please tell us your name"]
    }, 
    email:{
        type:String, 
        required:[true, 'Please provide your email'], 
        unique:true, 
        lowercase:true, 
        validate:[isEmail,'Please provide a valid email']
    },
    photo:String, 
    role:{
        type:String, 
        enum:['user', 'guide', 'lead-guid', 'admin'], 
        default:'user'
    },
    password:{
        type:String, 
        required:[true, 'Please provide a password'], 
        minlength:8, 
        select:false
     },

     passwordConfirm:{
        type:String,
        required:[true, 'Please confirm your password'],
        validate:{
            validator: function(el){
                return el === this.password
            },
            message:'Password are not the same'
        }
     }, 
     passwordChangedAt: Date, 
     passwordResetToken:String  ,
     passwordResetExpires:Date, 

     active: {
        type:Boolean , 
        default: true , 
        select: false

     }
})



////////////////////////////////////////////////////////////////////
//PRE-SAVE M.W-S
//////////////////////////////////////////////////////////

//PASSWORD MANAGEMENT STEP 2:(HASH THE PASSWORD BEFORE SAVING USER)
//   Verify the password has changed since db saved/saved to/from db
//  and also remove the password confirmation 
userSchema.pre('save',async function(next){
  
    if(!this.isModified('password') ) return next();

    //Update the password to the hash value
    this.password =  await bcrypt.hash(this.password, 12);

    //PREVENT THE CONFIRM PASSWORD FROM BEING SAVED TO DB(OK DOES NOT IN THE DB AND NOT IN THE DB)
    this.passwordConfirm = undefined;

    //WILL SAVE THE USER
    next();
    
})


//USED IN FORGOT-RESET  PASSWORD  FUNCTIONALITY
userSchema.pre('save', function(next){


    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000; 

    console.log('pre-save M.W - updated passwordChangedAt : ', this.passwordChangedAt)



    next();
    
})


//PRE QUERY M.W - (this points to the current Query ) - EXCLUDE ALL NO
userSchema.pre(/^find/, function(next){
    //this.find({active: true})
    //SET EXPLICITYLY! 
    this.find({active: {$ne: false}})

    next() ; 
})
/////////////////////////////////////////////
//INSTANCE METHODS 
///////////////////////////////////
userSchema.methods.correctPassword = async (candidatePassword, userPassword) => {
    console.log(`USER MODEL correctPassword : candidatePassword:${candidatePassword}, 
    userPassword: ${userPassword }`)
    const isCorrect = await  bcrypt.compare(candidatePassword, userPassword)
    console.log('USER MODEL - correctPassword: ' ,isCorrect)
    return isCorrect;
}


userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Number.parseInt(this.passwordChangedAt.getTime() / 1000, 10,
    );

    console.log(`password updated: ${changedTimestamp}`, `JWT ISSUED AT: ${JWTTimeStamp}`);
    console.log(`PASSWORD CHANGED AFTER JWT ISSUED? ${JWTTimeStamp < changedTimestamp}`)
    
    return JWTTimeStamp < changedTimestamp;
  }

  return false;
};


userSchema.methods.createPasswordResetToken = function()
{
    const resetToken = crypto.randomBytes(32).toString('hex'); 

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

       
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 

    return resetToken;

}


const User = mongoose.model('User', userSchema)

module.exports = User;



