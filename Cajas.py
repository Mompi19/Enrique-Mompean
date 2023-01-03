import csv
import numpy
Fecha = []
Ask = []
Bid = []
contador = 0
with open('datos.csv') as File:  
    reader = csv.reader(File)

    for row in reader:
        try:
            Fecha.append(row[0])
            Ask.append(float(row[1]))
            Bid.append(float(row[2]))
            contador +=1
        except:
            print("A ver si cuela")

print(len(Ask))
print(len(Bid))
print(len(Fecha))
MaximoLocal = numpy.amax(Ask)
MinimoLocal = numpy.amin(Bid)
print("AskMax ",MaximoLocal)
print("BidMin ",MinimoLocal)
RangoMin = 0.02
CajaMin = 0.15  #Fees + CS
ROptima = 0
CajaOptima = 0
PosicionOptima = 0
NumeroTradesOptimo = 0
Puntos = []
PuntosUtiles = []
FechaUtil = []
Mezcla = []

Pruebas = 0

CajaMax = MaximoLocal - MinimoLocal - RangoMin * 2

print("CajaMax ",CajaMax)

IntervaloInutil = [MaximoLocal-RangoMin-CajaMin,MinimoLocal + RangoMin + CajaMin]
print("Intervalos ",IntervaloInutil)

for i in range(len(Ask)):
    if Bid[i] <= IntervaloInutil[0]:
        Mezcla.append(Bid[i])
        FechaUtil.append(Fecha[i+1])
    if Ask[i] >= IntervaloInutil[1]:
        Mezcla.append(Ask[i])
        FechaUtil.append(Fecha[i+1])
        
print(len(Mezcla))
print(IntervaloInutil)
Caja = CajaMax
while Caja >= CajaMin:
    Posicion = 0
    while (Caja + Posicion + MinimoLocal+RangoMin) <= (MaximoLocal-RangoMin):
        "Aqui comrpuebo trades"
        NumeroTrades = 0
        Estado = 2 # 2 = Nada Previo , 1= Bid , 0 = Ask
        for i in range(len(Mezcla)):
            if Estado == 2 and Mezcla[i] >= (Caja + Posicion + MinimoLocal+RangoMin):
                Estado = 0
            if Estado == 2 and Mezcla[i] <= (MinimoLocal+RangoMin+Posicion):
                Estado = 1
            if Estado == 1 and Mezcla[i] >= (Caja + Posicion + MinimoLocal+RangoMin):
                Estado = 0
                NumeroTrades +=1
            if Estado == 0 and Mezcla[i] <= (MinimoLocal+RangoMin+Posicion):
                Estado = 1
                NumeroTrades +=1
                
                
        R = NumeroTrades * Caja
        #print("Para una caja de ",Caja," colocada en ",Posicion,"tenemos ",NumeroTrades," Trades y una R = ",R)
        if R > ROptima:
            ROptima = R
            CajaOptima = Caja
            PosicionOptima = Posicion
            NumeroTradesOptimo = NumeroTrades
        
        Posicion += 0.001
        Pruebas += 1
        
    Caja -=0.001
print("Configuracion Optima Para una caja de ",CajaOptima," colocada en ",PosicionOptima,"tenemos ",NumeroTradesOptimo," Trades y una R = ",ROptima)
print("Numero de pruebas: ",Pruebas)
