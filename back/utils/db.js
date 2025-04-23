const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()



const db_connection = async() => {

  
    const MONGO_CONNECTION_STRING = "mongodb+srv://senevirathnaanuda:hirumi@cluster0.qqta1xm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    if(MONGO_CONNECTION_STRING != null) {

        try{
            mongoose.connect(MONGO_CONNECTION_STRING)

            console.log("Successfully connected")
        }
        catch(err) {
            console.log("Something went wrong..")
        }

    }
    else {
        console.log("There is database connection violate")
    }
    
} 


module.exports = db_connection