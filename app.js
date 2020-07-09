var express=require("express");
    app=express(),
    bodyParser=require("body-parser"),
    Prices=require("./models/prices.js"),
    Company=require("./models/company.js"),
    methodOverride=require("method-override"),
    multer = require('multer'),
    request=require("request"),
    fs=require('fs'),
    xlstojson = require("xls-to-json-lc"),
    xlsxtojson = require("xlsx-to-json-lc"),
    json_File=require("./companyList.json"),
    keys=require("./keys.js"),
    updates=require("./updates/index.js"),
    mongoose=require("mongoose");


var stockId=[],
    stockSymbol=[],
    stock=[],
    temp=0;


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
            updates.updateDate();
            console.log(updates.today);
            res.render("display",{price:found,today:updates.today});
        }
    });
});

app.post("/display",function(req,res){
    var company=req.body.company;
    company=company.toUpperCase();
    var dates=new Date(req.body.date);
    var date=new Date(dates.getFullYear(),dates.getMonth(),dates.getDate(),0,0,0);
    var newPrice={company:company,date: date,price: req.body.number};
    Prices.create(newPrice,function(err,newEntry){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/display");
        }
    });
});

app.delete("/delete",function(req,res){
    var company=req.body.company;
    company=company.toUpperCase();
    var dates=new Date(req.body.date);
    var date=new Date(dates.getFullYear(),dates.getMonth(),dates.getDate(),0,0,0);
    Prices.findOneAndRemove({company:company,date: date},function(err,sus){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/display");
        }
    });
});

app.post("/uploads", upload.single('file'),function(req,res){
    var exceltojson;
    if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
        exceltojson = xlsxtojson;
    } 
    else{
        exceltojson = xlstojson;
    }
    try {
        exceltojson({
            input: file, 
            output: null, 
            lowerCaseHeaders:true
        }, function(err,result){
            if(err) {
                console.log(err);
            }
            else{
                updates.extractFileDetails(result);
            }  
        });      
    } 
    catch (e){
        res.json({error_code:1,err_desc:"Corupted excel file"});
    }
    res.redirect("/display");
});


app.put("/danger/edit",function(req,res){
    Prices.updateMany({company:req.body.company.toUpperCase()},{company:req.body.company1.toUpperCase()},function(err,up){
        if(err){
            console.log(err);
            res.redirect("/danger");
        }
        else{
        }
    })
    Company.updateMany({company:req.body.company.toUpperCase()},{company:req.body.company1.toUpperCase()},function(err,up){
        if(err){
            console.log(err);
            res.redirect("/danger");
        }
        else{
        }
    })
    res.redirect("/");
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
        }
    })
    Company.remove({},function(err,del){
        if(err){
            console.log(err);
        }
        else{
        }
    })
    res.redirect("/");
});

app.delete("/danger/deleteCompany",function(req,res){
    Prices.remove({company:req.body.company.toUpperCase()},function(err,del){
        if(err){
            console.log(err);
        }
        else{
        }
    })
    Company.remove({company:req.body.company.toUpperCase()},function(err,del){
        if(err){
            console.log(err);
        }
        else{
        }
    })
    
    res.redirect("/");
});


app.get("/api",function(req,res){
    Company.find({}).sort({ company: 'asc'}).exec(function(err,found){
        if(err){
            console.log(err);
        }
        else{
            res.render("api",{company:found});
        }
    });
});

app.post("/api",function(req,res){
    var id=req.body.number.toString();
    var sym=req.body.symbol.toUpperCase();
    var comp=req.body.company.toUpperCase();
    var stockUrl="https://fcsapi.com/api-v2/stock/history?id="+id+"&period=1d&from=2019-12-31T23:00&to="+req.body.date+"T23:00&access_key="+keys.key.fcsApiKey2;
    console.log(stockUrl);
    updates.addingCompany(id,sym,comp);
    temp=comp;
    console.log(temp);
    updates.callApi(stockUrl,temp);
    res.redirect("/display");
});



app.get("/companyList",function(req,res){
    fs.readFile("companyList.json",'utf-8',function(err,data){ 
        if(err){
            throw err; 
        }  
        else{
           var list=JSON.parse(data);
           res.render("companyList",{company:list.response})
        }
    }); 
});


app.post("/update",function(req,res){
    
    setTimeout(function(){
        updates.updateDate();
        updates.findCompany();
    },1*1000);

    setTimeout(async function(){
        updates.repetativeCall(req.body.date);
    },5*1000);

    res.redirect("/display");
});


app.get("*",function(req,res){
    res.send("Page not available");
});

//const PORT=5000;

app.listen(process.env.PORT,process.env.IP,function(req,res){  

    console.log("hello");
})
