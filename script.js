function comprar(){

let nombre = document.getElementById("nombre").value
let correo = document.getElementById("correo").value
let tickets = document.getElementById("tickets").value

if(nombre == "" || correo == "" || tickets == ""){
alert("Completa todos los datos")
return
}

alert("Compra registrada correctamente 🎟️")

}
