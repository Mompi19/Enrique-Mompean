
//Larga : muevo stop cuando encuentro un high por encima


const ccxt = require('ccxt');
const ta = require('ta-math')
var plotly = require('plotly')
var binance_api_node_1 = require("binance-api-node");
const binaSA = binance_api_node_1.default() 


var ohlcv = [];
symbol = 'LTC-PERP';


side = 'BUY'
lastprice = 0;
tiempoEntrada =1611274500000;
priceEntrada = 28815;

stopp = [];
stopTime = [];





async function zigzag(id_exchange,symbol,timeframe,tiempoEntrada,stopp,side,porcentaje){ 
    //console.log(symbol,timeframe,tiempoEntrada,stopp,side,porcentaje)
    const ccxt = require('ccxt');
    const ta = require('ta-math')

    let exchange = new ccxt.ftx();

    x = []
    Op = []
    df = []
    high = []
    cl = []
    low = []
    df = []
    lowest = 9999999999;
    highest=0;
    nuevoStop = 0;
    nuevoStopTiempo = 0;
    Z=[]
    var encontrado =0;
    if(id_exchange == 2){
        await exchange.fetchOHLCV (symbol, timeframe).then(msg => {
            
            df = msg

            for(i=0;i<df.length;i++)
            {
                x.push(df[i][0])
                Op.push(df[i][1])
                high.push(df[i][2])
                low.push(df[i][3])
                cl.push(df[i][4])
            }
        
            //console.log(df)
            
            
        })
    }
    if(id_exchange==1){
        await binaSA.futuresCandles({symbol: symbol,interval: timeframe}).then(msg =>{
            msg.forEach(element =>{
                x.push(element.openTime)
                Op.push(element.open)
                high.push(element.high)
                low.push(element.low)
                cl.push(element.close)
            })

        })

    }
    let promise = new Promise(async (resolve,reject) => {  



    Z = await ta.zigzag(x,high,low,porcentaje);
    //console.log(Z)
    if(side==2){
        for(j=0;j<Z.ht.length;j++){
            encontrado = 0;
            if(Z.h[j]>highest&&Z.ht[j]>=tiempoEntrada){
                highest = Z.h[j];
                for(k=1;k<(j-1);k++)
                {   
                    if(Z.l[j-k]<Z.l[j]){
                        for(y=k+1;y<(j-k-1);y++)
                        {
                            if(Z.l[j-y]<Z.l[j-k]){
                                if(Z.l[j-y]>=stopp){
                                       
                                    stopp = Z.l[j-y];
                                    encontrado = 1
                                    //console.log(stopp)
                                        
                                }
                                break;       
                            }
                        }
                    }
                    if(encontrado==1){
                        break;
                    }
                }
                        
            }
        }    
    }

    if(side==1){
        
        for(j=0;j<Z.lt.length;j++){
            encontrado = 0;
            if(Z.l[j]<lowest&&Z.lt[j]>=tiempoEntrada){
                lowest = Z.l[j];
                for(k=1;k<(j-1);k++)
                {
                    if(Z.h[j-k]>Z.h[j-1]){
                        for(y=k+1;y<(j-k-1);y++)
                        {
                            if(Z.h[j-y]>Z.h[j-k]){
                                
                                if(Z.h[j-y]<=stopp){
                                    
                                    stopp = Z.h[j-y];
                                    encontrado = 1;
                                    //console.log(stopp)
                                }
                                break;
                            }
                               
                        }
                    }
                    if(encontrado==1){
                        
                        break;
                    }
                }
                
            }    
        }
    }
    
resolve(stopp);
    })
    
return promise
}




// zigzag(1,'BTCUSDT','15m',1611274500000,10,2,1).then(msg =>{
//     console.log(msg);   
// })

module.exports ={
    zigzag
}