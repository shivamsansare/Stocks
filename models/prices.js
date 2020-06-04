var mongoose=require("mongoose");

var PricesSchema=new mongoose.Schema({
    date: Date,
    price: Number
});

module.exports=mongoose.model("Prices",PricesSchema);