const FTXRest = require('ftx-api-rest');
// const request = require('request');
const logInLibrary = require('./service/AuthService');
const logIn = logInLibrary.logIn;
const mysql = require('mysql');

const decryptLibrary = require('./service/DecryptService.js');
const decrypt = decryptLibrary.decrypt;
const { Console } = require('winston/lib/winston/transports');
let con = mysql.createConnection({
    host: "192.168.1.87",
    port:'3306',
    user: "enrique",
    password: ,
    database: 
});
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
        });

function countDecimals(num) {
    decimals = 0
    while(num<1){
      num = num*10
      decimals +=1
    }
    return decimals
    }





async function getApiKey(id_user,id_exchange){
    let AccesToken
    let key;
    let secret;
    //console.log(logIn)
    AccesToken  = await logIn()
        
    // console.log(AccesToken)
    // console.log(`Inicio de sesion en ${FechaInicio} expira en ${FechaInicio + AccesToken.expires_in}`)
    con.query(`SELECT * FROM api_key WHERE user_id=1 && id_exchange = 1`, function (err, result) {      //consultar cosicas
        if (err) throw err;
        console.log(result[0])
        key = result[0].api_key;
        secret = result[0].secret_key;
        // console.log(ftxkey)
        // console.log(ftxsecret)
        decrypt(key,secret,AccesToken.access_token).then(apis =>{
            console.log(apis)
            return apis;
    
    
            
        });
        
    });
    

}

getApiKey(1,2)