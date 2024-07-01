
/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/natours/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};



//SUPER IMPORTANT! RELOAD!
//MUST RELOAD THE PAGE - TO REFLECT IN THE UI THAT THE SUER LOGGED OUT(EVEN IF IT LOGGED OUT BY THE AJAX CALL ALREADY) 
//RELOAD THE PAGE - PROGRAMMATICALLY HERE IN THE CLIENT - SINCE THIS IS AN AJAX REQUEST !
//AND THEREFORE I CAN NOT DO THIS ON THE SERVER WITH EXPRESS -  INSTEAD OF MANUALLY IN THE BROWSER BAR
//BY RELOADING THE PAGE - A NEW REQUEST WILL BE SEND TO THE SERVER WITH THE NEW HTTP COOKIE WITH SAME NAME 'JWT' BUT WITHOUT THE JWT TOKEN!!!

//SUPER IMPORTANT! location.reload(true) -> TO RELOAD FROM THE SERVER!!! INSTEAD OF FROM BROWSER CACHING!!!!
//OTHERWISE - THE BROWSER MAY RENDER THE USER MENU - EVEN IF IT WAS LOGGED OUT IN THE SERVER!
//I NEED A FRESH PAGE - COMING DOWN FROM THE SERVER!!


//NOTE - TRY-CATCH - BEST PRACTICE - EVEN IF IN THIS CASE THE ONLY POSSIBLE ERROR IS NO INTERTNET CONNECTION
export const logout = async () => {
  console.log('inside logout')
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/natours/api/v1/users/logout'
    });

    //SUPER IMPORTANT! location.reload(true) -> TO RELOAD FROM THE SERVER!!! INSTEAD OF FROM BROWSER CACHING!!!!
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};

// import axios from 'axios'
// import { showAlert } from './alerts'


// // console.log(axios)

// export const login = async  (email, password)  => {
 
//   try  
//   {
//     const res = await  axios({
//         method:'POST', 
//         url:'http://localhost:3000/natours/api/v1/users/login',
//         data:{
//             email , 
//             password
//         }
//     })

//     if(res.data.status === 'success') 
//     {
//       //1) alert('LOGIN SUCCESSFUL!!')
//       showAlert('success', 'Logged in successfully!')
        
//       //2) SUPER IMPORTANT!!! RELOAD THE PAGE - MUST!
//       window.setTimeout(() => location.assign('/'), 1500)
//     }

  
//   }
//   catch(err)
//   {
//      showAlert('error', err.response.data.message)
//     // console.log(error.response.data)

//     // //RESPONSE BODY OF MY API - IN THE CASE OF AN ERROR!
//     // alert(error.response.data.message)
//   }
// }


// // document.querySelector('.form').addEventListener('submit', e => {


// //     //PREVENT FORM DEFAULT OF SUBMITTING TO THE SERVER URL - OF THE action attribute(by default URL is the current page URL)
// //     e.preventDefault();

// //     //EXTRACT FROM DATA
// //     const email = document.getElementById('email').value
// //     const password = document.getElementById('password').value


// //     //LOGIN
// //     login(email, password)



// // })