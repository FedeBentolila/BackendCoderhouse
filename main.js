const fs = require("fs");

const path= require ('path');

let Arreglodeproductos = [];

let carrito= [];


let idproductos = 1;

let idcarrito = 1;

let date = new Date();
    let dateStr =
    ("00" + date.getDate()).slice(-2) + "/" +
    ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
    date.getFullYear() + " " +
    ("00" + date.getHours()).slice(-2) + ":" +
    ("00" + date.getMinutes()).slice(-2) + ":" +
    ("00" + date.getSeconds()).slice(-2);

//// Express

const express = require("express");
const { response } = require("express");

const aplicacion = express();

const PUERTO = 8080;

//Ejs

aplicacion.set('view engine', 'ejs');

// Lineas para usar Json
aplicacion.use(express.json());
aplicacion.use(express.urlencoded({ extended: true }));

// Router
const { Router } = express;

// Definir rutas

const rutaProductos = Router();
const rutaCarrito = Router();
//Endpoints

//productos

aplicacion.use("/", rutaProductos);
aplicacion.use("/", rutaCarrito);


rutaProductos.get("/productos", (peticion, respuesta) => {
  const ipAddress = peticion.socket.remoteAddress;
  
  const filePath= path.resolve(__dirname,'./public/index.html')
  respuesta.sendFile(filePath)
});

rutaProductos.get("/", (peticion, respuesta) => {
  respuesta.render('formulario', {});
}); 


rutaProductos.get("/productoRandom", (peticion, respuesta) => {
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  leerarchivo().then(() => {
    getByID(getRandomInt(1, Arreglodeproductos.length)).then(() => {
      respuesta.json(objetobuscado);
    });
  });
});

rutaProductos.get("/productos/:id", (peticion, respuesta) => {
  const id = parseInt(peticion.params.id);

  leerarchivo().then(() => {
    getByID(id).then(() => {
      if (objetobuscado) {
        respuesta.json(objetobuscado);
      } else {
        respuesta.status(404);
        respuesta.json({ error: "producto no encontrado" });
      }
    });
  });
});



rutaProductos.post("/productos", (peticion, respuesta) => {
  const producto = peticion.body;
  Save(producto).then(() => {
      respuesta.render('formulario', {});
  });
}); 

rutaProductos.put("/productos/:id", (peticion, respuesta) => {
  const id = parseInt(peticion.params.id);

  const Objeto = peticion.body;

  leerarchivo().then(() => {
    getByID(id).then(() => {
      if (objetobuscado) {
        deleteByID(id).then(() => {
          leerarchivo()
            .then(() => {
              const Objetox = {
                ...Objeto,
                id: id,
              };

              Arreglodeproductos.push(Objetox);
            })
            .then(() => {
              fs.promises.writeFile(
                "./public/productos.json",
                JSON.stringify(Arreglodeproductos, 1, "\n")
              );
            });
        });

        respuesta.json("producto actualizado");
      } else {
        respuesta.status(404);
        respuesta.json({ error: "producto no encontrado" });
      }
    });
  });
});

rutaProductos.delete("/productos/:id", (peticion, respuesta) => {
  const id = parseInt(peticion.params.id);

  leerarchivo().then(() => {
    deleteByID(id).then(() => {
      if (objetobuscado) {
        respuesta.json("producto eliminado");
      } else {
        respuesta.status(404);
        respuesta.json({ error: "producto no encontrado" });
      }
    });
  });
});

//carrito

rutaCarrito.post("/carrito/", (peticion, respuesta) => {
  
  const productocarrito = peticion.body;
  Savecarrito(productocarrito).then(()=>{
    respuesta.send(productocarrito)
  })
  
}); 

rutaCarrito.delete("/carrito/:id", (peticion, respuesta) => {

  const id = parseInt(peticion.params.id);
  leerarchivocarrito().then(() => {
    deleteByIDcarrito(id).then(() => {
      if (objetobuscado) {
        respuesta.json("producto eliminado");
      } else {
        respuesta.status(404);
        respuesta.json({ error: "producto no encontrado" });
      }
    });
  });
  
  
}); 

rutaCarrito.get("/carrito/:id/productos", (peticion, respuesta) => {
  const id = parseInt(peticion.params.id);

  leerarchivocarrito().then(() => {
    getByIDcarrito(id).then(() => {
      if (objetobuscado) {
        respuesta.json(objetobuscado.productos);
      } else {
        respuesta.status(404);
        respuesta.json({ error: "producto no encontrado" });
      }
    });
  });
});

rutaCarrito.post("/carrito/:id/productos", (peticion, respuesta) => {
  const id = parseInt(peticion.params.id);
  const productoaagregar= peticion.body

  leerarchivocarrito().then(() => {
    getByIDcarrito(id).then(() => {
      if (objetobuscado) {
        objetobuscado.productos.push(productoaagregar)
        console.log(objetobuscado)
        fs.promises.writeFile(
          "./public/carrito.json",
          JSON.stringify(carrito, 1, "\n")
        );
        respuesta.json(carrito);
      } else {
        respuesta.status(404);
        respuesta.json({ error: "producto no encontrado" });
      }
    });
  });
});

rutaCarrito.delete("/carrito/:id/productos/:id_prod", (peticion, respuesta) => {

  const id = parseInt(peticion.params.id);
  const id_prod = parseInt(peticion.params.id_prod);

  leerarchivocarrito().then(() => {
    getByIDcarrito(id).then(() => {
      if (objetobuscado) {
        objetobuscado.productos.splice(
          objetobuscado.productos.findIndex((a)=>a.id=== id_prod),
          1
        )
        console.log(objetobuscado)
        fs.promises.writeFile(
          "./public/carrito.json",
          JSON.stringify(carrito, 1, "\n")
        );
        respuesta.json(carrito);
      } else {
        respuesta.status(404);
        respuesta.json({ error: "producto no encontrado" });
      }
    });
  });
  
  
}); 

////////// Carpeta public visible

aplicacion.use(express.static(__dirname + "/public"));

const conexionServidor = aplicacion.listen(PUERTO, () => {
  console.log(
    `Aplicación escuchando en el puerto: ${conexionServidor.address().port}`
  );
});

conexionServidor.on("error", (error) =>
  console.log(`Ha ocurrido un error: ${error}`)
);

////Funciones

async function leerarchivo() {
  try {
    if ((contenido = await fs.promises.readFile("./public/productos.json", "utf-8"))) {
      archivo = JSON.parse(contenido);
      Arreglodeproductos = archivo;
      idproductos = Arreglodeproductos.length + 1;
    } else {
      Arreglodeproductos = [];
    }
  } catch (error) {
    console.log("error de lectura del archivo", error);
  }
}

async function Save(Objeto) {
  try {
    await leerarchivo();

    Objeto = {
      ...Objeto,
      id: idproductos,
      timestamp: dateStr
    };

    console.log("el ID del producto agregado es", idproductos);

    Arreglodeproductos.push(Objeto);

    await fs.promises.writeFile(
      "./public/productos.json",
      JSON.stringify(Arreglodeproductos, 1, "\n")
    );
  } catch (error) {
    console.log("hubo un error no se pudo guardar el ojbeto");
  }
}

async function getByID(idabuscar) {
  try {
    await leerarchivo();

    if (
      (objetobuscado = Arreglodeproductos.find(({ id }) => id === idabuscar))
    ) {
      return objetobuscado;
      // console.log(objetobuscado)
    } else {
      console.log(null);
    }
  } catch (error) {
    console.log("error al buscar el id");
  }
}

async function getAll() {
  await leerarchivo();

  return Arreglodeproductos;

  console.log(Arreglodeproductos);
}

async function deleteByID(idabuscar) {
  try {
    await leerarchivo();

    if (
      (objetobuscado = Arreglodeproductos.find(({ id }) => id === idabuscar))
    ) {
      Arreglodeproductos.splice(
        Arreglodeproductos.findIndex((a) => a.id === idabuscar),
        1
      );

      await fs.promises.writeFile(
        "./public/productos.json",
        JSON.stringify(Arreglodeproductos, 1, "\n")
      );

      return objetobuscado;
    } else {
      console.log("no existe ese archivo para borrar");
    }
  } catch (error) {
    console.log("error al buscar el id");
  }
}

async function deleteAll() {
  try {
    await leerarchivo();

    if (Arreglodeproductos) {
      Arreglodeproductos = [];

      await fs.promises.writeFile(
        "./public/productos.json",
        JSON.stringify(Arreglodeproductos, 1, "\n")
      );
    } else {
      console.log("no existen archivos para borrar");
    }
  } catch (error) {
    console.log("error al buscar el id");
  }
}

//Funciones para el carrito


async function leerarchivocarrito() {
  try {
    if ((contenido = await fs.promises.readFile("./public/carrito.json", "utf-8"))) {
      archivocarrito = JSON.parse(contenido);
      carrito = archivocarrito;
    } else {
      carrito = [];
    }
  } catch (error) {
    console.log("error de lectura del archivo", error);
  }
}

async function Savecarrito(Objeto) { 
  try { 

    await leerarchivocarrito();

    if (carrito.length>0) {
      idcarrito=carrito.length+1

      Carritodelusuario = {
        id: idcarrito,
        ...Objeto,
      };
  
      carrito.push(Carritodelusuario);
  
      await fs.promises.writeFile(
        "./public/carrito.json",
        JSON.stringify(carrito, 1, "\n")
      );
      
    } else {
    
    Carritodelusuario = {
      id: idcarrito,
      ...Objeto,
    };

    carrito.push(Carritodelusuario);

    await fs.promises.writeFile(
      "./public/carrito.json",
      JSON.stringify(carrito, 1, "\n")
    );
      
    }
    
  } catch (error) {
    console.log(error);
  }
}

 async function getByIDcarrito(idabuscar) {
  try {
    await leerarchivocarrito();

    if (
      (objetobuscado = carrito.find(({ id }) => id === idabuscar))
    ) {
      return objetobuscado;
      // console.log(objetobuscado)
    } else {
      console.log(null);
    }
  } catch (error) {
    console.log("error al buscar el id");
  }
}

async function getAllcarrito() {
  await leerarchivocarrito();

  return carrito;

}

async function deleteByIDcarrito(idabuscar) {
  try {
    await leerarchivocarrito();

    if (
      (objetobuscado = carrito.find(({ id }) => id === idabuscar))
    ) {
      carrito.splice(
        carrito.findIndex((a) => a.id === idabuscar),
        1
      );

      await fs.promises.writeFile(
        "./public/carrito.json",
        JSON.stringify(carrito, 1, "\n")
      );

      return objetobuscado;
    } else {
      console.log("no existe ese archivo para borrar");
    }
  } catch (error) {
    console.log("error al buscar el id");
  }
}

async function deleteAllcarrito() {
  try {
    await leerarchivocarrito();

    if (carrito) {
      carrito = [];

      await fs.promises.writeFile(
        "./public/carrito.json",
        JSON.stringify(carrito, 1, "\n")
      );
    } else {
      console.log("no existen archivos para borrar");
    }
  } catch (error) {
    console.log("error al buscar el id");
  }
}
 


