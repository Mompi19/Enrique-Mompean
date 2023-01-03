"""Programa que calcula probabilidad en examenes de oposicion"""
temasTotales = int(input("Introducir el numero de temas del examen \n"))
nivelConfianza = float(input("Introducir el nivel de confianza deseado (0-100)\n"))
temasElegidos = int(input("Introducir cuantos temas se eligen en sorteo\n"))
probabilidad=1
exito = 0
TemasQueEstudiar=1
while nivelConfianza/100 >= (exito) :
    for i in range(temasElegidos) :
        a = temasTotales-i
        probabilidad = probabilidad * ((a-TemasQueEstudiar)/(a))

    if nivelConfianza/100 <= (1-probabilidad) :
        exito = 1-probabilidad
    probabilidad = 1
    TemasQueEstudiar += 1
print("Con ",TemasQueEstudiar-1," temas estudiados el nivel de confianza es ",exito)    
    
 
