var express=require("express");
    app=express(),
    bodyParser=require("body-parser"),
    Prices=require("./models/prices.js"),
    methodOverride=require("method-override"),
    mongoose=require("mongoose");

mongoose.connect("mongodb+srv://root:ait@cluster0-z0ft9.mongodb.net/stocks?retryWrites=true&w=majority")

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride('_method'));

app.get("/",function(req,res){
    res.render("index");
});

app.get("/display",function(req,res){
    Prices.find({}).sort({ company: 'asc',date:'asc' }).exec(function(err,found){
        if(err){
            console.log(err);
        }
        else{
            res.render("display",{price:found});
        }
    });
});

app.post("/display",function(req,res){
    console.log(req.body.date);
    var newPrice={date: req.body.date,price: req.body.number};
    console.log(newPrice);
    Prices.create(newPrice,function(err,newEntry){
        if(err){
            console.log("hellp");
        }
        else{
            res.redirect("/display");
        }
    });
});

app.delete("/display/delete",function(req,res){
    var date=req.body.date;
    Prices.findOneAndRemove({date: date},function(err,sus){
        console.log(sus);
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/display");
        }
    });
});

app.get("*",function(req,res){
    res.send("Page not available");
});

//const PORT=5000;

app.listen(process.env.PORT,process.env.IP,function(req,res){
    console.log("hello");
})
