
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
        <div> ${iterador.description} </div>
        <div> Stock ${iterador.stock} </div>
        <div> <img src= ${iterador.thumbnail} width=100  alt=""> </div>
        <button id="post-btn-${iterador.id}"> Agregar al Carrito </button>
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

          fetch('/carrito', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
             body: JSON.stringify({
                id: iterador.id,
                timestamp: dateStr,
                title: iterador.title,
                description: iterador.description,
                code: iterador.code,
                thumbnail: iterador.thumbnail,
                price: iterador.price,
                stock: iterador.stock,
                })
          })
            .then(res => res.json())
            .then(data => {
              alert('producto agregado al carrito')
            })
            .catch(error => {
             console.log(error)
            })  


});
   
}}





