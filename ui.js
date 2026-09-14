
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


  let yaConfirmado = false;
  const confirmar = () => {
    if (yaConfirmado) return;
    yaConfirmado = true;
    establecerContenido(nombre, input.value);
    actualizarCeldaYCadena(nombre);
  };

  input.addEventListener("blur", confirmar);

  input.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
      evento.preventDefault();
      confirmar();
      moverEdicion(nombre, 1, 0);
    } else if (evento.key === "Tab") {
      evento.preventDefault();
      confirmar();
      moverEdicion(nombre, 0, 1);
    }
  });
}


function moverEdicion(nombreActual, deltaFila, deltaColumna) {
  const posicion = parsearReferencia(nombreActual);
  const filaDestino = posicion.fila + deltaFila;
  const columnaDestino = posicion.columna + deltaColumna;

  if (
    filaDestino < 0 ||
    filaDestino >= NUM_FILAS ||
    columnaDestino < 0 ||
    columnaDestino >= NUM_COLUMNAS
  ) {
    return;
  }

  const nombreDestino = nombreCelda(filaDestino, columnaDestino);
  const tdDestino = document.getElementById("celda-" + nombreDestino);
  activarEdicion(tdDestino, nombreDestino);
}

function mostrarCelda(nombre) {
  const td = document.getElementById("celda-" + nombre);
  const contenido = obtenerContenido(nombre);
  td.classList.remove("celda-error", "celda-negativa");

  let valorNumerico = null; // se usa solo para decidir el resaltado condicional

  if (contenido.startsWith("=")) {
    try {
      const pilaEvaluacion = new Set([nombre]);
      const resultado = evaluarExpresion(contenido.slice(1), pilaEvaluacion);
      td.textContent = resultado;
      valorNumerico = resultado;
    } catch (error) {
      td.classList.add("celda-error");
      if (error.message === "REF_CIRCULAR") {
        td.textContent = "#CIRC!";
      } else if (error.message === "#DIV/0!") {
        td.textContent = "#DIV/0!";
      } else if (error.message === "REFERENCIA_INEXISTENTE") {
        td.textContent = "#REF!";
      } else {
        td.textContent = "#ERROR!";
      }
    }
  } else {
    td.textContent = contenido;
    if (contenido !== "" && !isNaN(parseFloat(contenido))) {
      valorNumerico = parseFloat(contenido);
    }
  }

  if (valorNumerico !== null && valorNumerico < 0) {
    td.classList.add("celda-negativa");
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

  guardarEnLocalStorage(); 
}


const LLAVE_GUARDADO = "hojaclara_datos";

function guardarEnLocalStorage() {
  localStorage.setItem(LLAVE_GUARDADO, JSON.stringify(celdas));
}


function cargarDesdeLocalStorage() {
  const guardado = localStorage.getItem(LLAVE_GUARDADO);
  if (!guardado) return;

  const datos = JSON.parse(guardado);

  Object.keys(datos).forEach((nombre) => {
    establecerContenido(nombre, datos[nombre]);
  });

  Object.keys(datos).forEach((nombre) => {
    const contenido = datos[nombre];
    const dependencias = contenido.startsWith("=")
      ? extraerDependencias(contenido.slice(1))
      : [];
    actualizarDependencias(nombre, dependencias);
  });

  Object.keys(datos).forEach((nombre) => mostrarCelda(nombre));
}


function exportarCSV() {
  const filas = [];

  for (let f = 0; f < NUM_FILAS; f++) {
    const valoresFila = [];
    for (let c = 0; c < NUM_COLUMNAS; c++) {
      const nombre = nombreCelda(f, c);
      const td = document.getElementById("celda-" + nombre);
      let valor = td ? td.textContent : "";

      if (valor.includes(",") || valor.includes('"')) {
        valor = '"' + valor.replace(/"/g, '""') + '"';
      }
      valoresFila.push(valor);
    }
    filas.push(valoresFila.join(","));
  }

  const contenidoCSV = filas.join("\n");
  const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "hojaclara.csv";
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

// Arrancar la aplicación
document.addEventListener("DOMContentLoaded", () => {
  generarCuadricula();
  cargarDesdeLocalStorage();

  const botonExportar = document.getElementById("boton-exportar");
  if (botonExportar) {
    botonExportar.addEventListener("click", exportarCSV);
  }
});
