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
const credenciales = {
    key: 'FoRvzocq2DEk2JX--H0IJ8RYroqFGWJt0sq03Dh-',
    secret: 'QDMX2azqcOc_gzEIOCb4tzjTQyRJ6Mzm4Omsnp4A',
    subaccount:'CashNCarry'
}
const {BalanceFtx, getAllOrdersFtx,getFeesFtx, getAllPositionsFtx} = require('./FuncionesGenericas.js')
let asks = new Map()
let bids = new Map()
let balance;
const ftx = new FTXRest(credenciales)
const ws  = new ftxws(credenciales)
const wsOrderbook  = new ftxws(credenciales)
async function webSocketOrderBook(par){
  wsOrderbook.connect().then(async msg =>{
    //console.log(wsTicker);
    wsOrderbook.subscribe('orderbook',par);
    wsOrderbook.on(`${par}::orderbook`,(element)=> {
    //console.log(element)
    element.bids.forEach(bid => {
        if(bid[1] == 0) bids.delete(bid[0]);
        else bids.set(bid[0],bid[1])
        
    })
    element.asks.forEach(ask => {
        if(ask[1] == 0) asks.delete(ask[0]);
        else asks.set(ask[0],ask[1])
    })

    //bids.delete(key => bids.get(key) == 0)
    console.log(Math.max(...bids.keys()),Math.min(...asks.keys()))
    
    // console.log(Math.min(...bids.keys()))
    
})

})
}
// webSocketOrderBook()

async function DiferenciasMaximass(){
  let datos =[]
  influx.query(`select * from diferenciasAskBid`).then(msg =>{
    msg.forEach(element => {
      if(datos[`${element.FutureName}`] == undefined) datos[`${element.FutureName}`] = {DiferenciaBid:element.DiferenciaBid,DiferenciaAsk:element.diferenciaAsk,FundingMedio:element.Funding,ndatos:0}
      if(Math.abs(element.DiferenciaBid) > Math.abs(datos[`${element.FutureName}`].DiferenciaBid)) datos[`${element.FutureName}`].DiferenciaBid = element.DiferenciaBid
      if(Math.abs(element.diferenciaAsk) > Math.abs(datos[`${element.FutureName}`].DiferenciaAsk)) datos[`${element.FutureName}`].DiferenciaAsk = element.diferenciaAsk
      datos[`${element.FutureName}`].FundingMedio += element.Funding;
      datos[`${element.FutureName}`].ndatos += 1;
      
      
    })
    let keys = Object.keys(datos)
    keys.forEach(key => {
      datos[`${key}`].FundingMedio = datos[`${key}`].FundingMedio / datos[`${key}`].ndatos
    })
    console.log(datos);
  })
}
async function CondicionesIniciales(){
  balance = await BalanceFtx(ftx)
  let ordenes = await getAllOrdersFtx(ftx)
  ordenes.forEach(orden => {
    if(orden.status == 'open') {
      ftx.request({
        method: 'DELETE',
        path: `/orders/${orden.id}`
      })
    }
  });
  let posiciones = await getAllPositionsFtx(ftx)

  let perps =[]
  let futures = []
  posiciones.forEach(posicion => {
    if(posicion.size !=0){
      if(posicion.future.includes('PERP')){
        perps.push(posicion)
      }
      else{
        futures.push(posicion)
      }
    }
  })
 
  futures.forEach(async future => {
    future.emparejado = 0;
    perps.forEach(async perp => {
      if(future.emparejado==0){
        if(future.future.replace('-1230','').replace('-0331','') === perp.future.replace('-PERP','') && future.size == perp.size && future.side != perp.side){
          future.emparejado = 1;
          perp.emparejado = 1;
        }
      }

    })
  })
  
  futures.forEach(future =>{
    if(future.emparejado != 1){
      console.log('Hay que cerrar el futuro',future.future,'con',future.size,future.side === 'sell' ?'buy' : 'sell',);
      ftx.request({
        method: 'POST',//'POST'
        path: `/orders`,
        data: {
            market: future.future,
            size: future.size,
            side: future.side === 'sell' ?'buy' : 'sell',//"buy" or "sell"
            type: "market", //"stop", "trailingStop", "takeProfit"; default is stop
            reduceOnly: true, //true false
            price: null
        }
      })
    }
  })
  perps.forEach(perp =>{
    if(perp.emparejado != 1){
      console.log('Hay que cerrar el perp',perp.future,'con',perp.size,perp.side === 'sell' ?'buy' : 'sell',);
      ftx.request({
        method: 'POST',//'POST'
        path: `/orders`,
        data: {
            market: perp.future,
            size: perp.size,
            side: perp.side === 'sell' ?'buy' : 'sell',//"buy" or "sell"
            type: 'market', //"stop", "trailingStop", "takeProfit"; default is stop
            reduceOnly: true, //true false
            price: null
           
        }
      })
    }
  })
}


async function main(){
  //Comprobamos condiciones iniciales
  CondicionesIniciales()
  
}
main()