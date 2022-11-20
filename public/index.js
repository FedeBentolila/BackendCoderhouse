
let guardarlocal= (clave, valor) =>{localStorage.setItem(clave, valor) };

let carrito=[];

const almacenados= JSON.parse(localStorage.getItem("storagecarrito"))

if (almacenados!=null) {
  carrito=almacenados
  rendercarrito(carrito)
}

let Arreglodeproductos = []

fetch("./productos.json")
    .then((response) => response.json())
    .then((json) => renderproductos(json));


//funciones

function renderproductos (data){

    for (const iterador of data) {
        let contenedor = document.createElement("div");
        contenedor.innerHTML = 
        `  
        <div>${iterador.title}</div>
        <div> Precio ${iterador.price} </div>
        <div> Descripción ${iterador.description} </div>
        <div> Stock ${iterador.stock} </div>
        <div> <img src= ${iterador.thumbnail} width=100  alt=""> </div>
        <button id="post-btn-${iterador.id}"> Agregar </button>
        `;
        document.getElementById("productos").appendChild(contenedor)

        const button = document.getElementById('post-btn-'+iterador.id);

        button.addEventListener('click', async _ => {
          let date = new Date();
          let dateStr =
          ("00" + date.getDate()).slice(-2) + "/" +
          ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
          date.getFullYear() + " " +
          ("00" + date.getHours()).slice(-2) + ":" +
          ("00" + date.getMinutes()).slice(-2) + ":" +
          ("00" + date.getSeconds()).slice(-2);

          carrito.push({
            title: iterador.title,
            description: iterador.description,
            price: iterador.price,
            code: iterador.code,
            stock: iterador.stock,
            thumbnail: iterador.thumbnail,
            id:iterador.id,
            timestamp: dateStr
          })

          guardarlocal("storagecarrito", JSON.stringify(carrito))

          document.location.reload()

      

});
   
}}

function rendercarrito (data){

  for (const iterador of data) {
      let contenedor = document.createElement("div");
      contenedor.innerHTML = 
      `  
      <div>${iterador.title}</div>
      <div> Precio ${iterador.price} </div>
      <div> <img src= ${iterador.thumbnail} width=100  alt=""> </div>
      `;
      document.getElementById("carrito").appendChild(contenedor)

}}

const button2 = document.getElementById('Boton carrito');

button2.addEventListener('click', async _ => {
  let date = new Date();
  let dateStr =
  ("00" + date.getDate()).slice(-2) + "/" +
  ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
  date.getFullYear() + " " +
  ("00" + date.getHours()).slice(-2) + ":" +
  ("00" + date.getMinutes()).slice(-2) + ":" +
  ("00" + date.getSeconds()).slice(-2);

 fetch('/carrito/'.concat(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
             body: JSON.stringify({
                timestamp: dateStr,
                productos: carrito,
                })
          })
            .then(res => res.json())
            .then(data => {
              alert('producto agregado al carrito')
            })
            .catch(error => {
             console.log(error)
            })  

            localStorage.clear()
            document.location.reload()

          })

