

Dias = (0:1:365);
Movimiento = (-0.9:0.1:10);
[D,M] = meshgrid(Dias,Movimiento);
function y = Ganancia(D,M)
CopeL = 353;
PrecioInicial = 9;
DolarL = CopeL*PrecioInicial;
APY = 6700/365;
Precio = PrecioInicial * (1+M);
CopeLF = sqrt((CopeL*DolarL)./Precio);
DolarLF = sqrt(CopeL*DolarL.*Precio);
y = ((DolarLF-DolarL) + CopeLF.*Precio - CopeL*PrecioInicial  + (APY/100.*D.*CopeLF.*Precio));
Z = ((CopeL+DolarL/PrecioInicial)*(1+M)*PrecioInicial-CopeL*PrecioInicial-DolarL);
surf(D, M,Z);
hold on;
end;

surf(Dias,Movimiento,Ganancia(D,M),'FaceColor','red','EdgeColor','blue');
hold off;