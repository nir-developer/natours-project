//MY ROUTERS
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')
const crypto = require('crypto');




//NOTE - I SET THE COOKIE-PARSER AND CORS (HE DID NOT) FOR PARSING COOKIES THE BROWSER SEND -  ON LECTURE 142 - SENDING JWT VIA COOKIE
const cors = require('cors')

const express = require('express')
const morgan = require('morgan')


//PARSE THE DATA FROM THE REQ BODY  ,THE SECOND FROM THE REQ.COOKIE
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')


//SECURITY M.W
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize= require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp');


const path = require('path')




const app = express();   


////////////////////////////////
//PUG TEMPLATE ENGINE SETUP:
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))


/////////////////////////////////////////////////////////
//GLOBAL M.W 
////////////////////////////////////////


 //CHAT GPT ! SOLUTION FOR THE ERROR ON THE CLIENT 
 //ADD THE BELOW M.W & AND CONFIGURE HELMET TO HANDLE Content Security Policy !!
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('hex');
  next();
});

// Customize Helmet's Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": [
        "'self'", 
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", 
        "https://cdn.jsdelivr.net", 
        (req, res) => `'nonce-${res.locals.nonce}'`
      ],
      "style-src": [
        "'self'", 
        "https://unpkg.com", 
        "https://fonts.googleapis.com", 
        "'unsafe-inline'"
      ],
      "img-src": [
        "'self'", 
        "data:", 
        "https://*.tile.openstreetmap.org"
      ],
      "connect-src": [
        "'self'", 
        "https://*.tile.openstreetmap.org"
      ],
      "font-src": [
        "'self'", 
        "https://fonts.gstatic.com"
      ],
    },
  })
);



//SERVING STATIC FILES 
 app.use(express.static(path.join(__dirname, 'public')))


//Development logging
if(process.env.NODE_ENV==='development' || process.env.NODE_ENV==='test') 
    app.use(morgan('dev'))


//Body Parsers - Reading data from the request body into req.body (limit the body to 10KB)
app.use(bodyParser.json({limit: '10kb'}))
app.use(bodyParser.urlencoded({extended:false}))

//DATA SANITIZATION : Write below the body parser that reads the user input data : 
//1) AGAINST NOSQL INJECTION ATTACK  XSS ATTACK 
app.use(mongoSanitize());
//2) AGAINST XSS ATTACK 
app.use(xss());

//Preventing Http Parameter Polution M.W 
//ADD WHITE-LIST TO BE ABLE TO PASS DUPLICATE PARAMETER NAMES ON THE QUERY STRING QUERY STRING PARAMATERS(LIKE  DURATION,)
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity' , 
        'ratingsAverage', 
        'price', 
        'difficulty',
        'maxGroupSize'
        

    ]
}))



//Limit requests from the same IP 
const limiter = rateLimit({
    max: 100, 
    windowMs: 60 * 60 * 1000, 
    message:'Too many from this IP, please try again in an hour!'
})

//REGISTER THE limiter as a M.W - ONLY TO MY API
app.use('/natours/api', limiter);




//I ADDED CORS AND COOKIE PARSER
app.use(cors({
    origin:'http://localhost:1234',
    credentials:true
}))

app.use(cookieParser())
// app.options('*', cors({

// }))



//TEST FIRST GENERAL EXPRESS M.W
app.use((req,res,next) =>{
    req.requestTime = new Date().toISOString(); 

    //TEST INCOMING COOKIES 
    console.log('TEST M.W (FIRST M.W) cookies:')
    console.log(req.cookies) 
    next();
})



////////////////////////////////
//END POINTS - AND WEB SITES API
/////////////////////////////////////////////////

///MOUNT THE VIEWS ON THE ROOT URL!!(The overview page)
app.use('/', viewRouter)


//API END POINTS 
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users/', userRouter)
app.use('/api/v1/reviews', reviewRouter)




//ADMIN ROUTES: 



//OK
app.use('*', (req,res,next) => {
   next (new AppError((`Can't find ${req.originalUrl} on this server`, 404)))
  
})


//PASS EXPRESS THE ERROR HANDLER FUNCTION : IN THE FORM OF 4 params! 
app.use(globalErrorHandler)


module.exports = app; 




//app.use('*', (req,res,next) => {
    //INSTEAD OF RETURN THE RESPONSE - CREATE AN ERROR AND PASS TO NEXT!AS BELOW
    // res.status(404).json({
    //     message:'Page not found',
    //     status:'fail'
    // })


    //- BETTER :GENERATE THE ERROR AND PASS DOWN TO NEXT
    // const err = new Error(`Can't find ${req.originalUrl} on this server`); 
    // err.statusCode =404; 
    // err.status = 'fail'

    // next(err)

//     next (new AppError((`Can't find ${req.originalUrl} on this server`, 400)))
  
// })


//GLOBAL ERROR HANDLER OF EXPRESS!
// app.use((err,req,res,next) =>{
//     console.log(err.__proto__);

//     const status = err.status || 'error';
//     const statusCode = err.statusCode || 500; 
//     const message = err.message || 'Internal Server Error';

//     res.status(statusCode).json({
//         status:status,
//         message

//     })
// })
