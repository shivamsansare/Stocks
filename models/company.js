var mongoose=require("mongoose");

var CompanySchema=new mongoose.Schema({
    id: String,
    symbol: String,
    company: String,
});

module.exports=mongoose.model("Company",CompanySchema);