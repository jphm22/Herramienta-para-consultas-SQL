let seleccionadas=[]
let ultimoIndice=null
let botones=[]
let filtroActual=""

function generarBotones(){

let contenedor=document.getElementById("variables")
contenedor.innerHTML=""

seleccionadas=[]
botones=[]

let texto=document.getElementById("listaVariables").value
let variables=texto.split(/\n/)

variables.forEach((v,i)=>{

v=v.trim()

if(v!=""){

let btn=document.createElement("button")
btn.innerText=v
btn.dataset.index=i

btn.onclick=function(e){

let indice=parseInt(btn.dataset.index)

if(e.shiftKey && ultimoIndice!==null){

let inicio=Math.min(ultimoIndice,indice)
let fin=Math.max(ultimoIndice,indice)

for(let j=inicio;j<=fin;j++){
activarBoton(botones[j])
}

}else{
toggleBoton(btn)
}

ultimoIndice=indice

actualizarConsultas()

}

contenedor.appendChild(btn)
botones.push(btn)

}

})

}

function toggleBoton(btn){

let v=btn.innerText

if(seleccionadas.includes(v)){

btn.classList.remove("activo")
seleccionadas=seleccionadas.filter(x=>x!=v)

}else{

btn.classList.add("activo")
seleccionadas.push(v)

}

}

function activarBoton(btn){

let v=btn.innerText

if(!seleccionadas.includes(v)){

btn.classList.add("activo")
seleccionadas.push(v)

}

}

function seleccionarTodos(){

seleccionadas=[]

botones.forEach(btn=>{
btn.classList.add("activo")
seleccionadas.push(btn.innerText)
})

actualizarConsultas()

}

function limpiarSeleccion(){

seleccionadas=[]

botones.forEach(btn=>{
btn.classList.remove("activo")
})

actualizarConsultas()

}

function limpiarLista(){

document.getElementById("listaVariables").value=""
document.getElementById("variables").innerHTML=""
seleccionadas=[]
botones=[]

}

function ordenarVariables(){

seleccionadas.sort()
actualizarConsultas()

}

function filtrar(){

let filtro=document.getElementById("buscador").value.toLowerCase()

botones.forEach(btn=>{

if(btn.innerText.toLowerCase().includes(filtro)){
btn.style.display="inline-block"
}else{
btn.style.display="none"
}

})

}

function generarFiltro(){

let variable=document.getElementById("varFiltro").value
let valor=document.getElementById("valorFiltro").value

filtroActual=" WHERE "+variable+"="+valor

actualizarConsultas()

}

function copiarTexto(texto){

navigator.clipboard.writeText(texto)

}

function copiarTodas(){

let contenedor=document.getElementById("consultas")

let queries=[]

contenedor.querySelectorAll(".query").forEach(q=>{
queries.push(q.innerText)
})

copiarTexto(queries.join("\n"))

}

function exportarTXT(){

let contenedor=document.getElementById("consultas")
let texto=""

contenedor.querySelectorAll(".query").forEach(q=>{
texto+=q.innerText+"\n"
})

let blob=new Blob([texto],{type:"text/plain"})

let a=document.createElement("a")
a.href=URL.createObjectURL(blob)
a.download="consultas_sql.txt"
a.click()

}

function crearConsulta(query){

let div=document.createElement("div")
div.className="consulta"

let span=document.createElement("div")
span.className="query"
span.innerText=query

let btn=document.createElement("button")
btn.innerText="Copiar"
btn.className="copyBtn"

btn.onclick=function(){

copiarTexto(query)
btn.innerText="Copiado ✓"

setTimeout(()=>{
btn.innerText="Copiar"
},1200)

}

div.appendChild(span)
div.appendChild(btn)

return div

}

function actualizarConsultas(){

let contenedor=document.getElementById("consultas")

if(seleccionadas.length==0){
contenedor.innerHTML=""
return
}

document.getElementById("contador").innerText=
"Variables seleccionadas: "+seleccionadas.length

let campos=seleccionadas.join(", ")

let consultas=[]

consultas.push(`SELECT ${campos} FROM VDATA${filtroActual}`)
consultas.push(`SELECT DISTINCT ${campos} FROM VDATA${filtroActual}`)
consultas.push(`SELECT ${campos} FROM VDATA${filtroActual} GROUP BY ${campos}`)
consultas.push(`SELECT ${campos} FROM VDATA${filtroActual} ORDER BY ${campos}`)
consultas.push(`SELECT COUNT(*) FROM VDATA${filtroActual}`)
consultas.push(`SELECT ${campos}, COUNT(*) FROM VDATA${filtroActual} GROUP BY ${campos}`)
consultas.push(`SELECT ${campos}, SUM(WTVAR) FROM VDATA${filtroActual} GROUP BY ${campos}`)


contenedor.innerHTML=""

consultas.forEach(q=>{
contenedor.appendChild(crearConsulta(q))
})

}

const consultasFrecuentes=[

{
categoria:"Validación de ponderación",
query:"select sum(wtvar) from vdata",
explicacion:"Verifica que la suma del factor de expansión WTVAR coincida con la base esperada."
},

{
categoria:"Filtrado multirespuesta",
query:"select * from vdata where VARIABLE.containsany({CODIGOS})",
explicacion:"Filtra registros donde la variable multirespuesta contiene alguno de los códigos."
},

{
categoria:"Frecuencia simple",
query:"select VARIABLE,count(*) from vdata group by VARIABLE",
explicacion:"Calcula la distribución de frecuencias de una variable."
},

{
categoria:"Frecuencia con etiquetas",
query:"select VARIABLE_1,VARIABLE_2.format('b'),count(*) from vdata group by VARIABLE_1",
explicacion:"Obtiene frecuencias mostrando también la etiqueta de cada categoría."
},

{
categoria:"Frecuencia ponderada",
query:"select VARIABLE,count(*),sum(wtvar) from vdata group by VARIABLE",
explicacion:"Calcula la frecuencia simple y ponderada de una variable."
},

{
categoria:"Tabulación cruzada",
query:"select VAR1,VAR2,count(*) from vdata group by VAR1,VAR2",
explicacion:"Genera una tabla cruzada de frecuencias entre dos variables."
}

]

function generarConsultasFrecuentes(){

let contenedor=document.getElementById("consultasFrecuentes")

contenedor.innerHTML=""

consultasFrecuentes.forEach(c=>{

let div=document.createElement("div")
div.className="consulta"

let texto=document.createElement("div")
texto.className="query"

texto.innerHTML=
"<b>"+c.categoria+"</b><br>"+c.query

let btnCopiar=document.createElement("button")
btnCopiar.className="copyBtn"
btnCopiar.innerText="Copiar"

btnCopiar.onclick=function(){

copiarTexto(c.query)

btnCopiar.innerText="Copiado ✓"

setTimeout(()=>{
btnCopiar.innerText="Copiar"
},1200)

}

let btnInfo=document.createElement("button")
btnInfo.innerText="❓"

btnInfo.onclick=function(){
alert(c.categoria+"\n\n"+c.explicacion)
}

div.appendChild(texto)
div.appendChild(btnCopiar)
div.appendChild(btnInfo)

contenedor.appendChild(div)

})

}

generarConsultasFrecuentes()