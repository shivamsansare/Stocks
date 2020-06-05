var mongoose=require("mongoose");

var PricesSchema=new mongoose.Schema({
    company: String,
    date: Date,
    price: String
});

module.exports=mongoose.model("Prices",PricesSchema);