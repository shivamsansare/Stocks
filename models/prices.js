var mongoose=require("mongoose");

var PricesSchema=new mongoose.Schema({
    company: String,
    date: Date,
    price: Number
});

module.exports=mongoose.model("Prices",PricesSchema);