import serial,time
from aemet import Aemet
import sqlite3
from sqlite3 import Error
import math


import smbus
import time
from ctypes import c_short
from ctypes import c_byte
from ctypes import c_ubyte

DEVICE = 0x76 # Default device I2C address



bus = smbus.SMBus(1) # Rev 2 Pi, Pi 2 & Pi 3 uses bus 1  # Rev 1 Pi uses bus 

def getShort(data, index):
# return two bytes from data as a signed 16-bit value
    return c_short((data[index+1] << 8) + data[index]).value

def getUShort(data, index):
  #return two bytes from data as an unsigned 16-bit value
    return (data[index+1] << 8) + data[index]

def getChar(data,index):
  # return one byte from data as a signed char
    result = data[index]
    if result > 127:
        result -= 256
    return result

def getUChar(data,index):
  # return one byte from data as an unsigned char
    result =  data[index] & 0xFF
    return result

def readBME280ID(addr=DEVICE):
  # Chip ID Register Address
    REG_ID     = 0xD0
    (chip_id, chip_version) = bus.read_i2c_block_data(addr, REG_ID, 2)
    return (chip_id, chip_version)

def readBME280All(addr=DEVICE):
    REG_DATA = 0xF7
    REG_CONTROL = 0xF4
    REG_CONFIG  = 0xF5
    
    REG_CONTROL_HUM = 0xF2
    REG_HUM_MSB = 0xFD
    REG_HUM_LSB = 0xFE

    # Oversample setting - page 27
    OVERSAMPLE_TEMP = 2
    OVERSAMPLE_PRES = 2
    MODE = 1
    
    # Oversample setting for humidity register - page 26
    OVERSAMPLE_HUM = 2
    bus.write_byte_data(addr, REG_CONTROL_HUM, OVERSAMPLE_HUM)
    
    control = OVERSAMPLE_TEMP<<5 | OVERSAMPLE_PRES<<2 | MODE
    bus.write_byte_data(addr, REG_CONTROL, control)
    
    # Read blocks of calibration data from EEPROM
    # See Page 22 data sheet
    cal1 = bus.read_i2c_block_data(addr, 0x88, 24)
    cal2 = bus.read_i2c_block_data(addr, 0xA1, 1)
    cal3 = bus.read_i2c_block_data(addr, 0xE1, 7)
    
    # Convert byte data to word values
    dig_T1 = getUShort(cal1, 0)
    dig_T2 = getShort(cal1, 2)
    dig_T3 = getShort(cal1, 4)
    
    dig_P1 = getUShort(cal1, 6)
    dig_P2 = getShort(cal1, 8)
    dig_P3 = getShort(cal1, 10)
    dig_P4 = getShort(cal1, 12)
    dig_P5 = getShort(cal1, 14)
    dig_P6 = getShort(cal1, 16)
    dig_P7 = getShort(cal1, 18)
    dig_P8 = getShort(cal1, 20)
    dig_P9 = getShort(cal1, 22)
    
    dig_H1 = getUChar(cal2, 0)
    dig_H2 = getShort(cal3, 0)
    dig_H3 = getUChar(cal3, 2)
    
    dig_H4 = getChar(cal3, 3)
    dig_H4 = (dig_H4 << 24) >> 20
    dig_H4 = dig_H4 | (getChar(cal3, 4) & 0x0F)
    
    dig_H5 = getChar(cal3, 5)
    dig_H5 = (dig_H5 << 24) >> 20
    dig_H5 = dig_H5 | (getUChar(cal3, 4) >> 4 & 0x0F)
    
    dig_H6 = getChar(cal3, 6)
    
    # Wait in ms (Datasheet Appendix B: Measurement time and current calculation)
    wait_time = 1.25 + (2.3 * OVERSAMPLE_TEMP) + ((2.3 * OVERSAMPLE_PRES) + 0.575) + ((2.3 * OVERSAMPLE_HUM)+0.575)
    time.sleep(wait_time/1000)  # Wait the required time  
    
    # Read temperature/pressure/humidity
    data = bus.read_i2c_block_data(addr, REG_DATA, 8)
    pres_raw = (data[0] << 12) | (data[1] << 4) | (data[2] >> 4)
    temp_raw = (data[3] << 12) | (data[4] << 4) | (data[5] >> 4)
    hum_raw = (data[6] << 8) | data[7]
    
    #Refine temperature
    var1 = ((((temp_raw>>3)-(dig_T1<<1)))*(dig_T2)) >> 11
    var2 = (((((temp_raw>>4) - (dig_T1)) * ((temp_raw>>4) - (dig_T1))) >> 12) * (dig_T3)) >> 14
    t_fine = var1+var2
    temperature = float(((t_fine * 5) + 128) >> 8);
    
    # Refine pressure and adjust for temperature
    var1 = t_fine / 2.0 - 64000.0
    var2 = var1 * var1 * dig_P6 / 32768.0
    var2 = var2 + var1 * dig_P5 * 2.0
    var2 = var2 / 4.0 + dig_P4 * 65536.0
    var1 = (dig_P3 * var1 * var1 / 524288.0 + dig_P2 * var1) / 524288.0
    var1 = (1.0 + var1 / 32768.0) * dig_P1
    if var1 == 0:
        pressure=0
    else:
        pressure = 1048576.0 - pres_raw
        pressure = ((pressure - var2 / 4096.0) * 6250.0) / var1
        var1 = dig_P9 * pressure * pressure / 2147483648.0
        var2 = pressure * dig_P8 / 32768.0
        pressure = pressure + (var1 + var2 + dig_P7) / 16.0
    
    # Refine humidity
    humidity = t_fine - 76800.0
    humidity = (hum_raw - (dig_H4 * 64.0 + dig_H5 / 16384.0 * humidity)) * (dig_H2 / 65536.0 * (1.0 + dig_H6 / 67108864.0 * humidity * (1.0 + dig_H3 / 67108864.0 * humidity)))
    humidity = humidity * (1.0 - dig_H1 * humidity / 524288.0)
    if humidity > 100:
        humidity = 100
    elif humidity < 0:
        humidity = 0
    
    return temperature/100.0,pressure/100.0,humidity

    (chip_id, chip_version) = readBME280ID()
    print ("Chip ID     :", chip_id)
    print ("Version     :", chip_version)
    

def reset():
    tempMedia = 0.0
    humedadMedia = 0.0
    
def actualizarTemp(temp):
    if(temp > tempMax):
        tempMax = temp
    if(temp < tempMin):
        tempMin = temp
        
        
#SETUP
aemet = Aemet("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJvamV0ZWRlcmFuYUBnbWFpbC5jb20iLCJqdGkiOiIzYTlmNDhlOC0yMWUzLTQxYjEtYmQ3OS0zODFkYWFhOTY5NTUiLCJpc3MiOiJBRU1FVCIsImlhdCI6MTU1NDExNDA2NiwidXNlcklkIjoiM2E5ZjQ4ZTgtMjFlMy00MWIxLWJkNzktMzgxZGFhYTk2OTU1Iiwicm9sZSI6IiJ9.SBhcDlIroi9xlIPTJxMoxayEaJ7Ou88KzdCvJ66v3Ec",verbose=True) #Verbose True muestra las url donde accede a los datos
"""
arduinoRadiacionSolar = serial.Serial('COM4',9600)
arduinoValvula = serial.Serial()
time.sleep(2) #Dejar 2 segundos para establecer la conexion

#LEER DATOS ARDUINOS 
radiacionSolar = arduinoRadiacionSolar.readline()
"""
temp, humedad , presion = readBME280All()
print(temp, humedad, presion)
medida = True
riego = True #Variable de prueba para ver si hay que regar
tempMedia = 0
tempMax = 0
tempMin = 0
try:

    bbdd = sqlite3.connect('BBDD.db')
    micursor = bbdd.cursor() #micursor es un objeto que permite interactuar con la bbdd

except Error:

    print(Error)


print (time.strftime("%d/%m/%y "))
ahora = time.strftime("%c")
horas = time.strftime("%H")
minutos = time.strftime("%M")
segundos = time.strftime("%S")

print ("Fecha y hora de la variable" ,ahora)
print("Por campos:" ,horas,minutos,segundos )



#BUCLE PRINCIPAL
while(True):
    #ACTUALIZAR HORA
    horas = time.strftime("%H")
    minutos = time.strftime("%M")
    segundos = time.strftime("%S")
    """
    if(horas == "00" and minutos == "00" and segundos == "00"):
        reset()
    """
    #SOLO MIDE DATOS EN LAS HORAS EXACTAS
    if(medida):
        
        #LEER DATOS AEMET
        murcia = aemet.get_observacion_convencional(3,"7178I",True)# El primer parametro es el numero de horas antes de la ejecucion. Rango 2-22.
        prec = murcia.get('prec')
        viento = murcia.get('vv')
        print("Los datos de la estacion de murcia son", murcia)
        
        #LEER DATOS ARDUINOS

        #radiacionSolar = arduinoRadiacionSolar.readline()
        temp, presion , humedad = readBME280All()

        #INSERTAR EN LA BBDD    
        #datos = [('2006-03-28',temp , humedad, presion, radiacionSolar, prec, viento),]
        #micursor.executemany('INSERT INTO datos VALUES (?,?,?,?,?)', datos)
        #bbdd.commit()
        
        print("Agua:",prec)
        print("Viento:",viento)
        #actualizarTemp() #Funcion para actualizar max y min
        if(riego):
        #FORMULA MAGICA MAESTRA SI EL NIVEL DE HUMEDAD < X
            #radiacionSolarCalculada = 0,408 * radiacionSolar
            radiacionSolarCalculada = 500
            presionAtmos = presion/10
            landa = 2.501-(2.361*0.001) * temp
            psico = presionAtmos/landa * 0.00163 
            eS = 0.611*math.exp((17.27*temp)/(237.3+temp)) #En otra formula es eA
            eA = eS * (humedad/100) #En otra formula es eD
            papaDelta = (2503.6*math.exp((17.27*temp)/(237.3+temp)))/(temp + 273.3)**2 
            
            arriba = 0.408 * papaDelta * radiacionSolarCalculada + psico * (900/(temp+273)) * viento * (eS-eA)
            abajo = papaDelta + psico * (1 + 0.34 * viento)
            ET0 = arriba/abajo
            print(temp, humedad, presionAtmos)
            print(landa, psico , eS , eA, papaDelta, arriba, abajo)
            print(ET0)
            
            """
            #ENVIAR DATOS AL ARDUINO
            arduinoValvula.write()
    
#FINALIZAR
arduinoRadiacionSolar.close()
rasp3x1.close()
"""
