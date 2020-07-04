var express=require("express");
    app=express(),
    bodyParser=require("body-parser"),
    Prices=require("./models/prices.js"),
    methodOverride=require("method-override"),
    multer = require('multer'),
    request=require("request"),
    keys=require("./keys"),
    mongoose=require("mongoose");

var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

mongoose.connect(keys.key.mongoDb);

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

app.delete("/delete",function(req,res){
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
            for(i=1;i<result.length;i++){
                var company=result[i].symbol;
                company=company.toUpperCase();
                var str=result[i].close;
                var price=parseFloat(str.replace(/,/g, ""));
                    var newPrice={company:company,date: result[i].date,price:price};
                    //console.log(newPrice);
                    Prices.create(newPrice,function(err,newEntry){
                    if(err){
                        //console.log(newEntry);
                        console.log("Yayay");
                    }
                    else{
                    } 
                });
            }
            res.redirect("/display");
        });
    } 
    catch (e){
        res.json({error_code:1,err_desc:"Corupted excel file"});
    }
});

app.put("/danger/edit",function(req,res){
    Prices.updateMany({company:req.body.company.toUpperCase()},{company:req.body.company1.toUpperCase()},function(err,up){
        if(err){
            console.log(err);
            res.redirect("/danger");
        }
        else{
            res.redirect("/");
        }
    })
});


app.get("/danger",function(req,res){
    res.render("danger");
});

app.delete("/danger/delete",function(req,res){
    Prices.remove({},function(err,del){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/");
        }
    })
});

app.delete("/danger/deleteCompany",function(req,res){
    Prices.remove({company:req.body.company.toUpperCase()},function(err,del){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/");
        }
    })
});

// app.get("/api",function(req,res){
//     stockUrl="https://fcsapi.com/api-v2/stock/history?id=63611&period=1d&from=2019-12-31T23:00&to=2020-07-05T23:00&access_key="+keys.key.fcsApiKey;
//     request({
//         url:stockUrl,
//         json:true
//         },function(error,response,body){
            
//             for(var i=0;i<body.response.length;i++){
//                 var newPrice={company:"TATA MOTOR",date:body.response[i].tm,price:body.response[i].c};
//                 Prices.create(newPrice,function(err,newEntry){
//                     if(err){
//                         console.log("New");
//                     }
//                     else{
//                     } 
//                 });
//             }
//             res.redirect("/display");
//         }
//     );
// });

app.get("*",function(req,res){
    res.send("Page not available");
});

//const PORT=5000;

app.listen(process.env.PORT,process.env.IP,function(req,res){
    // setInterval(function(){
    //     stockUrl="https://fcsapi.com/api-v2/stock/latest?id=63798,63607,63593,64008,63596,63611&access_key="+keys.key.fcsApiKey;
    //     request({
    //         url:stockUrl,
    //         json:true
    //         },function(error,response,body){
    //             var stock=["TATA POWER","SBI","ICICI","IBVENTURES","ITC","TATA MOTOR"];
    //             for(var i=0;i<body.response.length;i++){
    //                 var dates=body.response[i].dateTime;
    //                 dates=dates.split(" ");
    //                 date=new Date(dates[0]);
    //                 var newPrice={company:stock[i],date:date,price:body.response[i].price};
    //                 Prices.create(newPrice,function(err,newEntry){
    //                     if(err){
    //                         console.log("New");
    //                     }
    //                     else{
    //                     } 
    //                 });
    //                 console.log(newPrice);
    //             }
    //         }
    //     );
    // },5000);
    console.log("hello");
})
