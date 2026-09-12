

function generarCuadricula() {
  const contenedor = document.getElementById("contenedor-hoja");
  const tabla = document.createElement("table");
  tabla.id = "hoja";

  const filaEncabezados = document.createElement("tr");
  const thVacio = document.createElement("th");
  filaEncabezados.appendChild(thVacio);

  for (let col = 0; col < NUM_COLUMNAS; col++) {
    const th = document.createElement("th");
    th.textContent = indiceALetra(col);
    filaEncabezados.appendChild(th);
  }
  tabla.appendChild(filaEncabezados);

  for (let fila = 0; fila < NUM_FILAS; fila++) {
    const tr = document.createElement("tr");

    const thNumero = document.createElement("th");
    thNumero.textContent = fila + 1;
    tr.appendChild(thNumero);

    for (let col = 0; col < NUM_COLUMNAS; col++) {
      const nombre = nombreCelda(fila, col);
      const td = document.createElement("td");
      td.className = "celda";
      td.id = "celda-" + nombre;
      td.dataset.nombre = nombre;

      td.addEventListener("dblclick", () => activarEdicion(td, nombre));

      tr.appendChild(td);
    }
    tabla.appendChild(tr);
  }

  contenedor.appendChild(tabla);
}

function activarEdicion(td, nombre) {
  if (td.querySelector("input")) return;

  const valorActual = obtenerContenido(nombre);
  td.textContent = "";

  const input = document.createElement("input");
  input.type = "text";
  input.value = valorActual;
  td.appendChild(input);
  input.focus();

  const confirmar = () => {
    establecerContenido(nombre, input.value);
    actualizarCeldaYCadena(nombre);
  };

  input.addEventListener("blur", confirmar);
  input.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") input.blur();
  });
}


function mostrarCelda(nombre) {
  const td = document.getElementById("celda-" + nombre);
  const contenido = obtenerContenido(nombre);
  td.classList.remove("celda-error");

  if (contenido.startsWith("=")) {
    try {
      
      const pilaEvaluacion = new Set([nombre]);
      const resultado = evaluarExpresion(contenido.slice(1), pilaEvaluacion);
      td.textContent = resultado;
    } catch (error) {
      td.classList.add("celda-error");
      if (error.message === "REF_CIRCULAR") {
        td.textContent = "#CIRC!";
      } else if (error.message === "#DIV/0!") {
        td.textContent = "#DIV/0!";
      } else {
        td.textContent = "#ERROR!";
      }
    }
  } else {
    td.textContent = contenido;
  }
}


function actualizarCeldaYCadena(nombre) {
  const contenido = obtenerContenido(nombre);
  const nuevasDependencias = contenido.startsWith("=")
    ? extraerDependencias(contenido.slice(1))
    : [];

  actualizarDependencias(nombre, nuevasDependencias);

  mostrarCelda(nombre);

  const cadena = obtenerDependientesEnCadena(nombre);
  cadena.forEach(mostrarCelda);
}


document.addEventListener("DOMContentLoaded", generarCuadricula);
