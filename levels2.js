// token discord MTAwOTE4MTM1NzExNDY2Mjk5Mg.GHe-Js.lhHcAdFYoXWXeK3zXBav4yRVqYjOzpzXfwWkeQ
const csv = require('csv-parser');
const fs = require('fs');
const plotly = require('plotly')('enrique.mompean','tqazyUxtdWyZM5Xqn8Vk')
const token  = "MTAwOTE4MTM1NzExNDY2Mjk5Mg.GHe-Js.lhHcAdFYoXWXeK3zXBav4yRVqYjOzpzXfwWkeQ"
const clientId = "1009181357114662992"
const guildId = "573595419855290370"
const { Client, GatewayIntentBits } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});
const Influx = require('influx');
const influx = new Influx.InfluxDB({
    host: '192.168.1.40',
    database: 'levels',
    port: 8086,
    schema: [
      {
        measurement: 'levels',
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
const ohcl = require('./ohclv.js');
const { resolve } = require('path');

// ohcl(3,'BTC/USD','4h',300)



let zz = {
    price: [],
    time: [],
    state: [],
    activo: [],
    UTDate: [],
    validationDate: [],
    timeframe: []
};

let zh = {
    price: [],
    time: [],
    state: [],
    activo: [],
    UTDate: [],
    validationDate: [],
    timeframe: [],
    high: 1
};

let zl = {
    price: [],
    time: [],
    state: [],
    activo: [],
    UTDate: [],
    validationDate: [],
    timeframe: [],
    high: 0

};


async function main(par,timeframe,range){
    let promise;
    let nivelesValidos =0
    let pruebas =0;
    let nivelesTesteados =0
    let PorcentajesTesting = []
    zz = {
        price: [],
        time: [],
        state: [],
        activo: [],
        UTDate: [],
        validationDate: [],
        timeframe: []
    };
    const Rojo = 'red';             //Mensual
    const Naranja = 'orange';       //Semanal
    const Amarillo = 'yellow';      //Diario
    const Verde = 'green';          //4 Horas
    const Azul = 'blue';            //1 Hora
    const Gris = '#D2D2D2'
    const GrisClaro = '#F9F9F9';
    const Lila = 'purple';
    const Marron = 'brown'
    let colores = [];
    colores['M'] = Rojo;
    colores['1w'] = Naranja;
    colores['1d'] = Amarillo;
    colores['4h'] = Verde;
    colores['1h'] = Azul;
    colores['15m'] = Marron
    
    PorcentajesTesting['1w'] = 1/100;
    PorcentajesTesting['1d'] = 0.7/100;
    PorcentajesTesting['4h'] = 0.5/100;
    PorcentajesTesting['1h'] = 0.5/100;
    PorcentajesTesting['15m'] = 0.05/100;
    PorcentajesTesting['1m'] = 0.025/100;
    
    let ventanas = []
    ventanas['1m'] = (60)*10**9;
    ventanas['3m'] = (3*60)*10**9;
    ventanas['15m'] = (15*60)*10**9;
    ventanas['30m'] = (30*60)*10**9;
    ventanas['1h'] = (60*60)*10**9;
    ventanas['4h'] = (4*60*60)*10**9;
    ventanas['1d'] = (24*60*60)*10**9;
    ventanas['1w'] = (7*24*60*60)*10**9;
    ventanas['1M'] = (30*24*60*60)*10**9;
    id_exchange = 2
    exchangeName = 'Ftx'
    symbol = par
    await ohcl.ohcl(id_exchange,symbol)
    datos = await lecturaGeneral(exchangeName,symbol)
    console.log(datos)
    niveles = await EncontrarNiveles(exchangeName,symbol)
    for(let i = 0; i<niveles.length;i++){
        for(let j = datos.x.indexOf(datos.x.find(element => element == niveles[i].time)); j < datos.x.length; j++){
            //pruebas +=1
            if(niveles[i].high == 1){
                if(niveles[i].TimeFrame == datos.TimeFrame[j] && datos.x[j] > niveles[i].time && datos.Op[j]<= niveles[i].price && datos.Cl[j] >= niveles[i].price){
                    niveles[i].state = 'untested'
                    niveles[i].activo = 1
                    niveles[i].validationDate = datos.x[j]
                    //console.log(niveles[i])
                    nivelesValidos+=1
                    break;
                }
            }
            //
            else{
                if(niveles[i].TimeFrame == datos.TimeFrame[j] && datos.x[j] > niveles[i].time && datos.Cl[j]<= niveles[i].price && datos.Op[j] >= niveles[i].price){
                    niveles[i].state = 'untested'
                    niveles[i].activo = 1
                    niveles[i].validationDate = datos.x[j]
                    //console.log(niveles[i])
                    nivelesValidos+=1
                    break;
                }
            }
            // if(datos.x[j]<niveles[i].time){
            //     console.log('No encontrado en ',pruebas)
            //     pruebas=0
            //     break;
            // }
        }
    }
    console.log('Untested',nivelesValidos)
    pruebas =0
    for(let k = 0; k < niveles.length; k++){
        //console.log('Comprobando nivel n',pruebas +=1)
        let iteraciones = 0;
        let TimeFramesTesteo = [];
        let ValidacionTimeFrame = [];
        ValidacionTimeFrame['1w'] = 0;
        ValidacionTimeFrame['1d'] = 0;
        ValidacionTimeFrame['4h'] = 0;
        ValidacionTimeFrame['1h'] = 0;
        ValidacionTimeFrame['15m'] = 0;
        ValidacionTimeFrame['1m'] = 0;
        if(niveles[k].activo ==1){
            for(let z = datos.x.indexOf(datos.x.find(element => element == niveles[k].validationDate)) + 1;z < datos.x.length; z++){
                switch(niveles[k].TimeFrame){
                    case '1w':
                        TimeFramesTesteo['1w'] = false;
                        TimeFramesTesteo['1d'] = true;
                        TimeFramesTesteo['4h'] = true;
                        TimeFramesTesteo['1h'] = true;
                        TimeFramesTesteo['15m'] = true;
                        TimeFramesTesteo['1m'] = true;
                        
                        break;
                    case '1d':
                        TimeFramesTesteo['1w'] = false;
                        TimeFramesTesteo['1d'] = false;
                        TimeFramesTesteo['4h'] = true;
                        TimeFramesTesteo['1h'] = true;
                        TimeFramesTesteo['15m'] = true;
                        TimeFramesTesteo['1m'] = true;
                        break;
                    case '4h':
                        TimeFramesTesteo['1w'] = false;
                        TimeFramesTesteo['1d'] = false;
                        TimeFramesTesteo['4h'] = false;
                        TimeFramesTesteo['1h'] = true;
                        TimeFramesTesteo['15m'] = true;
                        TimeFramesTesteo['1m'] = true;

                        break;
                    case '1h':
                        TimeFramesTesteo['1w'] = false;
                        TimeFramesTesteo['1d'] = false;
                        TimeFramesTesteo['4h'] = false;
                        TimeFramesTesteo['1h'] = false;
                        TimeFramesTesteo['15m'] = true;
                        TimeFramesTesteo['1m'] = true;
                        break;
                    case '15m':
                        TimeFramesTesteo['1w'] = false;
                        TimeFramesTesteo['1d'] = false;
                        TimeFramesTesteo['4h'] = false;
                        TimeFramesTesteo['1h'] = false;
                        TimeFramesTesteo['15m'] = false;
                        TimeFramesTesteo['1m'] = true;
                        break;

                }
                if(datos.x[z] < (niveles[k].validationDate + ventanas[niveles[k].TimeFrame])){
                    if(niveles[k].high == 1){
                        if(TimeFramesTesteo[`${datos.TimeFrame[z]}`] == true && datos.Op[z] <= niveles[k].price && datos.Cl[z] >= niveles[k].price){
                            ValidacionTimeFrame[`${datos.TimeFrame[z]}`] = datos.x[z];
                        }
                        if(TimeFramesTesteo[`${datos.TimeFrame[z]}`] == true && datos.x[z] > ValidacionTimeFrame[`${datos.TimeFrame[z]}`] && ValidacionTimeFrame[`${datos.TimeFrame[z]}`] != 0){
                            if(datos.Low[z] <= niveles[k].price*(1+PorcentajesTesting[datos.TimeFrame[z]])){
                                niveles[k].state = 'tested'
                                niveles[k].UTDate = datos.x[z]
                                niveles[k].TestedEn = datos.TimeFrame[z]
                                nivelesTesteados +=1
                                break;
                            }
                        }
                    }
                    else{
                        if(TimeFramesTesteo[`${datos.TimeFrame[z]}`] == true && datos.Cl[z] <= niveles[k].price && datos.Op[z] >= niveles[k].price){
                            ValidacionTimeFrame[`${datos.TimeFrame[z]}`] = datos.x[z];
                        }
                        if(TimeFramesTesteo[`${datos.TimeFrame[z]}`] == true && datos.x[z] > ValidacionTimeFrame[`${datos.TimeFrame[z]}`] && ValidacionTimeFrame[`${datos.TimeFrame[z]}`] != 0){
                            if(datos.High[z] >= niveles[k].price*(1-PorcentajesTesting[datos.TimeFrame[z]])){
                                niveles[k].state = 'tested'
                                niveles[k].UTDate = datos.x[z]
                                niveles[k].TestedEn = datos.TimeFrame[z]
                                nivelesTesteados +=1
                                break;
                            }
                        }
                    }
                }
                
                else{
                    if(niveles[k].high == 1){
                        if(datos.Low[z] <= niveles[k].price*(1+PorcentajesTesting[datos.TimeFrame[z]])){
                            niveles[k].state = 'tested'
                            niveles[k].UTDate = datos.x[z]
                            niveles[k].TestedEn = datos.TimeFrame[z]
                            nivelesTesteados +=1
                            break;
                        }
                    }
                
                    else{
                        if(datos.High[z] >= niveles[k].price*(1-PorcentajesTesting[datos.TimeFrame[z]])){
                            niveles[k].state = 'tested'
                            niveles[k].UTDate = datos.x[z]
                            niveles[k].TestedEn = datos.TimeFrame[z]
                            nivelesTesteados +=1
                            break;
                        }
                    }
                }
                
                
            }
            iteraciones +=1;
        }
        //if(iteraciones == 0) console.log(' Validacion testeando level, revisar')
    }
    console.log('Levels Testeados ', nivelesTesteados)
    
    velas = await ohcl.lecturaUnica(id_exchange,symbol,'1h')
    trace1 = {
      
        x: velas.x, 
        
        close: velas.Cl, 
        
        decreasing: {line: {color: 'r'}}, 
        
        high: velas.High, 
        
        increasing: {line: {color: 'g'}}, 
        
        line: {color: 'rgba(31,119,180,1)'}, 
        
        low: velas.Low, 
        
        open: velas.Op, 
        
        type: 'candlestick', 
        xaxis: 'x', 
        yaxis: 'y'
    };
    for(let w =0; w < velas.x.length; w++){
        if(velas.zz[w]!=0){
            zz.time.push(velas.x[w])
            zz.price.push(velas.zz[w])
        }
    }
    var trace2 = { 
        x:zz.time,
        y:zz.price,
        type: 'scatter',
        mode:'lines',
        line:{
            shape:'linear',
            color:Lila
        }
    }
    var data = [trace1,trace2];
    for(let a = 0; a<niveles.length; a++){
        if(timeframe === 'all'){
            if(niveles[a].state === 'untested'){
                console.log(niveles[a])
                var level = { 
                    x:[niveles[a].time, niveles[a].validationDate,velas.x[velas.x.length-1]],
                    y:[niveles[a].price,niveles[a].price,niveles[a].price],
                    type: 'scatter',
                    mode:'lines',
                    line:{
                        shape:'linear',
                        color:niveles[a].color
                    }
                }
                data.push(level)
            }
        }
        else{
            if(niveles[a].TimeFrame === timeframe){
                if(niveles[a].state === 'untested'){
                    console.log(niveles[a])
                    var level = { 
                        x:[niveles[a].time, niveles[a].validationDate,velas.x[velas.x.length-1]],
                        y:[niveles[a].price,niveles[a].price,niveles[a].price],
                        type: 'scatter',
                        mode:'lines',
                        line:{
                            shape:'linear',
                            color:niveles[a].color
                        }
                    }
                    data.push(level)
                }
            }
        }
    }
    var layout = {
        fileopt : "overwrite", 
        filename : (symbol.replace('-','')).replace('/',''),
        dragmode: 'zoom',
        showlegend: false,
        xaxis: {
            title: 'Date',
            autorange: true,
            rangeslider: {
                 visible: 'ME CAGO EN TUS MUERTOS'

             }
        },
        yaxis: {
            autorange: true
            
        }
    };

    
    let url;
    promise = new Promise((resolve,reject) =>{
        plotly.plot(data, layout, function (err, msg) {
            if (err) return console.log(err);
            console.log(msg.url);
            url = msg.url;
            console.log(url);
            console.log(timeframe)
            resolve(url);
            
        });
    })
    return promise;

}
async function EncontrarNiveles(exchangeName,symbol){
    let niveles = []
    const Rojo = 'red';             //Mensual
    const Naranja = 'orange';       //Semanal
    const Amarillo = 'yellow';      //Diario
    const Verde = 'green';          //4 Horas
    const Azul = 'blue';            //1 Hora
    const Gris = '#D2D2D2'
    const GrisClaro = '#F9F9F9';
    const Lila = 'purple';
    const Marron = 'brown'
    let colores = [];
    let trace1;
    colores['M'] = Rojo;
    colores['1w'] = Naranja;
    colores['1d'] = Amarillo;
    colores['4h'] = Verde;
    colores['1h'] = Azul;
    colores['15m'] = Marron
    //console.log('385')
    let promise = new Promise((resolve,reject) =>{
        influx.query(`select * from ${exchangeName}${(symbol.replace('-','')).replace('/','')} where "TimeFrame" != '1m' `).then(result =>{
            for(let k = 0;k < result.length; k++){
                if(result[k].zz !=0){
                    if(result[k].h != 0){
                        niveles.push({
                            price: result[k].h,
                            time: Number(result[k].time.getNanoTime()),
                            state: 'tested',
                            activo: 0,
                            UTDate: 0,
                            validationDate: 0,
                            TimeFrame: result[k].TimeFrame,
                            color: colores[result[k].TimeFrame],
                            high: 1
                        })
                    }
                    else{
                        if(result[k].l !=0){
                            niveles.push({
                                price: result[k].l,
                                time: Number(result[k].time.getNanoTime()),
                                state: 'tested',
                                activo: 0,
                                UTDate: 0,
                                validationDate: 0,
                                TimeFrame: result[k].TimeFrame,
                                color: colores[result[k].TimeFrame],
                                high: 0
                            })
                        }
                    }
                }
            }
            console.log('Numero de niveles',niveles.length)
        
        
            resolve(niveles)
        })
    })
        
    return promise
}

async function lecturaGeneral(exchangeName,symbol){
    let datos = {
        x: [],
        Op: [],
        Cl: [],
        High: [],
        Low: [],
        zz:[],
        h: [],
        l: [],
        TimeFrame:[]
    }
    let promise = new Promise((resolve,reject) =>{
        influx.query(`select * from ${exchangeName}${(symbol.replace('-','')).replace('/','')}`).then(result =>{
            for(let i = 0; i<result.length;i++){
                datos.x.push(Number(result[i].time.getNanoTime()))
                datos.Op.push(Number(result[i].Op))
                datos.Cl.push(Number(result[i].Cl))
                datos.High.push(Number(result[i].High))
                datos.Low.push(Number(result[i].Low))
                datos.zz.push(Number(result[i].zz))
                datos.h.push(Number(result[i].h))
                datos.l.push(Number(result[i].l))
                datos.TimeFrame.push(result[i].TimeFrame)
            }
            resolve(datos)
        })
        
    })
    return promise;
}
async function levels(){
    let id_exchange = 2;
    let exchangeName = 'Ftx'
    let symbol = 'BTC-PERP';
    let timeframe = '1M';
    let limit = 600;
    let niveles = []

    //x,Op,High,Cl,Low,ZigZag,h,l
    const Rojo = 'red';             //Mensual
    const Naranja = 'orange';       //Semanal
    const Amarillo = 'yellow';      //Diario
    const Verde = 'green';          //4 Horas
    const Azul = 'blue';            //1 Hora
    const Gris = '#D2D2D2'
    const GrisClaro = '#F9F9F9';
    const Lila = 'purple';
    const Marron = 'brown'
    let colores = [];
    let trace1;
    colores['M'] = Rojo;
    colores['1w'] = Naranja;
    colores['1d'] = Amarillo;
    colores['4h'] = Verde;
    colores['1h'] = Azul;
    colores['15m'] = Marron;
    
    influx = new Influx.InfluxDB({
        host: 'localhost',
        database: 'levels',
        port: 8086,
        schema: [
          {
            measurement: `${exchangeName}${(symbol.replace('-','')).replace('/','')}levels`,
            fields: {
               price: Influx.FieldType.FLOAT,
               activo: Influx.FieldType.INTEGER,
               UTDate: Influx.FieldType.INTEGER,
               validationDate: Influx.FieldType.INTEGER,
       
                 },
            tags: [ 'TimeFrame','Color','State'
              
            ],
          }
        ]
    })
    await ohcl.ohcl(id_exchange,symbol)
    // await leerCsv(`./datosLevels/${exchangeName}${symbol.replace('/','-')}${timeframe}.csv`).then(()=>{
    //     
    // });
    await ohcl.lecturaUnica(id_exchange,symbol,'1h').then((msg) =>{
        
        trace1 = {
      
            x: msg.x, 
            
            close: msg.Cl, 
            
            decreasing: {line: {color: 'r'}}, 
            
            high: msg.high, 
            
            increasing: {line: {color: 'g'}}, 
            
            line: {color: 'rgba(31,119,180,1)'}, 
            
            low: msg.low, 
            
            open: msg.Op, 
            
            type: 'candlestick', 
            xaxis: 'x', 
            yaxis: 'y'
          };
        // var trace2 = { 
        //     x:zz.time,
        //     y:zz.price,
        //     type: 'scatter',
        //     mode:'lines',
        //     line:{
        //         shape:'linear',
        //         color:Lila
        //     }
        
        
    })
    
    
    await EncontrarNiveles(exchangeName,symbol).then(niveles =>{
        console.log('144',niveles.length)
        ComprobarValidacion(exchangeName,symbol,niveles).then(Niveles =>{
            console.log('146',Niveles.length)
            ComprobarTested(exchangeName,symbol,Niveles).then(msg =>{
                //console.log(msg)
            })
        })
        
    })
    
    

    
    var data = [trace1];
    var layout = {
        fileopt : "overwrite", 
        filename : "simple-node-example2",
        dragmode: 'zoom',
        showlegend: false,
        xaxis: {
            title: 'Date',
            autorange: true,
            rangeslider: {
                 visible: 'ME CAGO EN TUS MUERTOS'

             }
        },
        yaxis: {
            autorange: true
            
        }
    };

    
    
    plotly.plot(data, layout, function (err, msg) {
        if (err) return console.log(err);
        console.log(msg);
        
    });
}
//     for(let i=0;i<datos.x.length;i++){
//         if(datos.zz[i] !=0){
//             zz.price.push(datos.ZigZag[i])
//             zz.time.push(datos.x[i])
//             zz.state.push('tested')
//             zz.activo.push(0)
//             zz.UTDate.push(0)
//             zz.validationDate.push(0)

//         }
//         if(datos.h[i] !=0){
//             zh.price.push(datos.h[i])
//             zh.time.push(datos.x[i])
//             zh.state.push('tested')
//             zh.activo.push(0)
//             zh.UTDate.push(0)
//             zh.validationDate.push(0)

//         }
//         if(datos.l[i] !=0){
//             zl.price.push(datos.l[i])
//             zl.time.push(datos.x[i])
//             zl.state.push('tested')
//             zl.activo.push(0)
//             zl.UTDate.push(0)
//             zl.validationDate.push(0)
//         }
//     }

    
    
    
//     data.push(trace2);
//     for(let i=0;i<zh.price.length;i++){ //Comprobamos si los levels han sido untested en algun momento
//         let encontrado =0
//         for(let j=0;j<datos.x.length;j++){
//             if(encontrado==0)
//             {    if(datos.x[datos.x.length-1-j]>zh.time[i]){
//                     if(zh.price[i]>= datos.Op[datos.x.length-1-j] && zh.price[i]<= datos.Cl[datos.x.length-1-j]){
//                         encontrado=1
//                         zh.state[i]='untested'
//                         zh.activo[i]=1
//                         zh.validationDate[i] = datos.x[datos.x.length -1 -j]
//                         zh.UTDate[i] = datos.x[datos.x.length-1-j]
//                         break;
//                     }
//                 }
//             }

//         }
//         if(encontrado==1){
            
//             await prueba(i,zh)
//             
//             if(zh.activo[i] == 1){
//                 if(zh.state[i] === 'untested'){
//                     var level = { 
//                         x:[zh.time[i], zh.validationDate[i],datos.x[datos.x.length-1]],
//                         y:[zh.price[i],zh.price[i],zh.price[i]],
//                         type: 'scatter',
//                         mode:'lines',
//                         line:{
//                             shape:'linear',
//                             color:Verde
//                         }
//                     }
//                     data.push(level)
//                     
//                 }
//                 if(zh.state[i] === 'tested'){
//                     var level = { 
//                         x:[zh.time[i],zh.validationDate[i],zh.UTDate[i]],
//                         y:[zh.price[i],zh.price[i],zh.price[i]],
//                         type: 'scatter',
//                         mode:'lines',
//                         line:{
//                             shape:'linear',
//                             color:Rojo
//                         }
//                     }
//                     
//                     data.push(level)
//                 }
//             }
//         }
        
        


//     }

//     for(let i=0;i<zl.price.length;i++){ //Comprobamos si los levels han sido untested en algun momento
//         let encontrado =0
//         for(let j=0;j<datos.x.length;j++){
//             if(encontrado==0)
//             {    if(datos.x[datos.x.length-1-j]>zl.time[i]){
//                     if(zl.price[i]>= datos.Cl[datos.x.length-1-j] && zl.price[i]<= datos.Op[datos.x.length-1-j]){
//                         encontrado=1
//                         zl.state[i]='untested'
//                         zl.activo[i]=1
//                         zl.validationDate[i] = datos.x[datos.x.length -1 -j]
//                         zl.UTDate[i] = datos.x[datos.x.length-1-j]
//                         break;
//                     }
//                 }
//             }

//         }
//         if(encontrado==1){
            
//             await prueba(i,zl)
//             
//             if(zl.activo[i] == 1){
//                 if(zl.state[i] === 'untested'){
//                     var level = { 
//                         x:[zl.time[i], zl.validationDate[i],datos.x[datos.x.length-1]],
//                         y:[zl.price[i],zl.price[i],zl.price[i]],
//                         type: 'scatter',
//                         mode:'lines',
//                         line:{
//                             shape:'linear',
//                             color:Azul
//                         }
//                     }
//                     data.push(level)
//                     
//                 }
//                 if(zl.state[i] === 'tested'){
//                     var level = { 
//                         x:[zl.time[i],zl.validationDate[i],zl.UTDate[i]],
//                         y:[zl.price[i],zl.price[i],zl.price[i]],
//                         type: 'scatter',
//                         mode:'lines',
//                         line:{
//                             shape:'linear',
//                             color:Naranja
//                         }
//                     }
//                     
//                     data.push(level)
//                 }
//             }
//         }
        
        


//     }

    
//     
    





function prueba(k,z){
    if(z.high == 1){
        for(let j=0;j<datos.x.length;j++){
            if(datos.x[j]>z.validationDate[k]){
                if(z.price[k]<=datos.low[j]*1.001 && z.price[k]>=datos.low[j]*0.999 || z.price[k]> datos.Cl[j] && z.price[k]< datos.Op[j]){
                    z.state[k] = 'tested'
                    z.UTDate[k] = datos.x[j]
                    
                }
                
                
            }
            if(j==datos.x.length -1 && z.state === 'untested'){
                z.UTDate[k] = datos.x[datos.x.length-1]
            }
        }
    }
    else{
        for(let j=0;j<datos.x.length;j++){
            if(datos.x[j]>z.validationDate[k]){
                if(z.price[k]<=datos.high[j]*1.001 && z.price[k]>=datos.high[j]*0.999 || z.price[k]> datos.Op[j] && z.price[k]< datos.Cl[j]){
                    z.state[k] = 'tested'
                    z.UTDate[k] = datos.x[j]
                    
                }
                
                
            }
            if(j==datos.x.length -1 && z.state === 'untested'){
                z.UTDate[k] = datos.x[datos.x.length-1]
            }
        }
    }
    // for(let j=0;j<df.length;j++){
    //     if(df['x'][j]>z.validationDate[k]){
            
    //         if(df['Op'][j]<df['Cl'][j]){ //Vela Verde
    //             
    //             if(z.price[k]<=df['High'][j]*1.001 && z.price[k]>df['Cl'][j]*1.001 || z.price[k]<df['Op'][j]*0.999 && z.price[k]>=df['Low'][j]*0.999){
    //                 z.state[k] = 'tested'
    //                 z.UTDate[k] = df['x'][j]
    //                 
    //             }
    //         }
    //         else{
    //         if(df['Op'][j]>df['Cl'][j]){ // Vela Roja
    //             
    //             if(z.price[k]<=df['High'][j]*1.001&&z.price[k]>df['Op'][j]*1.001 || z.price[k]<df['Cl'][j]*0.999 && z.price[k]>=df['Low'][j]*0.999){
    //                 z.state[k] = 'tested'
    //                 z.UTDate[k] = df['x'][j]
    //              
    //             } 
    //         }
    //         else{
    //             
    //         }
    //         }
    //     }
    //     if(j==df.length-1 && z.state === 'untested'){
    //         z.UTDate[k] = df['x'][df.length-1]
    //     }
    // }
    
    return 0;
}

async function CompletarTablas(){

}

async function leerCsv(path){
    let promise = new Promise((resolve, reject) => {
        fs.createReadStream(path)
            .pipe(csv())
            .on('data', (row) => {
                datos.x.push(Number(row.x))
                datos.Op.push(Number(row.Op))
                datos.Cl.push(Number(row.Cl))
                datos.high.push(Number(row.High))
                datos.low.push(Number(row.Low))
                datos.ZigZag.push(Number(row.ZigZag))
                datos.h.push(Number(row.h))
                datos.l.push(Number(row.l))
                
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                
                resolve(0)
            });
    })
    return promise    
}
// let promise = new Promise((resolve, reject) => {
//     binaSA.futuresMarkPrice().then(msg =>{
//         resolve(msg)
//         })
//     })
//     return promise

//main()

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
    //console.log(interaction.options.getString('input'))
	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	} else if (commandName === 'user') {
		await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
	}  else if (commandName === 'suma') {
        n1 = interaction.options.getInteger('n1');
        n2 = interaction.options.getInteger('n2');
        await interaction.reply(`La suma de ${n1} y ${n2} es ${n1+n2}`)
	}  else if (commandName === 'levels'){
        par = interaction.options.getString('par');
        range = interaction.options.getNumber('range');
        timeframe = interaction.options.getString('timeframe');
        console.log(par,range,timeframe)
        interaction.deferReply();
        await main(par,timeframe,range).then(msg =>{
            console.log(msg);
            interaction.editReply(`La grafica esta lista \n ${msg}`);
        });
        
    }
    
});

// Login to Discord with your client's token
client.login(token);
