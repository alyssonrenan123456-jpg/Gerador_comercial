function gerarLogin(){

let nome=document.getElementById("nome").value;

let cidade=document.getElementById("cidade").value;

if(nome==""){

alert("Digite o nome.");

return;

}

let login=nome
.toLowerCase()
.replaceAll(" ",".")
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"");

let senha=nome.split(" ")[0]+"123";

document.getElementById("usuario").innerHTML=login;

document.getElementById("senha").innerHTML=senha;

document.getElementById("resultado").style.display="block";

}