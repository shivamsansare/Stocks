var request=require("request"),
    keys=require("../keys.js"),
    Prices=require("../models/prices.js"),
    Company=require("../models/company.js"),
    mongoose=require("mongoose");

var updates={
    today: 0
};

var stockId=[],
    stockSymbol=[],
    stock=[],
    temp=0;


updates.updateDate=function(){
    updates.today=new Date();
    updates.today=updates.today.toString();
    updates.today=updates.today.split(":")[0].slice(0,-3);
    // console.log(today);
}

updates.repetativeCall=async function(date){
    for(var j=0;j<stock.length;j++){
        console.log(j);
        var sysDateUTC=new Date(date);
        var sysDate=sysDateUTC.getFullYear()+"-"+(sysDateUTC.getMonth()+1)+"-"+sysDateUTC.getDate();
        console.log("repcall");
        console.log(sysDate);
        if(j%2==0){
            stockUrl="https://fcsapi.com/api-v2/stock/history?id="+stockId[j]+"&period=1d&from="+sysDate+"&to="+sysDate+"&access_key="+keys.key.fcsApiKey2;
        }
        else{
            stockUrl="https://fcsapi.com/api-v2/stock/history?id="+stockId[j]+"&period=1d&from="+sysDate+"&to="+sysDate+"&access_key="+keys.key.fcsApiKey;
            //stockUrl="https://fcsapi.com/api-v2/stock/history?id="+stockId[j]+"&period=1d&access_key="+keys.key.fcsApiKey;
        }
        console.log(stockUrl);
        await updates.settingInterval(stockUrl,j+1);
    }
}

updates.settingInterval=async function(url,j){
    new Promise(function(resolve, reject){
        resolve(setTimeout(function() { 
            updates.callUrl(url); }, 
            60000*j))
    })
}


updates.callApi=function(stockUrl,temp){
    console.log(stockUrl);
    console.log(temp);
    request({
        url:stockUrl,
        json:true
        },function(error,response,body){
                console.log("request");
                updates.newCompany(body,temp);
           }
    );
}


updates.callUrl=function(stockUrl){
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
                        updates.updateDatabase(body);
                    }
                }
           }
    );
}


updates.newCompany=function(body,temp){
    console.log("new Company");
    if(body.status==true){
        for(var i=0;i<body.response.length;i++){
            var dates=new Date(body.response[i].tm);
            var date=new Date(dates.getFullYear(),dates.getMonth(),dates.getDate(),0,0,0);
            //console.log(temp);
            var newPrice={company:temp,date:date,price:body.response[i].c};
            //console.log(newPrice);
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
}


updates.addingCompany=function(id,sym,comp){
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


updates.updateDatabase=function(body){
    console.log("update");
    //console.log(body);
    var i=body.response.length-1;
    var dated=body.response[i].tm;
    dated=dated.split(" ");
    var dates=new Date(dated[0]);
    var date=new Date(dates.getFullYear(),dates.getMonth(),dates.getDate(),0,0,0);
    var company=stock[stockSymbol.indexOf(body.info.symbol)];
    var newPrice={company:company,date:date,price:body.response[i].c};
    var newCheck={company:company,date:date};
    console.log(newPrice);
    Prices.findOne(newCheck,function(err,newFind){
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


updates.findCompany=function(){
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
}

updates.extractFileDetails=function(result){
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
    var newComp={company:company};
    Company.create(newComp,function(err,newEntry){
        if(err){
            console.log(error);
        }
        else{
        } 
    });
}

module.exports=updates;