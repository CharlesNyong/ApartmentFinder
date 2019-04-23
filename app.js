const express = require("express");
const apt_finder = require("kijiji-scraper");
const nodemailer = require("nodemailer"); 


let emailTransporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 25,
    auth:{
        user: "kijijiapartmentalert@gmail.com",
        pass: "charlesnyong96"
    },
    tls:{
        rejectUnauthorized: false
    }
});

// default email properties
var mailOptions = {
    from: "Apartment Finder Script",
    to: 'kijijiapartmentalert@gmail.com',
    subject: 'Potential Apartments!',
    text: 'Testing email from nodejs!'
}

let options = {
    minResults: 10
};

// kijiji search(params[, options, callback])
var arrLinkExist = new Array();
var desiredApartments = "";
var resultSize = 0;

// set the search parameter used in the search query
let searchParams = {
    locationId: apt_finder.locations.QUEBEC.GREATER_MONTREAL.CITY_OF_MONTREAL,
    categoryId: apt_finder.categories.REAL_ESTATE.APARTMENTS_AND_CONDOS_FOR_RENT,
    minPrice: 300,
    maxPrice: 650,
    Keywords: ""
}

/* Arguments
    0 - node command (i.e. "node")
    1 - Node script file
    2 - Month of apartment availability (e.g. want an apt for the month of may)
    3 - Maximum price
    4 - email address to send the result of query to
*/
var strNodeFile = process.argv[1];
var strDesiredMonth = process.argv[2];
var strMaxPrice = process.argv[3];
var strEmailRecipient = process.argv[4];
//console.log("Node file: " + strNodeFile + " Month: " + strDesiredMonth + " Price: " + strMaxPrice + " Email: " + strEmailRecipient);
if(strNodeFile && strDesiredMonth && strMaxPrice && strEmailRecipient){     
    //configure search parameters
    searchParams.maxPrice = strMaxPrice;
    searchParams.Keywords = strDesiredMonth;
    mailOptions.to = strEmailRecipient;
    // perform search
    apt_finder.search(searchParams, options).then(function(apartments){
        resultSize = apartments.length;
        for(i =0; i<apartments.length; i++){
            var strURL = apartments[i].url;
            if(!arrLinkExist[strURL]){
                desiredApartments += strURL + "\n";
                arrLinkExist[strURL] = true;
            }    
        }
        // send notification if apartments exists
        if(resultSize > 0){
            mailOptions.text = desiredApartments;
            emailTransporter.sendMail(mailOptions, function(err, info){
                if(err){
                    console.log("Error sending email, exited with error: " + err);
                }
                else{
                    console.log("Email sent: " + info.response);
                }
            });
        }
    });
}
else{
    console.warn("Format: {node scriptfile.js 'month' 'max_price' 'email'}");
}