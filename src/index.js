const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");
const dotenv = require("dotenv")
dotenv.config()


let server;
const PORT = config.port;

mongoose.connect(config.mongoose.url, config.mongoose.options).then(()=>{
    console.log("==>  success, mongoose connected 🚀🚀" + config.mongoose.url)
})

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port
app.listen(PORT, function(){console.log(`app is listening at the port: ${PORT}`)})


