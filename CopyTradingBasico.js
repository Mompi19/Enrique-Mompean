const { OrderSide } = require('binance-api-node');
const FTXRest = require('ftx-api-rest');
const FTXWs = require('ftx-api-ws');
// const TelegramBot = require('node-telegram-bot-api');
// const telbot = new TelegramBot('1850225551:AAHnnMayAzygp71IAG4g4jABsJDJ6BiYuqM', {polling: true});



const mysql = require('mysql');

let con = mysql.createConnection({
  host: "127.0.0.1",
  port:'3306',
  user: "root",
  password: "admin",
  database: "copy_trading"
});

let  pares = []

let Fede = {
    key: 'iPqx-_wwYbB65w-VAJAjWASq-Tikiw9oP9oQd11-',
    secret: 'tm7thg870vcbo2WjtQ5PLlieWFJvo-lOVEuD-KKz',
    subaccount: 'Mango Fede',
    balance: 0,
    ordenes: [],
    stops: [],
    posiciones: [],
    monedas: []
    
  
};

let users = [
    {
        name: 'Enrique',
        key: 'd2IICGDeTMg8dU3gVC0-wfrgGvpI2UwGeOnehMvY',
        secret: '7THyfgFCWYaZYY0dYr-VxXFiDu7hWu-mESNK3701',
        balance: 0,
        ordenes: [],
        stops: [],
        posiciones: [],
        monedas: []

    },
    // {
    //     name: 'Carlos',
    //     key: 'd2IICGDeTMg8dU3gVC0-wfrgGvpI2UwGeOnehMvY',
    //     secret: '7THyfgFCWYaZYY0dYr-VxXFiDu7hWu-mESNK3701',
    //     balance: 0,
    //     ordenes: [],
    //     stops: [],
    //     posiciones: [],
    //     monedas: []

    // },
    // {
    //     name: 'Daniel Andreu',
    //     key: 'HFeiSj3Ntp0eaSakFfpk8VA6ycSGI6AeHVxrdPo0',
    //     secret: 'XCQ7VcV2TcnQKiVof54VbVUNbOWBYiRKPWSX0h-j',
    //     subaccount: 'copitrading',
    //     balance: 0,
    //     ordenes: [],
    //     stops: [],
    //     posiciones: [],
    //     monedas: []  

    // }
    ,
    {
        name: 'Kike',
        key: '_Mqt-6ADYLmEn_LkaAOOk_2OYFSJmsUGfYKt3_ef',
        secret: 'j0fGZnuMePFHIBOILSRvSIgJX-JpcthdqqbDqgqK',
        subaccount: 'Mango kike',
        balance: 0,
        ordenes: [],
        stops: [],
        posiciones: [],
        monedas: []

    }
];

async function SeguimientoOrdenes(){
    let ordenesFede = [];
    
}

  async function getBalance(user){
    if(user.subaccount == undefined){
        ftxApi = new FTXRest({
        key: user.key,
        secret: user.secret,
        
        });
    }
    else{
        ftxApi = new FTXRest({
        key: user.key,
        secret: user.secret,
        subaccount:user.subaccount
        });
    }
    let coins = [];
    let balance = 0;
    try{
        await ftxApi.request({
        method: 'GET',
        path: '/wallet/balances',
        }).then(msg => {
        //console.log(msg);
        msg.result.forEach(coin => {
            if(coin.total !=0){
            //console.log(coin);
            balance += coin.usdValue;
            }
            
        });
        
        user.balance = balance;
        //console.log(balance);
            
        
        });
    } catch(error){
        console.log(error);
    }
}

async function ActualizarBalances(){
    
    getBalance(Fede);
    users.forEach(async user => {
        getBalance(user);
    });
}

async function getOrders(user){
    if(user.subaccount == undefined){
        ftxApi = new FTXRest({
        key: user.key,
        secret: user.secret,
        
        });
    }
    else{
        ftxApi = new FTXRest({
        key: user.key,
        secret: user.secret,
        subaccount:user.subaccount
        });
    }
    let ordenes = [];
    try{
        await ftxApi.request({
        method: 'GET',
        path: '/orders',
        }).then(msg => {
        //console.log(msg);
        msg.result.forEach(order => {
            //console.log(order);
            ordenes.push(order);
        });
        user.ordenes = ordenes;
        //console.log(ordenes);
        
        
        });
    } catch(error){
        console.log(error);
    }
}

async function getStops(user){
    if(user.subaccount == undefined){
        ftxApi = new FTXRest({
        key: user.key,
        secret: user.secret,
        
        });
    }
    else{
        ftxApi = new FTXRest({
        key: user.key,
        secret: user.secret,
        subaccount:user.subaccount
        });
    }
    let stops = [];
    try{
        await ftxApi.request({
        method: 'GET',
        path: '/conditional_orders',
        }).then(msg => {
        //console.log(msg);
        msg.result.forEach(stop => {
            //console.log(stop);
            stops.push(stop);
        });
        user.stops = stops;
        //console.log(stops);
        
        
        });
    } catch(error){
        console.log(error);
    }
}

async function getPositions(user){
    if(user.subaccount == undefined){
        ftxApi = new FTXRest({
        key: user.key,
        secret: user.secret,
        
        });
    }
    else{
        ftxApi = new FTXRest({
        key: user.key,
        secret: user.secret,
        subaccount:user.subaccount
        });
    }
    let posiciones = [];
    try{
        await ftxApi.request({
        method: 'GET',
        path: '/positions',
        }).then(msg => {
        //console.log(msg);
        msg.result.forEach(position => {
            if(position.size !=0){
                posiciones.push(position);
            }
            //console.log(position);
            
        });
        user.posiciones = posiciones;
        //console.log(posiciones);
        
        
        });
    } catch(error){
        console.log(error);
    }
}

async function getBalances(user){
    if(user.subaccount == undefined){
        ftxApi = new FTXRest({
        key: user.key,
        secret: user.secret,
        
        });
    }
    else{
        ftxApi = new FTXRest({
        key: user.key,
        secret: user.secret,
        subaccount:user.subaccount
        });
    }
    let monedas = [];
    try{
        await ftxApi.request({
        method: 'GET',
        path: '/wallet/balances',
        }).then(msg => {
        //console.log(msg);
        msg.result.forEach(coin =>{
            if(coin.coin != 'USD' && coin.coin != 'USDT' && coin.total !=0){
                monedas.push(coin);
                //console.log(coin);
            }
        })
        user.monedas = monedas;
       
        
        
        });
    } catch(error){
        console.log(error);
    }
}
async function getAllBalances(){
    getBalances(Fede);
    users.forEach(async user => {
        getBalances(user);
    });
}
async function getAllOrders(){
    getOrders(Fede);
    users.forEach(async user => {
        getOrders(user);
    });
}
async function getAllStops(){
    getStops(Fede);
    users.forEach(async user => {
        getStops(user);
    });
}

async function getAllPositions(){
    getPositions(Fede);
    users.forEach(async user => {
        getPositions(user);
    });
}

async function putOrders(){
    Fede.ordenes.forEach(async order => {
        if(order.market.search('-PERP') > -1 ){
            let sidePosition;
            if(order.side === 'buy'){ sidePosition = 'sell';}
            if(order.side === 'sell'){ sidePosition = 'buy';}
            HayPosicion(Fede,order.market,sidePosition).then(PosicionFede => {

                users.forEach(async user => {
                    HayPosicion(user,order.market,sidePosition).then(PosicionUser => {
                        let coincidencia = 0;
                        for(let i = 0;i < user.ordenes.length;i++){
                            if(user.ordenes[i].market === order.market && user.ordenes[i].side === order.side && user.ordenes[i].price == order.price){
                                // console.log('Orden de fede',order)
                                // console.log('Orden de user',user.name,user.ordenes[i])
                                coincidencia = 1;
                                break;
                            }
                        }
                        if(coincidencia == 0){
                            if(PosicionFede == false && PosicionUser == false || PosicionFede == true && PosicionUser == true){
                                if(user.subaccount == undefined){
                                    ftxApi = new FTXRest({
                                    key: user.key,
                                    secret: user.secret,
                                    
                                    });
                                }
                                else{
                                    ftxApi = new FTXRest({
                                    key: user.key,
                                    secret: user.secret,
                                    subaccount:user.subaccount
                                    });
                                }
                                //console.log('Sizes y minimo' , order.size,pares[order.market].sizeIncrement);
                                if((order.size * user.balance / Fede.balance) >= pares[order.market].sizeIncrement){
                                    try{
                                        ftxApi.request({
                                            method: 'POST',
                                            path: '/orders',
                                            data: {
                                                market: order.market,
                                                side: order.side,
                                                type: order.type,
                                                size: order.size * user.balance / Fede.balance,
                                                price: order.price,
                                                reduceOnly: order.reduceOnly,
                                            }
                                        });
                                        delay(200);
                                    } catch(error){
                                        console.log(error);
                                    }
                                    console.log('Orden creada en ', user.name);
                                }
                            }
                        }
                    });
                });
            });
        }
        else if(order.market.search('/USD') > -1){
            if(order.side === 'sell'){ 
                HaySPot(Fede,order.market).then(PosicionFede => {

                    users.forEach(async user => {
                        HaySPot(user,order.market).then(PosicionUser => {
                            let coincidencia = 0;
                            for(let i = 0;i < user.ordenes.length;i++){
                                if(user.ordenes[i].market === order.market && user.ordenes[i].side === order.side && user.ordenes[i].price == order.price){
                                    console.log('Orden de user',user.name,user.ordenes[i])
                                    coincidencia = 1;
                                    break;
                                }
                            }
                            if(coincidencia == 0){
                                if(PosicionFede == false && PosicionUser == false || PosicionFede == true && PosicionUser == true){
                                    if(user.subaccount == undefined){
                                        ftxApi = new FTXRest({
                                        key: user.key,
                                        secret: user.secret,
                                        
                                        });
                                    }
                                    else{
                                        ftxApi = new FTXRest({
                                        key: user.key,
                                        secret: user.secret,
                                        subaccount:user.subaccount
                                        });
                                    }
                                    //console.log('Sizes y minimo' , order.size,pares[order.market].sizeIncrement);
                                    if((order.size * user.balance / Fede.balance) >= pares[order.market].sizeIncrement){
                                        try{
                                            ftxApi.request({
                                                method: 'POST',
                                                path: '/orders',
                                                data: {
                                                    market: order.market,
                                                    side: order.side,
                                                    type: order.type,
                                                    size: order.size * user.balance / Fede.balance,
                                                    price: order.price,
                                                    reduceOnly: order.reduceOnly,
                                                }
                                            });
                                            delay(200);
                                        } catch(error){
                                            console.log(error);
                                        }
                                        console.log('Orden creada en ', user.name);
                                    }
                                }
                            }
                        });
                    });
                });
            }
            else{
                users.forEach(async user => {
                        let coincidencia = 0;
                        for(let i = 0;i < user.ordenes.length;i++){
                            if(user.ordenes[i].market === order.market && user.ordenes[i].side === order.side && user.ordenes[i].price == order.price){
                                console.log('Orden de user',user.name,user.ordenes[i])
                                coincidencia = 1;
                                break;
                            }
                        }
                        if(coincidencia == 0){
                                if(user.subaccount == undefined){
                                    ftxApi = new FTXRest({
                                    key: user.key,
                                    secret: user.secret,
                                    
                                    });
                                }
                                else{
                                    ftxApi = new FTXRest({
                                    key: user.key,
                                    secret: user.secret,
                                    subaccount:user.subaccount
                                    });
                                }
                                //console.log('Sizes y minimo' , order.size,pares[order.market].sizeIncrement);
                                if((order.size * user.balance / Fede.balance) >= pares[order.market].sizeIncrement){
                                    try{
                                        ftxApi.request({
                                            method: 'POST',
                                            path: '/orders',
                                            data: {
                                                market: order.market,
                                                side: order.side,
                                                type: order.type,
                                                size: order.size * user.balance / Fede.balance,
                                                price: order.price,
                                                reduceOnly: order.reduceOnly,
                                            }
                                        });
                                        delay(200);
                                    } catch(error){
                                        console.log(error);
                                    }
                                    console.log('Orden creada en ', user.name);
                                }
                            }
                });
            }
        }
        
    });
}

async function putStops(){
    Fede.stops.forEach(async stop => {
        let sidePosition;
        if(stop.side === 'buy'){ sidePosition = 'sell';}
        if(stop.side === 'sell'){ sidePosition = 'buy';}
        HayPosicion(Fede,stop.market,sidePosition).then(PosicionFede => {
            users.forEach(async user => {
                HayPosicion(user,stop.market,sidePosition).then(PosicionUser => {
                let coincidencia = 0;
                    for(let i = 0;i < user.stops.length;i++){
                        if(user.stops[i].market === stop.market && user.stops[i].side === stop.side && user.stops[i].triggerPrice == stop.triggerPrice){
                            coincidencia = 1;
                            break;
                        }
                    }
                    if(coincidencia == 0){
                        if(PosicionFede == false && PosicionUser == false || PosicionFede == true && PosicionUser == true){
                            if(user.subaccount == undefined){
                                ftxApi = new FTXRest({
                                key: user.key,
                                secret: user.secret,
                                
                                });
                            }
                            else{
                                ftxApi = new FTXRest({
                                key: user.key,
                                secret: user.secret,
                                subaccount:user.subaccount
                                });
                            }
                            console.log('Sizes y minimo' , stop.size,pares[stop.market].sizeIncrement);
                            if((stop.size * user.balance / Fede.balance) >= pares[stop.market].sizeIncrement){
                                try{
                                    ftxApi.request({
                                        method: 'POST',
                                        path: '/conditional_orders',
                                        data: {
                                            market: stop.market,
                                            side: stop.side,
                                            type: stop.type,
                                            size: stop.size * user.balance / Fede.balance,
                                            triggerPrice: stop.triggerPrice,
                                            reduceOnly: true,
                                        }
                                    })
                                    delay(200);
                                } catch(error){
                                    console.log(error);
                                }
                                console.log('Stop creado en ', user.name);
                            }
                        }
                    }
                });
            });
        });
    });
}

async function cancelOrders(){
    users.forEach(user => {
        user.ordenes.forEach(orden =>{
            let coincidencia = 0;
            //console.log(coincidencia);
            for(let i =0;i < Fede.ordenes.length;i++){
                if(orden.market === Fede.ordenes[i].market && orden.side === Fede.ordenes[i].side && orden.price === Fede.ordenes[i].price){
                    coincidencia = 1;
                    break;
                }
            }
            //console.log(coincidencia)
            if(coincidencia == 0){
                if(user.subaccount == undefined){
                    ftxApi = new FTXRest({
                    key: user.key,
                    secret: user.secret,
                    
                    });
                }
                else{
                    ftxApi = new FTXRest({
                    key: user.key,
                    secret: user.secret,
                    subaccount:user.subaccount
                    });
                }
                try{
                    ftxApi.request({
                        method: 'DELETE',
                        path: '/orders/' + orden.id,
                    });
                    delay(200);
                } catch(error){
                    console.log(error);
                }
                console.log('Orden cancelada en ', user.name);
            }
        })
    })
}

async function CancelStops(){
    users.forEach(user => {
        user.stops.forEach(stop =>{
            let coincidencia = 0;
            for(let i =0;i < Fede.stops.length;i++){
                if(stop.market === Fede.stops[i].market && stop.side === Fede.stops[i].side && stop.triggerPrice === Fede.stops[i].triggerPrice){
                    coincidencia = 1;
                    break;
                }
            }
            if(coincidencia == 0){
                if(user.subaccount == undefined){
                    ftxApi = new FTXRest({
                    key: user.key,
                    secret: user.secret,
                    
                    });
                }
                else{
                    ftxApi = new FTXRest({
                    key: user.key,
                    secret: user.secret,
                    subaccount:user.subaccount
                    });
                }
                try{
                    ftxApi.request({
                    method: 'DELETE',
                    path: '/conditional_orders/' + stop.id,
                    });
                    delay(200);
                } catch(error){
                    console.log(error);
                }
                console.log('Stop cancelado en ', user.name);
            }
        })
    })
}
async function ClosePositions(){
    users.forEach(user => {
        user.posiciones.forEach(posicion =>{
            let coincidencia = 0;
            for(let i =0;i < Fede.posiciones.length;i++){
                if(posicion.market === Fede.posiciones[i].market && posicion.side === Fede.posiciones[i].side){
                    coincidencia = 1;
                    break;
                }
            }
            if(coincidencia == 0){
                let side;
                if(posicion.side === 'buy') side = 'sell';
                if(posicion.side === 'sell') side = 'buy';
                if(user.subaccount == undefined){
                    ftxApi = new FTXRest({
                    key: user.key,
                    secret: user.secret,
                    
                    });
                }
                else{
                    ftxApi = new FTXRest({
                    key: user.key,
                    secret: user.secret,
                    subaccount:user.subaccount
                    });
                }
                try{
                    ftxApi.request({
                        method: 'POST',
                        path: '/orders',
                        data: {
                            market: posicion.future,
                            size: posicion.size,
                            side: side,
                            type: 'market',
                            price: null
                        }
                    });
                    delay(200);
                } catch(error){
                    console.log(error);
                }
                console.log('Posicion cerrada en ', user.name);
            }
        })
    })
}

async function CloseSpot(){
    users.forEach(user => {
        user.monedas.forEach(coin =>{
            let coincidencia = 0;
            for(let i =0;i < Fede.monedas.length;i++){
                if(coin.coin === Fede.monedas[i].coin){
                    coincidencia = 1;
                    break;
                }
            }
            if(coincidencia == 0){
                
                if(user.subaccount == undefined){
                    ftxApi = new FTXRest({
                    key: user.key,
                    secret: user.secret,
                    
                    });
                }
                else{
                    ftxApi = new FTXRest({
                    key: user.key,
                    secret: user.secret,
                    subaccount:user.subaccount
                    });
                }
                try{
                    ftxApi.request({
                        method: 'POST',
                        path: '/orders',
                        data: {
                            market: coin.coin +'/USD',
                            size: coin.total,
                            side: 'sell',
                            type: 'market',
                            price: null
                        }
                    });
                    delay(200);
                } catch(error){
                    console.log(error);
                }
                console.log('Posicion cerrada en ', user.name);
            }
        })
    })
}
async function HayPosicion(user,market){
    let promise = new Promise((resolve, reject) => {
        if(user.subaccount == undefined){
            ftxApi = new FTXRest({
            key: user.key,
            secret: user.secret,
            
            });
        }
        else{
            ftxApi = new FTXRest({
            key: user.key,
            secret: user.secret,
            subaccount:user.subaccount
            });
        }
        let posiciones = [];
        try{
            ftxApi.request({
            method: 'GET',
            path: '/positions',
            }).then(msg => {
            msg.result.forEach(position => {
                if(position.size !=0 && position.future === market && position.side === side){
                    // console.log('Posicion encontrada en ', user.name);
                    // console.log(position)
                    resolve(true);
                }
            });
            delay(200);
            //console.log(posiciones);
            resolve(false);
            });
        } catch(error){
            console.log(error);
        }
    
  });
  return promise;
}

async function HaySPot(user,market){
    let promise = new Promise((resolve, reject) => {
        if(user.subaccount == undefined){
            ftxApi = new FTXRest({
            key: user.key,
            secret: user.secret,
            
            });
        }
        else{
            ftxApi = new FTXRest({
            key: user.key,
            secret: user.secret,
            subaccount:user.subaccount
            });
        }
        let monedas = [];
    try{
        ftxApi.request({
        method: 'GET',
        path: '/wallet/balances',
        }).then(msg => {
        //console.log(msg);
        msg.result.forEach(coin =>{
            if(coin.coin == market && coin.total !=0){
                // monedas.push(coin);
                //console.log(coin);
                resolve(true)
            }
        })
        delay(200);
        resolve(false);
       
        
        
        });
    } catch(error){
        console.log(error);
    }
        let posiciones = [];
        try{
            ftxApi.request({
            method: 'GET',
            path: '/positions',
            }).then(msg => {
            msg.result.forEach(position => {
                if(position.size !=0 && position.future === market && position.side === side){
                    // console.log('Posicion encontrada en ', user.name);
                    // console.log(position)
                    resolve(true);
                }
            });
            delay(200);
            //console.log(posiciones);
            resolve(false);
            });
        } catch(error){
            console.log(error);
        }
    
  });
  return promise;
}
async function getAllFutures(){
    const ftx = new FTXRest({
        key: 'd2IICGDeTMg8dU3gVC0-wfrgGvpI2UwGeOnehMvY',
        secret: '7THyfgFCWYaZYY0dYr-VxXFiDu7hWu-mESNK3701',
        
      
    });
    ftx.request({
        method: 'GET',
        path: '/markets'
    }).then(msg =>{
        //console.log(msg)
        msg.result.forEach(element => {
            pares[element.name] = element
        });
        console.log(pares['BTC-PERP'])
    })
}
getAllFutures()
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))


async function main(){
    //console.log('Inicio de ciclo');
    await ActualizarBalances();
    await getAllBalances;
    await getAllOrders();
    await getAllStops();
    await getAllPositions();
    await delay(2000);
    await cancelOrders();
    await CancelStops();
    await ClosePositions();
    await CloseSpot();

    await putOrders();
    await putStops();
    //console.log(Fede.ordenes);
    //console.log(users[0].ordenes);
    //console.log('Fin de ciclo');
}

setInterval(main,10000);
//setInterval(ActualizarBalances, 1800000);





async function webSocket(user){
    const wsFtx  = new FTXWs({
        key: user.key,
        secret: user.secret,
      }) 

    wsFtx.connect().then(async msg=>{
        wsFtx.subscribe('orders'); //'orders'
        wsFtx.on('orders',async element=>{
           console.log(element);
          if(element.status === 'new' && element.type === 'limit' && element.reduceOnly === false){
            // console.log(new Date(element.createdAt).getTime());
            // console.log(new Date(element.createdAt )- 5000);
            order = element;
            ftx.request({
              method: 'GET',
              path: `/conditional_orders?market=${element.market}`,
            }).then(msg =>{
              msg.result.forEach(stop =>{
                // console.log(new Date(stop.createdAt).getTime());
                
                if(new Date(stop.createdAt).getTime() >= new Date(order.createdAt).getTime() - 5000 && new Date(stop.createdAt).getTime() <= new Date(order.createdAt).getTime() + 5000){
                  // console.log(stop);
                  // console.log('Encontrado Stop');
                } 
              });
            })
          }
        })
    })
}