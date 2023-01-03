PosicionRestante = 100
R=[2,4,6,8,10,12,16,20,25,30]
#Stop=[-1,-1,2,4,6,8,10,12,16,20]
Stop=[-1,2,4,6,8,10,12,16,20,25]
Cierres = [40,15,10,5,5,5,5,5,5,5]
Ganancia = 0
GananciaStop = 0
for i in range(len(R)):
    PosicionRestante = PosicionRestante - Cierres[i]
    #print(PosicionRestante)
    Ganancia = Ganancia + Cierres[i]*R[i]/100
    GananciaStop = Ganancia + (Stop[i]*PosicionRestante)/100
    #print((Stop[i]*PosicionRestante)/100)
    print("Ganancia moviendo Stop en ", i+1 ," cierre: ", GananciaStop)
    print("Ganancia sin mover Stop en ", i+1 ," cierre: ", Ganancia -PosicionRestante/100)

Ganancia =0
PosicionRestante = 100
for i in range(len(R)):
    PosicionRestante = PosicionRestante - Cierres[-(i+1)]
    #print(PosicionRestante)
    Ganancia = Ganancia + Cierres[-(i+1)]*R[i]/100
    GananciaStop = Ganancia + (Stop[i]*PosicionRestante)/100
    #print((Stop[i]*PosicionRestante)/100)
    print("Ganancia moviendo Stop en ", i+1 ," cierre: ", GananciaStop)
    print("Ganancia sin mover Stop en ", i+1 ," cierre: ", Ganancia -PosicionRestante/100)

