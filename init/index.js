const mongoose=require("mongoose");
const initdata=require("./data.js");
const Listing=require("../models/listing.js");



//mongo connection
const mongo_url="mongodb://127.0.0.1:27017/Ghoomify";
async function main() {
    await mongoose.connect(mongo_url);
  }

main().then(()=>{
    console.log("connected to DB");
})
.catch((err) =>{ console.log(err);});


const initDB=async()=>{
    //delete old listings and add new
    await Listing.deleteMany({});
    initdata.data=initdata.data.map((obj)=>({...obj,owner:'67de49d6688f1be155e55aa1'}));
    await Listing.insertMany(initdata.data);
    console.log("initialized data");
};

initDB();