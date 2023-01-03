const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const plotly = require('plotly')('enrique.mompean','tqazyUxtdWyZM5Xqn8Vk')
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
const ohcl = require('./ohclv.js')

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


async function main(){
    let nivelesValidos =0
    let pruebas =0;
    let nivelesTesteados =0
    let PorcentajesTesting = []
    const Rojo = 'red';             //Mensual
    const Naranja = 'orange';       //Semanal
    const Amarillo = 'yellow';      //Diario
    const Verde = 'green';          //4 Horas
    const Azul = 'blue';            //1 Hora
    const Gris = '#D2D2D2'
    const GrisClaro = '#F9F9F9';
    const Lila = 'purple';
    let colores = [];
    colores['M'] = Rojo;
    colores['1w'] = Naranja;
    colores['1d'] = Amarillo;
    colores['4h'] = Verde;
    colores['1h'] = Azul;
    
    PorcentajesTesting['1w'] = 1/100;
    PorcentajesTesting['1d'] = 0.7/100;
    PorcentajesTesting['4h'] = 0.5/100;
    PorcentajesTesting['1h'] = 0.5/100;
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
    let datosSegregados = [];
    
    
    
    exchangeName = 'Ftx'
    symbol = 'ADA-PERP'
    const csvWriter = createCsvWriter({
        path: `./Analisislevels/${exchangeName}${(symbol.replace('-','')).replace('/','')}.csv`,
        header: [
          {id: 'id', title: 'Id'},
          {id: 'price', title: 'Price'},
          {id: 'time', title: 'Time'},
          {id: 'state', title: 'State'},
          {id: 'activo', title: 'activo'},
          {id: 'UTDate', title: 'UTDate'},
          {id: 'validationDate', title: 'ValidationDate'},
          {id: 'TimeFrame', title: 'TimeFrame'},
          {id: 'color', title: 'Color'},
          {id: 'high', title: 'High'},
          {id: 'Stop', title: 'Stop'},
          {id: 'Fill', title: 'Fill'},
          {id: 'Tested', title: 'Tested'},
          {id: 'R1', title: 'R1'},
          {id: 'R2', title: 'R2'},
          {id: 'RMaxima', title: 'RMaxima'},
          {id: 'DateFill', title: 'DateFill'},
          {id: 'DateStop', title: 'DateStop'},
          {id: 'DateUltimaR', title: 'DateUltimaR'},
          
        ]
      });
    await ohcl.ohcl(id_exchange,symbol)
    datos = await lecturaGeneral(exchangeName,symbol)
    console.log(datos)
    niveles = await EncontrarNiveles(exchangeName,symbol)
    datosSegregados['1w'] = await ohcl.lecturaUnica(2,symbol,'1w');
    datosSegregados['1d'] = await ohcl.lecturaUnica(2,symbol,'1d');
    datosSegregados['4h'] = await ohcl.lecturaUnica(2,symbol,'4h');
    datosSegregados['1h'] = await ohcl.lecturaUnica(2,symbol,'1h');
    datosSegregados['1m'] = await ohcl.lecturaUnica(2,symbol,'1m');
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
        console.log('Comprobando nivel n',pruebas +=1)
        console.log(niveles[k].price)
        let iteraciones = 0;
        let TimeFramesTesteo = [];
        let ValidacionTimeFrame = [];
        ValidacionTimeFrame['1w'] = 0;
        ValidacionTimeFrame['1d'] = 0;
        ValidacionTimeFrame['4h'] = 0;
        ValidacionTimeFrame['1h'] = 0;
        ValidacionTimeFrame['1m'] = 0;
        let ValidacionAnterior = 0;
        let TimeFrameAnterior;
        let validationDate;

        switch(niveles[k].TimeFrame){
            case '1w':
                TimeFramesTesteo['1w'] = false;
                TimeFramesTesteo['1d'] = true;
                TimeFramesTesteo['4h'] = true;
                TimeFramesTesteo['1h'] = true;
                TimeFramesTesteo['1m'] = true;
                
                break;
            case '1d':
                TimeFramesTesteo['1w'] = false;
                TimeFramesTesteo['1d'] = false;
                TimeFramesTesteo['4h'] = true;
                TimeFramesTesteo['1h'] = true;
                TimeFramesTesteo['1m'] = true;
                break;
            case '4h':
                TimeFramesTesteo['1w'] = false;
                TimeFramesTesteo['1d'] = false;
                TimeFramesTesteo['4h'] = false;
                TimeFramesTesteo['1h'] = true;
                TimeFramesTesteo['1m'] = true;

                break;
            case '1h':
                TimeFramesTesteo['1w'] = false;
                TimeFramesTesteo['1d'] = false;
                TimeFramesTesteo['4h'] = false;
                TimeFramesTesteo['1h'] = false;
                TimeFramesTesteo['1m'] = true;
                break;

        }
        if(niveles[k].activo ==1){
            for(TimeFrame in datosSegregados){
                if(TimeFramesTesteo[TimeFrame] == true){
                    if(ValidacionAnterior == 0){
                        validationDate = niveles[k].validationDate
                        TimeFrameAnterior = niveles[k].TimeFrame
                        
                    }
                    else{
                        validationDate = ValidacionAnterior
                    }
                    console.log('Comprobando v TimeFrame ',TimeFrame , 'Entre ',datosSegregados[TimeFrame].x.indexOf(datosSegregados[TimeFrame].x.find(element => element == niveles[k].validationDate + ventanas[niveles[k].TimeFrame]))-1 ,'y ',datosSegregados[TimeFrame].x.indexOf(datosSegregados[TimeFrame].x.find(element => element == niveles[k].validationDate)),niveles[k].validationDate + ventanas[niveles[k].TimeFrame],niveles[k].validationDate)
                    if(datosSegregados[TimeFrame].x.indexOf(datosSegregados[TimeFrame].x.find(element => element == validationDate + ventanas[TimeFrameAnterior])) == -1 || datosSegregados[TimeFrame].x.indexOf(datosSegregados[TimeFrame].x.find(element => element == validationDate)) == -1){
                        console.log('No hay datos para comprobar')
                        niveles[k].state = 'invalidado'
                        niveles[k].activo = 0
                        break;
                    }
                    for(let z = datosSegregados[TimeFrame].x.indexOf(datosSegregados[TimeFrame].x.find(element => element == validationDate + ventanas[TimeFrameAnterior]))-1; z >= datosSegregados[TimeFrame].x.indexOf(datosSegregados[TimeFrame].x.find(element => element == validationDate)); z--){
                        //console.log('OP: ',datosSegregados[TimeFrame].Op[z], ' CL: ',datosSegregados[TimeFrame].Cl[z]);
                        if(niveles[k].high == 1){
                            if(datosSegregados[TimeFrame].Op[z] <= niveles[k].price && datosSegregados[TimeFrame].Cl[z] >= niveles[k].price){
                                ValidacionTimeFrame[TimeFrame] = datosSegregados[TimeFrame].x[z];
                                console.log('Encontrado en ', ValidacionTimeFrame[TimeFrame]);
                                break;
                            }
                            
                        }
                        else{
                            if(datosSegregados[TimeFrame].Cl[z] <= niveles[k].price && datosSegregados[TimeFrame].Op[z] >= niveles[k].price){
                                ValidacionTimeFrame[TimeFrame] = datosSegregados[TimeFrame].x[z];
                                console.log('Encontrado en ', ValidacionTimeFrame[TimeFrame]);
                                break;
                            }
                            
                        }
                    }
                    if(ValidacionTimeFrame[TimeFrame] == 0){
                        console.log('No encontrado en ',TimeFrame)
                        niveles[k].state = 'invalidado'
                        niveles[k].activo = 0
                        break;
                    }
                    console.log('Comprobando tv TimeFrame ',TimeFrame , 'Entre ',datosSegregados[TimeFrame].x.indexOf(datosSegregados[TimeFrame].x.find(element => element == ValidacionTimeFrame[TimeFrame])) ,'y ',datosSegregados[TimeFrame].x.indexOf(datosSegregados[TimeFrame].x.find(element => element == niveles[k].validationDate + ventanas[niveles[k].TimeFrame])),ValidacionTimeFrame[TimeFrame],niveles[k].validationDate + ventanas[niveles[k].TimeFrame])
                    for(let z = datosSegregados[TimeFrame].x.indexOf(datosSegregados[TimeFrame].x.find(element => element == ValidacionTimeFrame[TimeFrame])); z < datosSegregados[TimeFrame].x.indexOf(datosSegregados[TimeFrame].x.find(element => element == validationDate + ventanas[TimeFrameAnterior])); z++){
                        if(niveles[k].high == 1){
                            if(datosSegregados[TimeFrame].x[z] > ValidacionTimeFrame[TimeFrame] && ValidacionTimeFrame[TimeFrame] != 0){
                                if(datosSegregados[TimeFrame].Low[z] <= niveles[k].price*(1+PorcentajesTesting[TimeFrame])){
                                    //niveles[k].state = 'tested'
                                    niveles[k].UTDate = datosSegregados[TimeFrame].x[z];

                                    niveles[k].Tested = 1
                                    nivelesTesteados +=1
                                    break;
                                }
                            }
                        }
                        else{
                            if(datosSegregados[TimeFrame].x[z] > ValidacionTimeFrame[TimeFrame] && ValidacionTimeFrame[TimeFrame] != 0){
                                if(datosSegregados[TimeFrame].High[z] >= niveles[k].price*(1-PorcentajesTesting[TimeFrame])){
                                    //niveles[k].state = 'tested'
                                    niveles[k].UTDate = datosSegregados[TimeFrame].x[z];
                                    niveles[k].Tested = 1
                                    nivelesTesteados +=1
                                    break;
                                }
                            }
                        }
                    }
                }
                ValidacionAnterior = ValidacionTimeFrame[TimeFrame];
                TimeFrameAnterior = TimeFrame;
            }
            
            
        }
        //if(iteraciones == 0) console.log(' Validacion testeando level, revisar')
    }

    for(let i = 0; i<niveles.length;i++){
        //console.log(datosSegregados[niveles[i].TimeFrame].l)
        if(niveles[i].activo == 1){
            if(niveles[i].high == 1){

                for(let j = datosSegregados[niveles[i].TimeFrame].x.indexOf(datosSegregados[niveles[i].TimeFrame].x.find(element => element == niveles[i].validationDate)); j >=0; j--){
                    
                    if(datosSegregados[niveles[i].TimeFrame].l[j] != 0 && datosSegregados[niveles[i].TimeFrame].l[j] < niveles[i].price){
                        console.log('Stop encontrado en ',Number(datosSegregados[niveles[i].TimeFrame].l[j]))
                        niveles[i].Stop = datosSegregados[niveles[i].TimeFrame].l[j];
                        break;
                    }
                }
            }
            else{
                for(let j = datosSegregados[niveles[i].TimeFrame].x.indexOf(datosSegregados[niveles[i].TimeFrame].x.find(element => element == niveles[i].validationDate)); j >=0; j--){
                    if(datosSegregados[niveles[i].TimeFrame].h[j] != 0 && datosSegregados[niveles[i].TimeFrame].h[j] > niveles[i].price){
                        console.log('Stop encontrado en ',Number(datosSegregados[niveles[i].TimeFrame].h[j]))
                        niveles[i].Stop = datosSegregados[niveles[i].TimeFrame].h[j];
                        break;
                    }
                }
            }
        }
    }

    datosSegregados['1m'] = await ohcl.lecturaUnica(2,symbol,'1m');
    console.log('Movimiento de precio listo')

    for(let i = 0; i<niveles.length;i++){
        console.log('Evaluando nivel ',i);
        if(niveles[i].activo == 1){
            for(let j = datosSegregados['1m'].x.indexOf(datosSegregados['1m'].x.find(element => element == (niveles[i].validationDate + ventanas[niveles[i].TimeFrame]))) + 1; j < datosSegregados['1m'].x.length; j++){
                if(niveles[i].Tested == 0){
                    if(niveles[i].high == 1){
                        if(niveles[i].price < datosSegregados['1m'].Low[j] && niveles[i].price >= datosSegregados['1m'].Low[j] * (1 - PorcentajesTesting['1m']) && niveles[i].Fill == 0){
                            niveles[i].Tested = 1;
                            niveles[i].DateFill = datosSegregados['1m'].x[j];
                            break;
                        }
                        if(niveles[i].price >= datosSegregados['1m'].Low[j] && niveles[i].Fill == 0){
                            niveles[i].Fill = 1;
                            niveles[i].DateFill = datosSegregados['1m'].x[j];
                        }
                        if(niveles[i].Fill == 1){
                            if(niveles[i].Stop >= datosSegregados['1m'].Low[j]){
                                niveles[i].DateStop = datosSegregados['1m'].x[j];
                                break;
                            }
                            if(niveles[i].price + (niveles[i].price - niveles[i].Stop) <= datosSegregados['1m'].High[j] && niveles[i].R1 == 0){
                                niveles[i].R1 = 1;
                                niveles[i].DateUltimaR = datosSegregados['1m'].x[j];

                            }
                            if(niveles[i].price + 2 * (niveles[i].price - niveles[i].Stop) <= datosSegregados['1m'].High[j] && niveles[i].R2 == 0){
                                niveles[i].R2 = 1;
                                niveles[i].DateUltimaR = datosSegregados['1m'].x[j];
                            }
                            if((datosSegregados['1m'].High[j]-niveles[i].price)/(niveles[i].price - niveles[i].Stop) > niveles[i].RMaxima){
                                niveles[i].RMaxima = (datosSegregados['1m'].High[j]-niveles[i].price)/(niveles[i].price - niveles[i].Stop);
                            }
                        }
                    }
                    else{
                        if(niveles[i].price > datosSegregados['1m'].High[j] && niveles[i].price <= datosSegregados['1m'].High[j] * (1 + PorcentajesTesting['1m']) && niveles[i].Fill == 0){
                            niveles[i].Tested = 1;
                            niveles[i].DateFill = datosSegregados['1m'].x[j];
                            break;
                        }
                        if(niveles[i].price <= datosSegregados['1m'].High[j] && niveles[i].Fill == 0){
                            niveles[i].Fill = 1;
                            niveles[i].DateFill = datosSegregados['1m'].x[j];
                        }
                        if(niveles[i].Fill == 1){
                            if(niveles[i].Stop <= datosSegregados['1m'].High[j]){
                                niveles[i].DateStop = datosSegregados['1m'].x[j];
                                break;
                            }
                            if(niveles[i].price - (niveles[i].Stop - niveles[i].price) >= datosSegregados['1m'].Low[j] && niveles[i].R1 == 0){
                                niveles[i].R1 = 1;
                                niveles[i].DateUltimaR = datosSegregados['1m'].x[j];
                            }
                            if(niveles[i].price - 2 * (niveles[i].Stop - niveles[i].price) >= datosSegregados['1m'].Low[j] && niveles[i].R2 == 0){
                                niveles[i].R2 = 1;
                                niveles[i].DateUltimaR = datosSegregados['1m'].x[j];
                            }
                            if((niveles[i].price - datosSegregados['1m'].Low[j])/(niveles[i].Stop - niveles[i].price) > niveles[i].RMaxima){
                                niveles[i].RMaxima = (niveles[i].price - datosSegregados['1m'].Low[j])/(niveles[i].Stop - niveles[i].price);
                            }
                        }
                    }
                }
                else{
                    break;
                }
            }
        }
        console.log('Nivel ',i,' evaluado');
    }
    console.log('Cambiando Fechas');
    await CambiarFechas(niveles);
    // CSV aqui

    csvWriter
    .writeRecords(niveles)
    .then(()=> console.log('The CSV file was written successfully'));




   
    

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
    let colores = [];
    let trace1;
    colores['M'] = Rojo;
    colores['1w'] = Naranja;
    colores['1d'] = Amarillo;
    colores['4h'] = Verde;
    colores['1h'] = Azul;
    //console.log('385')
    let id = 0;
    let promise = new Promise((resolve,reject) =>{
        influx.query(`select * from ${exchangeName}${(symbol.replace('-','')).replace('/','')} where "TimeFrame" != '1m' `).then(result =>{
            for(let k = 0;k < result.length; k++){
                if(result[k].zz !=0){
                    if(result[k].h != 0){
                        id += 1;
                        niveles.push({
                            id: id,
                            price: result[k].h,
                            time: Number(result[k].time.getNanoTime()),
                            state: 'tested',
                            activo: 0,
                            UTDate: 0,
                            validationDate: 0,
                            TimeFrame: result[k].TimeFrame,
                            color: colores[result[k].TimeFrame],
                            high: 1,
                            Stop: 0,
                            Fill: 0,
                            Tested: 0,
                            R1: 0,
                            R2: 0,
                            RMaxima: 0,
                            DateFill: 0,
                            DateStop: 0,
                            DateUltimaR: 0,
                        })
                    }
                    else{
                        if(result[k].l !=0){
                            id += 1;
                            niveles.push({
                                id: id,
                                price: result[k].l,
                                time: Number(result[k].time.getNanoTime()),
                                state: 'tested',
                                activo: 0,
                                UTDate: 0,
                                validationDate: 0,
                                TimeFrame: result[k].TimeFrame,
                                color: colores[result[k].TimeFrame],
                                high: 0,
                                Stop: 0,
                                Fill: 0,
                                Tested: 0,
                                R1: 0,
                                R2: 0,
                                RMaxima: 0,
                                DateFill: 0,
                                DateStop: 0,
                                DateUltimaR: 0,

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








async function CompletarTablas(){

}


main()


async function CambiarFechas(niveles){
    for(let i = 0; i<niveles.length;i++){
        niveles[i].time = new Date(niveles[i].time/10**6);
        niveles[i].validationDate = new Date(niveles[i].validationDate/10**6);
        niveles[i].DateFill = new Date(niveles[i].DateFill/10**6);
        niveles[i].DateStop = new Date(niveles[i].DateStop/10**6);
        niveles[i].DateUltimaR = new Date(niveles[i].DateUltimaR/10**6);
    }
    console.log('Fechas cambiadas');
}