const fs = require("fs");
require("colors");
const dotenv = require("dotenv");
const User = require("../../models/userModel");
const dbconnection = require("../../config/database");

dotenv.config({ path: "../../config.env" });

dbconnection();

const user = JSON.parse(fs.readFileSync("./users.json"));

//insert data into db
const insertData = async () => {
  try {
    await User.create(user);
    console.log("Data inserted".green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
}
//delete data from db
const deleteData = async () => {
  try {
    await User.deleteMany();
    console.log("Data deleted".red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
}


if(process.argv[2]==='-i'){//node seeder.js -i
    insertData();
}else if(process.argv[2]==='-d'){ //node seeder.js -d   
    deleteData();
}
