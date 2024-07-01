
/**Reusable class contains all API FEATURES - to be used by all resources
 * THIS CAN BE DONE BY INJECTING THE Mongoose.Query object in the constructor class 
 * instead of quering for the Tour inside the class - and therefore bound it to the Tour resource
//NOTE: 
//query is Mongoose Query object, 
//queryString : req.query object from express
 */
class APIFeatures{
    constructor(query, queryString)
    {
        this.query = query ; 
        this.queryString = queryString;
    }
    
    //API-FEATURE 1: FILTERING 
    //FEATURE 1.A) Filtering
    //BEFORE REFACTORING TO THIS CLASS
     //let query = this.query.find(JSON.parse(queryStr))
    filter()
    {
        
        const queryObj = {...this.queryString};
        const excludedFields = ['page', 'sort', 'limit', 'fields']
       
        excludedFields.forEach(el => delete queryObj[el])
        
       // console.log(this.query,  queryObj);


        //FEATURE 1.B : ADVANCED FILTERING - QUERY OPERATORS : replace for ALL EXACT MATCHES OF  gt,lt,lte,gte
        let queryStr = JSON.stringify(queryObj)
        queryStr =queryStr.replace(/\b(lte|lt|gte|gt)\b/g,match => `$${match}`)
        

        //UPDATE THE query instance property to the query parameter
        this.query = this.query.find(JSON.parse(queryStr))

        return this;
    }
       

    //2)SORT
    sort()
    {
        console.log(this.queryString);
        // if(req.query.sort) 
        if(this.queryString.sort) 
        {   
           
            const sortBy = this.queryString.sort.split(',').join(' ');
            // console.log(sortBy)

            this.query = this.query.sort(sortBy);
            //query = query.sort(sortBy)
        }
        else 
        {
            //DEFAULT SORTING : by createdAt Descending order:  NEWEST TOURS ARE DISPLAYED FIRST SINCE THEY HAVE LARGER TIMESTAMP!!
            this.query = this.query.sort('-createdAt'); 
        }

        return this;

    }

    //3) LIMITING FIELDS
    limitFields() 
    {
         //FEATURE 3:FIELD LIMITING
       if(this.query.fields)
       {    
        //Create an array of strings from the query req.query.fieldss
        const fields = this.query.fields.split(',').join(' ')

        //MONGOOSE EXPECTS FIELDS SEPARATED BY SPACES 
        this.query = this.query.select(fields) 
       }
       else
       {
       
         this.query.select('-__v')
       }

       return this;

    }

    //4)PAGINATION
    paginate()
    {
      
       const page = this.queryString.page * 1 || 1 
       const limit = this.queryString.limit * 1 || 100
       const skip = (page - 1)  * limit; 

       this.query = this.query.skip(skip).limit(limit);
  
       return this;

      
     //DONT NEED ALL THE BELOW CODE!! SINCE I DONT NEED TO THROW AN ERROR WHEN NO RESULTS!! client understand that [] ...
       //COMPUTE THE SKIP VALUE - NUMBER OF DOCUMENTS TO BE SKIP
       //const skip = (page - 1) * limit;
        //    if(this.queryString.page)
        //    {
        //      const numberOfTours = await Tour.countDocuments(); 

        //     if(numberOfTours < skip) throw new Error(`This page does not exist`)

        //    }
      
      
       //TEST THE REQUEST FOR ONE PAGE WITH 3 RESULTS - OK!

    }
    
}


module.exports = APIFeatures;