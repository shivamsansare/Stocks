var express=require("express");
    app=express(),
    bodyParser=require("body-parser"),
    Prices=require("./models/prices.js"),
    methodOverride=require("method-override"),
    multer = require('multer'),
    mongoose=require("mongoose");

var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

mongoose.connect("mongodb+srv://root:ait@cluster0-z0ft9.mongodb.net/stock?retryWrites=true&w=majority")

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride('_method'));

var upload = multer({ dest: 'uploads/' });


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
    var company=req.body.company;
    company=company.toUpperCase();
    var newPrice={company:company,date: req.body.date,price: req.body.number};
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
    var company=req.body.company;
    company=company.toUpperCase();
    Prices.findOneAndRemove({company:company,date: date},function(err,sus){
        console.log(sus);
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/display");
        }
    });
});

app.post("/uploads", upload.single('file'),function(req,res){
    console.log("here");
    var exceltojson;
    if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
        exceltojson = xlsxtojson;
    } 
    else{
        exceltojson = xlstojson;
    }
    try {
        exceltojson({
            input: req.file.path, 
            output: null, 
            lowerCaseHeaders:true
        }, function(err,result){
            if(err) {
                console.log(err);
            }
            console.log(result.length);
            var i=0;
            for(i=0;i<result.length-1;i++){
                var company=result[i].symbol;
                company=company.toUpperCase();
                var newPrice={company:company,date: result[i].date,price: result[i].ltp};
                //console.log(newPrice);
                Prices.create(newPrice,function(err,newEntry){
                if(err){
                    console.log("hellp");
                }
                else{
                }
            });
            }
            Prices.deleteMany({},function(req,res){
                if(err){
                    console.log(err);
                }
            });
            res.redirect("/display");
        });
    } 
    catch (e){
        res.json({error_code:1,err_desc:"Corupted excel file"});
    }
});

app.get("/delete",function(req,res){
    Prices.remove({},function(err,del){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/display");
        }
    })
});

app.get("*",function(req,res){
    res.send("Page not available");
});

const PORT=5000;

app.listen(PORT,function(req,res){
    console.log("hello");
})
