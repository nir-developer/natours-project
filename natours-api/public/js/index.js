//import '@babel/polyfill';
import { login, logout } from "./login.js";
import { displayMap } from './leaflet';

//DOM ELEMENTS
const leafletMap = document.getElementById('map')
const loginForm = document.querySelector('.form')
const email = document.getElementById('email');
const password = document.getElementById('password');
// const logOutBtn = document.querySelector('.nav__el--logout')
const logOutBtn = document.querySelector('.nav__el--logout');

console.log(logOutBtn)


///////////////////////////
//DELEGATION 
///////////////////
//IMPORTANT!!! SINCE THE MAP IS ONLY DISPLAYED ON THE TOUR PAGE :
//I MUST CREATE A HTML ELEMENT - TO PREVENT THE ERROR - "Can not read dataset on undefined"
if(leafletMap)
{
    //MOVED FROM leaflet.js !! COLLECTING DATA FROM UI IS DONE HERE IN THE APPLICATION LOGIC
    const locationsData = JSON.parse(document.getElementById('map').dataset.locations);
    displayMap(locationsData);

}


if(loginForm)
{
    
   loginForm.addEventListener('submit', e => {
    //console.log(email, password)

    //PREVENT FORM DEFAULT OF SUBMITTING TO THE SERVER URL - OF THE action attribute(by default URL is the current page URL)
    e.preventDefault();
    
    //LOGIN
    login(email.value, password.value)
    
    
    // //EXTRACT FROM DATA - MOVED TO TOP LEVEL SCOPE! TOP LEVEL!-TO BE REUSE LATER
    // const email = document.getElementById('email').value
    // const password = document.getElementById('password').value


})
}

//NOTE - NO NEED PREVENT EVENT DEFAULT! not a form!
if(logOutBtn) 
{
    logOutBtn.addEventListener('click',logout )
}
