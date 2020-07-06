
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
    mongoose=require("mongoose");



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
            input: req.file.path, 
            output: null, 
            lowerCaseHeaders:true
        }, function(err,result){
            if(err) {
                console.log(err);
            }
            var i=0;
            console.log(result.length);
            for(i=1;i<result.length-1;i++){
                var company=result[i].symbol;
                company=company.toUpperCase();
                var str=result[i].close;
                var price=parseFloat(str.replace(/,/g, ""));
                    var newPrice={company:company,date: result[i].date,price:price};
                    //console.log(newPrice);
                    Prices.create(newPrice,function(err,newEntry){
                    if(err){
                        console.log(error);
                    }
                    else{
                    } 
                });
            }
            var company=result[1].symbol;
            var newComp={company:company}
            Company.create(newComp,function(err,newEntry){
                if(err){
                    console.log(error);
                }
                else{
                } 
            });
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
    var stockUrl="https://fcsapi.com/api-v2/stock/history?id="+id+"&period=1d&from=2019-12-31T23:00&to="+req.body.date+"T23:00&access_key="+keys.key.fcsApiKey;
    console.log(stockUrl);
    addingCompany(id,sym,comp);
    callApi(stockUrl);
    res.redirect("/display");
});

function addingCompany(id,sym,comp){
    var add={id:id,symbol:sym,company:comp};
    console.log(add);
    Company.create(add,function(err,newEntry){
        if(err){
            console.log(err);
        }
        else{
            console.log(newEntry);
        } 
    });
}


function callApi(stockUrl){
    console.log(stockUrl);
    request({
        url:stockUrl,
        json:true
        },function(error,response,body){
                console.log("request");
                newCompany(body);
           }
    );
}

function newCompany(body){
    console.log("new Company");
    for(var i=0;i<body.response.length;i++){
        var dates=new Date(body.response[i].tm);
        var date=new Date(dates.getFullYear(),dates.getMonth(),dates.getDate(),0,0,0);
        var newPrice={company:stock[stock.length-1],date:date,price:body.response[i].c};
        console.log(newPrice);
        Prices.create(newPrice,function(err,newEntry){
            if(err){
                console.log(err);
            }
            else{
                //console.log(newEntry);
            } 
        });
    }
}



app.get("/companyList",function(req,res){
    fs.readFile("companyList.json",'utf-8',function(err,data){ 
        if(err){
            throw err; 
        }  
        else{
           var list=JSON.parse(data);
           //console.log(list.response);
           res.render("companyList",{company:list.response})
        }
    }); 
});


app.get("*",function(req,res){
    res.send("Page not available");
});

//const PORT=5000;

var stockId=[];
var stockSymbol=[];
var stock=[];

app.listen(process.env.PORT,process.env.IP,function(req,res){  

    setInterval(function(){
        //console.log("first");
        Company.find({},function(err,found){
            if(err){
                console.log(err);
            }
            else{
                //console.log(found);
                stockId=[];
                stockSymbol=[];
                stock=[];
                found.forEach(function(item){
                    if(stock.includes(item.company)){
                        console.log("present");
                    }   
                    else{
                        stockId.push(item.id);
                        stockSymbol.push(item.symbol);
                        stock.push(item.company);
                        //console.log("else");
                    }
                });
            }
        });
        //console.log(stock);
    },3600000);



    setInterval(async function(){
            for(var j=0;j<stock.length;j++){
                console.log(j);
                var sysDateUTC=new Date();
                var prevDateUTC=new Date();
                prevDateUTC.setDate(prevDateUTC.getDate()-1);
                var sysDate=sysDateUTC.getFullYear()+"-"+(sysDateUTC.getMonth()+1)+"-"+sysDateUTC.getDate();
                var prevDate=prevDateUTC.getFullYear()+"-"+(prevDateUTC.getMonth()+1)+"-"+prevDateUTC.getDate();
                if(j%2==0){
                    stockUrl="https://fcsapi.com/api-v2/stock/history?id="+stockId[j]+"&period=1d&from="+prevDate+"&to="+sysDate+"&access_key="+keys.key.fcsApiKey2;
                }
                else{
                    stockUrl="https://fcsapi.com/api-v2/stock/history?id="+stockId[j]+"&period=1d&from="+prevDate+"&to="+sysDate+"&access_key="+keys.key.fcsApiKey;
                    //stockUrl="https://fcsapi.com/api-v2/stock/history?id="+stockId[j]+"&period=1d&access_key="+keys.key.fcsApiKey;
                }
                console.log(stockUrl);
                await settingInterval(stockUrl,j+1);
            }
    },86400000);
    console.log("hello");
})

async function settingInterval(url,j){
    new Promise(function(resolve, reject){
        resolve(setTimeout(function() { 
            callUrl(url); }, 
            60000*j))
    })
}


function callUrl(stockUrl){
    console.log(stockUrl);
    request({
        url:stockUrl,
        json:true
        },function(error,response,body){
                console.log("request");
                if(error){

                }
                else{
                    var status=body.status;
                    if(status===false){
                        console.log("false");
                    }
                    else{
                        updateDatabase(body);
                    }
                }
           }
    );
}

function updateDatabase(body){
    console.log("update");
    //console.log(body);
    var i=body.response.length-1;
    var dated=body.response[i].tm;
    dated=dated.split(" ");
    var dates=new Date(dated[0]);
    var date=new Date(dates.getFullYear(),dates.getMonth(),dates.getDate(),0,0,0);
    var company=stock[stockSymbol.indexOf(body.info.symbol)];
    var newPrice={company:company,date:date,price:body.response[i].c};
    console.log(newPrice);
    Prices.findOne(newPrice,function(err,newFind){
        if(newFind){
            console.log("present");
        }
        else{
            Prices.create(newPrice,function(err,newEntry){
                if(err){
                    console.log("None");
                }
                else{
                    console.log(newEntry);
                } 
            });
        }
    });
}

// var stockId=["63593","64008","63596","63607","63611","63798"];
// var stockSymbol=["ICBK","INDB","ITC","SBI","TAMO","TTPW"];
// var stock=["ICICI","IBVENTURES","ITC","SBI","TATA MOTORS","TATA POWER"];
//stockUrl="https://fcsapi.com/api-v2/stock/latest?id=63593,64008,63596,63607,63611,63798&access_key="+keys.key.fcsApiKey;
