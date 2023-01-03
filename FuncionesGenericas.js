const FTXRest = require('ftx-api-rest');
const ftxws = require('ftx-api-ws');
const { InverseClient } = require('bybit-api');
// tener en cuenta que en bybit las apis no pueden ser genericas para todas las subcuentas
//Funciones que consultan balances
const credencialesFtx = {
    key: 'FoRvzocq2DEk2JX--H0IJ8RYroqFGWJt0sq03Dh-',
    secret: 'QDMX2azqcOc_gzEIOCb4tzjTQyRJ6Mzm4Omsnp4A',
    //subaccount:'star atlas
}
const credencialesBybit = {
    key: 'j4dWY5ECREjuMrQeiG',
    secret: 'v7L4UmDup2pQBJzjAtF2Z4eVhRndV3pY7CWO'
}
async function BalanceFtx(cuenta){
    let promise = new Promise((resolve,reject) =>{
        let balance = 0;
        const ftx = new FTXRest({
            key: cuenta.key,
            secret: cuenta.secret,
            subaccount: cuenta.subaccount
        })
        ftx.request({
            method: 'GET',
            path:'/wallet/balances'
        }).then(msg =>{
            msg.result.forEach(element =>{
                if(element.usdValue != 0){
                    //console.log(element)
                    balance += element.usdValue
                }
                

                
            })
            resolve(balance)
        })
    })
    return(promise)
    
}


async function BalanceBybit(cuenta){
    
    let balance = 0
    const API_KEY = cuenta.key;
    const PRIVATE_KEY = cuenta.secret;
    const useLivenet = true;
    const InverseBybit = new InverseClient(
        API_KEY,
        PRIVATE_KEY,
        useLivenet);
    await InverseBybit.getWalletBalance().then(msg =>{
        datos = msg;
        
    })
    for(const propiedad in datos.result) {
        //console.log(propiedad,datos.result[propiedad].equity)
        if(propiedad != 'USDT' && datos.result[propiedad].equity !=0){
            await InverseBybit.getTickers({symbol:propiedad + 'USD'}).then(men =>{
            //console.log(men)
            if(men.result != undefined){
                //console.log(datos.result[propiedad].equity * men.result[0].last_price)
                balance += datos.result[propiedad].equity * men.result[0].last_price
            }
            })
        }
        else{
            balance += datos.result[propiedad].equity
        }
    }
    return balance;
}

// async function main(){
    
//     getAllOrdersBybit(credencialesBybit);
// }
async function getAllOrdersFtx(cuenta){
    let promise = new Promise((resolve,reject) =>{
        const ftx = new FTXRest({
            key: cuenta.key,
            secret: cuenta.secret,
            subaccount: cuenta.subaccount
        })
        let ordenes = []
        ftx.request({
            method:'GET',
            path:`/orders`
        }).then(msg =>{
            //console.log(msg)
            msg.result.forEach(element => {
                ordenes.push(element)
            });
            resolve(ordenes);
        })
        
    })
    return promise;
    
}

async function getFeesFtx(cuenta){
    let promise = new Promise((resolve,reject) =>{
        let fees = {
            maker:0,
            taker:0
        };
        const ftx = new FTXRest({
            key: cuenta.key,
            secret: cuenta.secret,
            subaccount: cuenta.subaccount
        })
        ftx.request({
        method: 'GET',
        path: '/account'
        }).then((response) => {
            fees.maker = response.result.makerFee;
            fees.taker = response.result.takerFee;
            console.log(fees.maker,fees.taker);
            resolve(fees);
        })
    })
    return promise;
}
async function getAllPositionsFtx(cuenta){
    let promise = new Promise((resolve,reject) =>{
        const ftx = new FTXRest({
            key: cuenta.key,
            secret: cuenta.secret,
            subaccount: cuenta.subaccount
        })
        let posiciones = []
        ftx.request({
            method:'GET',
            path:`/positions`
        }).then(msg =>{
            //console.log(msg)
            msg.result.forEach(element => {
                if(element.size != 0){
                    posiciones.push(element)
                }
            });
            resolve(posiciones);
        })
        
    })
    return promise;
    
}

async function getAllOrdersBybit(cuenta){
    let InverseFutures = ['BTCUSD','ETHUSD','XRPUSD','ADAUSD','SOLUSD','EOSUSD','DOTUSD','BITUSD','MANAUSD']
    const API_KEY = cuenta.key;
    const PRIVATE_KEY = cuenta.secret;
    const useLivenet = true;
    const InverseBybit = new InverseClient(
        API_KEY,
        PRIVATE_KEY,
        useLivenet
    );
    for(i in InverseFutures){
        console.log(InverseFutures[i])
        await InverseBybit.getActiveOrderList(params = {symbol:InverseFutures[i]}).then(msg =>{
            console.log(msg.re)
        })
    }
    
}
// main()
module.exports = {
    BalanceFtx,
    getAllOrdersFtx,
    getFeesFtx,
    getAllPositionsFtx,

    BalanceBybit,
}