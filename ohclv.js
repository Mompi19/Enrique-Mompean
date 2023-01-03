const ta = require('ta-math')
const csv = require('csv-parser');
const fs = require('fs');
const Influx = require('influx');
const plotly = require('plotly')('enrique.mompean','tqazyUxtdWyZM5Xqn8Vk')
const binance_api_node_1 = require("binance-api-node");
const binaSA = binance_api_node_1.default()
const FTXRest = require('ftx-api-rest');
const ftxSA = new FTXRest({
    key: 'NGhBkNO66hHGVBKAfLsJgh6wt60yApfEPxSBD7tJ',
    secret: 'CZgSwEHbvBMQiTRe3u_05lYJ8kmrizihdYX_FQz2'
  
  })
const { InverseClient } = require('bybit-api');
const { InverseFuturesClient } = require('bybit-api');
const { LinearClient } = require('bybit-api');


const API_KEY = 'UIPU7fZPgzcjuGZmlI';
const PRIVATE_KEY = '9oNzAtWmvf8nV7NLpwneJHt4kyzG0ygnM4gx';
const useLivenet = true;

const InverseBybit = new InverseClient(
    API_KEY,
    PRIVATE_KEY,
    useLivenet);

const FuturesBybit = new InverseFuturesClient(
    API_KEY,
    PRIVATE_KEY,
    useLivenet);


const LinearBybit = new LinearClient(
    API_KEY,
    PRIVATE_KEY,
    useLivenet);

const request = require('request');
const { error, time } = require('console');
const e = require('cors');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
let datos={
    x:[],
    Op:[],
    Cl:[],
    High:[],
    Low:[],
    zz: [],
    h: [],
    l: []
}
let data={
    x:[],
    Op:[],
    Cl:[],
    High:[],
    Low:[],
    zz: [],
    h: [],
    l: []
}



// x,open,high,low,close,volume,zigzag,zdn,zup
// colors




async function ohcl(id_exchange,symbol){
    
    
    const Rojo = 'red';
    const Naranja = 'orange';
    const Amarillo = 'yellow';
    const Verde = 'green';
    const Azul = 'blue';
    const Gris = '#D2D2D2'
    const GrisClaro = '#F9F9F9';
    const Lila = 'purple';
    const Marron = 'brown'
    let exchangeName;
    let limit;
    Z = []
    let timeframes = ['1w','1d','4h','1h','15m','1m']
    let ventanas = []
    ventanas['1m'] = (60)
    ventanas['3m'] = (3*60)
    ventanas['15m'] = (15*60)
    ventanas['30m'] = (30*60)
    ventanas['1h'] = (60*60)
    ventanas['4h'] = (4*60*60)
    ventanas['1d'] = (24*60*60)
    ventanas['1w'] = (7*24*60*60)
    ventanas['1M'] = (30*24*60*60)
    let porcentajes = []
    porcentajes['1M'] = 0.1
    porcentajes['1w'] = 1
    porcentajes['1d'] = 10
    porcentajes['4h'] = 2
    porcentajes['1h'] = 1 //Actualizado en BTC,ADA,SOL,XRP ,BSV,EOS
    porcentajes['30m'] = 0.1
    porcentajes['15m'] = 0.5
    porcentajes['3m'] = 0.1
    porcentajes['1m'] = 0.666 //Actualizado en ADA,XRP,SOL ,BSV,EOS
    let T0 
    let nvelasi
    let peticiones
    let resto
    

    if(id_exchange == 1 || id_exchange == 3) {
        exchangeName = 'Binance'
        limit = 1500
    }
    if(id_exchange == 2) {
        exchangeName = 'Ftx'
        limit = 1500
    }
    if(id_exchange >= 4 && id_exchange <=6) {
        exchangeName = 'Bybit'
        limit = 200
    }
    influx = new Influx.InfluxDB({
        host: '192.168.1.40',
        database: 'levels',
        port: 8086,
        schema: [
          {
            measurement: `${exchangeName}${(symbol.replace('-','')).replace('/','')}`,
            fields: {
               Op: Influx.FieldType.FLOAT,
               Cl: Influx.FieldType.FLOAT,
               High: Influx.FieldType.FLOAT,
               Low: Influx.FieldType.FLOAT,
               zz: Influx.FieldType.FLOAT,
               h: Influx.FieldType.FLOAT,
               l: Influx.FieldType.FLOAT
       
                 },
            tags: [ 'TimeFrame'
              
            ],
          }
        ]
    })
    let datas = []
    
    for(t in timeframes){
        tvela = timeframes[t]
        
        console.log('Time frame actual: ',tvela)
        datos={
            x:[],
            Op:[],
            Cl:[],
            High:[],
            Low:[],
            zz: [],
            h: [],
            l: []
        }
        let datosAnexos =[]
        let Up = true
        let ndatos = 0
        await influx.query(`select * from ${exchangeName}${(symbol.replace('-','')).replace('/','')} WHERE ("TimeFrame" = '${tvela}') `).then(result =>{
            datosInflux = result;
            if(result.length > 0){
                console.log('Ultimo dato leido ', result[result.length-1].time.getNanoTime()/10**6,'de ',tvela ,'n datos: ', result.length)
                T0 = Number(result[result.length-1].time.getNanoTime())/10**9
                for(let i = result.length-1; i >= 0; i--){
                if(result[i].zz != 0){
                    if(result[i].h != 0){
                        Up = true
                        ndatos = result.length-1-i
                        
                        break;
                    }
                    else{
                        if(result[i].l !=0){
                            Up = false
                            ndatos = result.length-1-i
                            break;
                        }
                        else{
                            console.log('Error al encontrar el dato desde el que completar zigzag')
                        }
                    }
                
                }
                }
                console.log(ndatos,Up	)
                for(let j = ndatos; j>=0; j--){
                    datos.x.push(Number(result[result.length-1-j].time.getNanoTime()/10**6))
                    datos.Op.push(Number(result[result.length-1-j].Op))
                    datos.Cl.push(Number(result[result.length-1-j].Cl))
                    datos.High.push(Number(result[result.length-1-j].High))
                    datos.Low.push(Number(result[result.length-1-j].Low))
                    datos.zz.push(Number(result[result.length-1-j].zz))
                    datos.h.push(Number(result[result.length-1-j].h))
                    datos.l.push(Number(result[result.length-1-j].l))
                    result.splice(result.length -1 - j ,1)
                }
            }
            else{
                T0 = (Date.now()/1000).toFixed(0) - 200 * ventanas['1w']
            }
        })
        nvelasi = ((Date.now()/1000).toFixed(0)-T0)/(ventanas[tvela]).toFixed(0)
        console.log('Date now: ',Date.now()/1000,'T0: ',T0,'nvelasi: ',nvelasi)
        peticiones = Math.trunc(nvelasi/limit)
        resto = Math.trunc(nvelasi % limit)
        console.log('Nº de peticiones ', peticiones,'Resto ',resto)
        for(let j = 0;j <= peticiones;j++){
            if(j<peticiones){
                await Kline(id_exchange,symbol,tvela,limit,T0 + limit*ventanas[tvela]*j,T0 + limit*ventanas[tvela]*(j+1))
                console.log(`Peticion numero ${j+1} hecha entre ${T0 + limit*ventanas[tvela]*j} y ${T0 + limit*ventanas[tvela]*(j+1)}`)
            }
            else{
                if(resto !=0){
                    await Kline(id_exchange,symbol,tvela,limit,T0 + limit*ventanas[tvela]*j,T0 + limit*ventanas[tvela]*j + resto*ventanas[tvela])
                    console.log(`Peticion numero ${j+1} hecha entre ${T0 + limit*ventanas[tvela]*j} y ${T0 + limit*ventanas[tvela]*j + resto*ventanas[tvela]}`)
                }
            }
        }
        // await Kline(id_exchange,symbol,timeframe,limit)
        // console.log(datos)
        
        for(let w = 1 ; w<datos.x.length;w++){
            datos.zz.push(0)
            datos.h.push(0)
            datos.l.push(0)
        }
        
        Z = await ta.Completezigzag(datos.x,datos.High,datos.Low,porcentajes[tvela],Up);
        //console.log(Z)
        console.log('Zig zag terminado')
        for(i in Z.time){
            datos.zz[datos.x.indexOf(datos.x.find(element => element == Z.time[i]))] = Z.price[i];  
        }
        //console.log(datos.zz)
        for(i in Z.ht){
            datos.h[datos.x.indexOf(datos.x.find(element => element == Z.ht[i]))] = Z.h[i];
            
        }
        for(j in Z.lt){
            datos.l[datos.x.indexOf(datos.x.find(element => element == Z.lt[j]))]= Z.l[j];
            
        }
        //console.log(datos)
        // console.log(symbol)
        console.log('169')
        await InsertarDatos(datos,exchangeName,symbol,tvela).then(()=>{
            //return 0;
        })



        
    }
    return 0;
    
    
    


 


}

async function Kline(exchange,symbol,timeframe,limit,Ti,Tf){

    /* Lista de Exchanges
     BinanceFutures---------1
     FTX--------------------2
     BinanceSpot------------3
     BybitInversePerpetual--4
     BybitLinear------------5
     BybitInverseFutures----6
    */
    
    let interval,resta;
    console.log('Kline llamado ',exchange,symbol,timeframe,limit,Ti,Tf)
    
    
    if(exchange==1){ // Binance Futures
        await binaSA.futuresCandles({symbol,interval: timeframe,limit}).then(msg =>{
            msg.forEach(vela => {
                datos.x.push(vela.openTime)
                datos.Op.push(Number(vela.open))
                datos.Cl.push(Number(vela.close))
                datos.High.push(Number(vela.high))
                datos.Low.push(Number(vela.low))
                
            });
            // console.log(datos)
        })
    }
    
    if(exchange==2){// FTX
        if(timeframe == '1m') {
            resta = limit * (60)
            interval = 60
        }
        if(timeframe == '3m') {
            resta = limit * (3*60)
            interval = 180
        }
        if(timeframe == '5m') {
            resta = limit * (5*60)
            interval = 300
        }
        if(timeframe == '15m') {
            resta = limit * (15*60)
            interval = 900
        }
        if(timeframe == '30m') {
            resta = limit * (30*60)
            interval = 1800
        }
        if(timeframe == '1h') {
            resta = limit * (60 * 60)
            interval = 3600
        }
        if(timeframe == '4h') {
            resta = limit * (4* 60 * 60)
            interval = 14400
        }
        if(timeframe == '1d') {
            resta = limit * (24 * 60 * 60)
            interval = 86400
    
        }
        if(timeframe == '1w') {
            resta = limit * (7*24*60*60)
            interval = 604800
        }
        if(timeframe == '1M') {
            resta = 34 * (4*7*24*60*60)
            interval = 2419200
        }
    
    
        await ftxSA.request({
            method: 'GET',
            path: `/markets/${symbol}/candles?resolution=${interval}&start_time=${Ti}&end_time=${Tf}`
            }).then(msg  =>{
                //console.log(msg)
                msg.result.forEach(vela => {
                    datos.x.push(vela.time)
                    datos.Op.push(Number(vela.open))
                    datos.Cl.push(Number(vela.close))
                    datos.High.push(Number(vela.high))
                    datos.Low.push(Number(vela.low))
                    
                });
                // console.log(datos)
            })
    
    }
    
    if(exchange==3){ //Binance Spot
        await binaSA.candles({symbol,interval: timeframe,limit}).then(msg =>{
            msg.forEach(vela => {
                datos.x.push(vela.openTime)
                datos.Op.push(Number(vela.open))
                datos.Cl.push(Number(vela.close))
                datos.High.push(Number(vela.high))
                datos.Low.push(Number(vela.low))
                
            });
            // console.log(datos)
        })
    }
    if(exchange>=4&&exchange<=6){ // Bybit
        
        if(timeframe == '1m') {
            resta = limit * (60)
            interval = '1'
        }
        if(timeframe == '3m') {
            resta = limit * (3*60)
            interval = '3'
        }
        if(timeframe == '5m') {
            resta = limit * (5*60)
            interval = '5'
        }
        if(timeframe == '15m') {
            resta = limit * (15*60)
            interval = '15'
        }
        if(timeframe == '30m') {
            resta = limit * (30*60)
            interval = '30'
        }
        if(timeframe == '1h') {
            resta = limit * (60 * 60)
            interval = '60'
        }
        if(timeframe == '4h') {
            resta = limit * (4* 60 * 60)
            interval = '240'
        }
        if(timeframe == '1d') {
            resta = limit * (24 * 60 * 60)
            interval = 'D'
    
        }
        if(timeframe == '1w') {
            resta = limit * (7*24*60*60)
            interval = 'W'
        }
        if(timeframe == '1M') {
            resta = 34 * (4*7*24*60*60)
            interval = 'M'
        }
        if(exchange==4){ // Bybit Inverse Perpetual
            await InverseBybit.getKline({symbol,interval,from: (Date.now()/1000 - resta).toFixed(0),limit}).then(msg =>{
                msg.result.forEach(vela => {
                    datos.x.push(vela.open_time)
                    datos.Op.push(Number(vela.open))
                    datos.Cl.push(Number(vela.close))
                    datos.High.push(Number(vela.high))
                    datos.Low.push(Number(vela.low))
                    
                });
                // console.log(datos)
            })
        }
        if(exchange==5){ //Bybit USDT Perpetual
            await LinearBybit.getKline({symbol,interval,from: (Date.now()/1000 - resta).toFixed(0),limit}).then(msg =>{
                msg.result.forEach(vela => {
                    datos.x.push(vela.open_time)
                    datos.Op.push(Number(vela.open))
                    datos.Cl.push(Number(vela.close))
                    datos.High.push(Number(vela.high))
                    datos.Low.push(Number(vela.low))
                    
                });
                // console.log(datos)
            })
        }
        if(exchange==6){ //Bybit Inverse Futures
            await FuturesBybit.getKline({symbol,interval,from: (Date.now()/1000 - resta).toFixed(0),limit}).then(msg =>{
                msg.result.forEach(vela => {
                    datos.x.push(vela.open_time)
                    datos.Op.push(Number(vela.open))
                    datos.Cl.push(Number(vela.close))
                    datos.High.push(Number(vela.high))
                    datos.Low.push(Number(vela.low))
                    
                });
                //console.log(datos)
            })
        }
    }
    return 0
}




async function lecturaUnica(id_exchange,symbol,timeframe){
    let promise = new Promise((resolve,reject) =>{
        let exchangeName;
        const influx = new Influx.InfluxDB({
            host: '192.168.1.40',
            database: 'levels',
            port: 8086,
            schema: [
              {
                measurement: `${exchangeName}${(symbol.replace('-','')).replace('/','')}`,
                fields: {
                   Op: Influx.FieldType.FLOAT,
                   Cl: Influx.FieldType.FLOAT,
                   High: Influx.FieldType.FLOAT,
                   Low: Influx.FieldType.FLOAT,
                   zz: Influx.FieldType.FLOAT,
                   h: Influx.FieldType.FLOAT,
                   l: Influx.FieldType.FLOAT
           
                     },
                tags: [ 'TimeFrame'
                  
                ],
              }
            ]
        })
 
        if(id_exchange == 1 || id_exchange == 3) {
            exchangeName = 'Binance'
            limit = 1500
        }
        if(id_exchange == 2) {
            exchangeName = 'Ftx'
            limit = 1500
        }
        if(id_exchange >= 4 && id_exchange <=6) {
            exchangeName = 'Bybit'
            limit = 200
        }
        datos={
            x:[],
            Op:[],
            Cl:[],
            High:[],
            Low:[],
            zz: [],
            h: [],
            l: []
        }
        console.log(`select * from ${exchangeName}${(symbol.replace('-','')).replace('/','')} WHERE "TimeFrame" = ${timeframe}`)
        influx.query(`select * from ${exchangeName}${(symbol.replace('-','')).replace('/','')} WHERE ("TimeFrame" = '${timeframe}') `).then(result =>{
            //console.log(result)
            for(let i = 0; i<result.length;i++){
                datos.x.push(Number(result[i].time.getNanoTime()))
                datos.Op.push(Number(result[i].Op))
                datos.Cl.push(Number(result[i].Cl))
                datos.High.push(Number(result[i].High))
                datos.Low.push(Number(result[i].Low))
                datos.zz.push(Number(result[i].zz))
                datos.h.push(Number(result[i].h))
                datos.l.push(Number(result[i].l))
            }
            //console.log(datos)
            resolve(datos)
        })
    
       
    })
    return promise
}

async function InsertarDatos(datos,exchangeName,symbol,tvela){
    console.log('377')
    let promise = new Promise((resolve, reject) => {
        console.log('379')
        datas = []
        let data = []
        let contador = 0
        
        console.log(`Insertando datos de ${tvela}`)
        console.log(`Numero de datos de ${tvela}` ,datos.x.length)
        for(let i = 0; i<datos.x.length;i++){
            
            data.push(
                {
                  measurement: `${exchangeName}${(symbol.replace('-','')).replace('/','')}`,
                  tags: {
                    TimeFrame: tvela
                  },
                  fields: { 
                    Op: Number(datos.Op[i]),
                    Cl: Number(datos.Cl[i]),
                    High: Number(datos.High[i]),
                    Low: Number(datos.Low[i]),
                    zz: Number(datos.zz[i]),
                    h: Number(datos.h[i]),
                    l: Number(datos.l[i])
                      },
                        
                  timestamp: Number(datos.x[i]),
                })
                contador +=1
                //console.log(data.length)
            if(contador>=80000){
                console.log('425')
                datas.push(data)
                
                data = []
                contador=0
                //resolve(contador)
            }
            
              
        }
        datas.push(data)
        escribirdatos(0)
        resolve(0)

    
    })
    return promise 

}

async function escribirdatos(index){
    let promise = new Promise((resolve, reject) => {

        
            influx.writePoints(datas[index],{
                database: 'levels',
                precision: 'ms',
              }).then(() => {
                if(index<datas.length-1){
                  console.log(`Datos con indice ${index} insertados correctamente`)
                  resolve(escribirdatos(index+1))
                }
                else{
                    console.log(`Datos con indice ${index} insertados correctamente`)
                    resolve(0)
                }
                  
              })
        
        
    })
    return promise

}
let id_exchange = 2;
let exchangeName = 'Ftx'
let symbol = 'BTC-PERP';
let timeframe = '1h';
let symbols = ['AAVE-PERP','BCH-PERP','BNB-PERP','BSV-PERP','BTC-PERP','DOGE-PERP','EOS-PERP','ETH-PERP','FTT-PERP','KSM-PERP','LINK-PERP','MATIC-PERP','POLIS-PERP','SOL-PERP','SOL/USD','SUSHI-PERP','TOMO-PERP','UNI-PERP','XLM-PERP','XRP-PERP']
//let symbols = ['SOL-PERP','SOL/USD','XRP-PERP']
//let limit = 600;
//let timeframes = ['1M','1w','1d','4h','1h','15m','3m','1m']

//lecturaUnica(id_exchange,symbol,timeframe)



// console.log(Date.now())

module.exports ={
    ohcl,lecturaUnica,InsertarDatos
}


// test()

let i = 0;
async function bucleControlado(i){
    console.log('Iniciando iteracion')
    ohcl(id_exchange,symbols[i]).then(result =>{
        console.log('Iteracion terminada')
        if(i+1<symbols.length-1){
            bucleControlado(i+1)
        }
    });
}

//bucleControlado(i)