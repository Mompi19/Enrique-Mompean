// IMPORTANTE: largo paga si funging positivo, corto paga si negativo (Beneficio largo = Total - FundingMedio * Tiempo, Beneficio corto = Total + FundingMedio * Tiempo)

const Influx = require('influx');
const influx = new Influx.InfluxDB({
    host: '192.168.100.29',
    database: 'cashncarry',
    port: 8086,
    schema: [
      {
        measurement: '',
        fields: {
           Op: Influx.FieldType.FLOAT,
           Cl: Influx.FieldType.FLOAT,
           High: Influx.FieldType.FLOAT,
           Low: Influx.FieldType.FLOAT,
           zz: Influx.FieldType.FLOAT,
   
             },
        tags: [
          
        ],
      }
    ]
})
const FTXRest = require('ftx-api-rest');
const ftxws = require('ftx-api-ws');
const { json } = require('express');
const credenciales = {
    key: 'FoRvzocq2DEk2JX--H0IJ8RYroqFGWJt0sq03Dh-',
    secret: 'QDMX2azqcOc_gzEIOCb4tzjTQyRJ6Mzm4Omsnp4A',
    //subaccount:'star atlas
}
const ftx = new FTXRest(credenciales)
const ws  = new ftxws(credenciales)
const wsTicker  = new ftxws(credenciales)
// wsTicker.connect().then(async msg =>{
//     //console.log(wsTicker);
//     wsTicker.subscribe('trades','BTC-PERP');
//     wsTicker.on(`BTC-PERP::trades`,(element)=> {
//     console.log(element)
    
// })
// })
data = []
let Monedas = ['BTC','ADA','APE','ATOM','EOS','ETH','BCH','DOT','BNB','DOGE','LINK','LTC','TRX','XRP','MATIC','COMP','SOL','SUSHI','UNI','AAVE','CHZ','WAVES','1INCH']
Futures = []
let Pares = []
//Get Futures

//Funding rates


async function getFunding(){
  ftx.request({
    method: 'GET',
    path: '/funding_rates'
  }).then(msg =>{
    // console.log(msg)
    msg.result.forEach(element => {
      if(Pares[`${element.future.replace('-PERP','')}`] != undefined){
        Pares[`${element.future.replace('-PERP','')}`].lastFunding = element.rate
      }
      
    })
    //console.log(Pares)
  })
}



async function main(){
  await wsTicker.connect().then(async msg =>{
    //console.log(wsTicker); 
  })
  await ftx.request({
    method:'GET',
    path:'/futures'
  }).then(msg =>{
    // console.log(msg)
    msg.result.forEach(element => {
      
      if(element.type === 'future' && Monedas.includes(element.underlying)){
        //console.log(element)
        Futures[`${element.name}`] = {
          name: element.name,
          underlying: element.underlying,
          expiry: Number(new Date(element.expiry))
        }
      }
    });
    // console.log(Futures)
    // console.log(Object.keys(Futures))
    for(let i in Monedas){
      Pares[`${Monedas[i]}`] = {
        moneda: `${Monedas[i]}`,
        perpetual: `${Monedas[i]+ '-PERP'}`,
        futures:[],
        lastFunding: 0,
        lastPriceAsk: 0,
        lastPriceBid: 0,
  
      }
      if(Futures[`${Monedas[i]+'-1230'}`] != undefined)  Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-1230'}`] ={ priceAsk:0, priceBid:0,expiry: Futures[`${Monedas[i]+'-1230'}`].expiry,diferenciaAsk:0 ,diferenciaBid:0,Tte:0};
      if(Futures[`${Monedas[i]+'-0331'}`] != undefined)  Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-0331'}`] ={ priceAsk:0, priceBid:0,expiry: Futures[`${Monedas[i]+'-0331'}`].expiry,diferenciaAsk:0 ,diferenciaBid:0,Tte:0};
    }
    console.log(Pares)
    getFunding()
    for(let j in Monedas){
      webSocketTicker(`${Monedas[j]}-PERP`);
      if(Futures[`${Monedas[j]+'-1230'}`] != undefined) webSocketTicker(`${Monedas[j]+'-1230'}`);
      if(Futures[`${Monedas[j]+'-0331'}`] != undefined) webSocketTicker(`${Monedas[j]+'-0331'}`);
      
    }
    // console.log(Pares)
  })
  setInterval(getFunding, 10000);
  setInterval(escribirdatos, 60000);
}
async function webSocketTicker(par){
  console.log('Ws abierto para ',par)
  wsTicker.subscribe('ticker',par);
  wsTicker.on(`${par}::ticker`,(element)=> {
    // console.log(element[0],par)
    // console.log()
    if(par.includes('-PERP')){
      Pares[`${par.replace('-PERP','')}`].lastPriceAsk = element.ask;
      Pares[`${par.replace('-PERP','')}`].lastPriceBid = element.bid;
    }else{
      //console.log(par,(Pares[`${par.replace('-1230','').replace('-0331','')}`].lastPrice - element[0].price)/element[0].price*100,Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].diferencia)
      if(Math.abs((Pares[`${par.replace('-1230','').replace('-0331','')}`].lastPriceAsk - element.ask)/element.ask*100)> Math.abs(Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].diferenciaAsk)){
        console.log('Ask',par,(Pares[`${par.replace('-1230','').replace('-0331','')}`].lastPriceAsk - element.ask)/element.ask*100,Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].diferenciaAsk)
        Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].priceAsk = element.ask
        Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].diferenciaAsk = (Pares[`${par.replace('-1230','').replace('-0331','')}`].lastPriceAsk - element.ask)/element.ask*100
        Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].Tte = Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].expiry -Number( new Date().getTime())
        Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].DifHoraAsk = (Pares[`${par.replace('-1230','').replace('-0331','')}`].lastPriceAsk - element.ask)/element.ask*100/(Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].expiry - Number(new Date().getTime()))*3600000*24*365
      }
      if(Math.abs((Pares[`${par.replace('-1230','').replace('-0331','')}`].lastPriceBid - element.bid)/element.bid*100)> Math.abs(Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].diferenciaBid)){
        console.log('Bid',par,(Pares[`${par.replace('-1230','').replace('-0331','')}`].lastPriceBid - element.bid)/element.bid*100,Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].diferenciaBid)
        Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].priceBid = element.bid
        Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].diferenciaBid = (Pares[`${par.replace('-1230','').replace('-0331','')}`].lastPriceBid - element.bid)/element.bid*100
        Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].Tte = Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].expiry -Number( new Date().getTime())
        Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].DifHoraBid = (Pares[`${par.replace('-1230','').replace('-0331','')}`].lastPriceBid - element.bid)/element.bid*100/(Pares[`${par.replace('-1230','').replace('-0331','')}`].futures[`${par}`].expiry - Number(new Date().getTime()))*3600000*24*365
      }
    }
  
  });
}
main()

async function escribirdatos(){
  for(let i in Monedas){
    if(Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-1230'}`] != undefined && (Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-1230'}`].priceAsk != 0 || Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-1230'}`].priceBid != 0 ) && (Math.abs(Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-1230'}`].diferenciaAsk) != 100 || Math.abs(Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-1230'}`].diferenciaBid) != 100)){
      console.log('LLamada a escribir datos')
      data.push(
        {
          measurement: 'diferenciasAskBid',
          tags: {
            FutureName: `Ftx${Monedas[i]+'1230'}`,
          },
          fields: { 
            PerpAsk: Pares[`${Monedas[i]}`].lastPriceAsk,
            PerpBid: Pares[`${Monedas[i]}`].lastPriceBid,
            FuturePriceAsk: Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-1230'}`].priceAsk,
            FuturePriceBid: Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-1230'}`].priceBid,
            diferenciaAsk: Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-1230'}`].diferenciaAsk,
            DiferenciaBid: Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-1230'}`].diferenciaBid,
            Funding: Pares[`${Monedas[i]}`].lastFunding,
            TTE: Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-1230'}`].Tte,
            DifHoraAsk: Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-1230'}`].DifHoraAsk,
            DifHoraBid: Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-1230'}`].DifHoraBid,

            },
                
          timestamp: new Date().getTime(),
        }
      )
    }
    if(Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-0331'}`] != undefined && (Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-0331'}`].priceAsk != 0 || Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-0331'}`].priceBid != 0 ) && (Math.abs(Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-0331'}`].diferenciaAsk) != 100 || Math.abs(Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-0331'}`].diferenciaBid) != 100)){
      data.push(
        {
          measurement: 'diferenciasAskBid',
          tags: {
            FutureName: `Ftx${Monedas[i]+'0331'}`,
          },
          fields: { 
            PerpAsk: Pares[`${Monedas[i]}`].lastPriceAsk,
            PerpBid: Pares[`${Monedas[i]}`].lastPriceBid,
            FuturePriceAsk: Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-0331'}`].priceAsk,
            FuturePriceBid: Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-0331'}`].priceBid,
            diferenciaAsk: Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-0331'}`].diferenciaAsk,
            DiferenciaBid: Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-0331'}`].diferenciaBid,
            Funding: Pares[`${Monedas[i]}`].lastFunding,
            TTE: Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-0331'}`].Tte,
            DifHoraAsk: Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-0331'}`].DifHoraAsk,
            DifHoraBid: Pares[`${Monedas[i]}`].futures[`${Monedas[i]+'-0331'}`].DifHoraBid,
            },
                
          timestamp: new Date().getTime(),
        }
      )
    }
    
    
  }
  console.log(data);
  await influx.writePoints(data,{
    database: 'cashncarry',
    precision: 'ms',
  }).then(() => {
    data = []
    for(let j in Monedas){
      if(Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-1230'}`] != undefined){
        Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-1230'}`].priceAsk = 0
        Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-1230'}`].priceBid = 0
        Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-1230'}`].diferenciaAsk = 0
        Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-1230'}`].diferenciaBid = 0
        Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-1230'}`].Tte = 0
        Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-1230'}`].DifHoraAsk = 0
        Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-1230'}`].DifHoraBid = 0
      }
      if(Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-0331'}`] != undefined){
        Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-0331'}`].priceAsk = 0
        Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-0331'}`].priceBid = 0
        Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-0331'}`].diferenciaAsk = 0
        Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-0331'}`].diferenciaBid = 0
        Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-0331'}`].Tte = 0
        Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-0331'}`].DifHoraAsk = 0
        Pares[`${Monedas[j]}`].futures[`${Monedas[j]+'-0331'}`].DifHoraBid = 0
      }
    }
     
  })
}