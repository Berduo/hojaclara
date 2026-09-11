
function generarCuadricula() {
  const contenedor = document.getElementById("contenedor-hoja");
  const tabla = document.createElement("table");
  tabla.id = "hoja";

  // --- Fila de encabezados de columna: "", A, B, C, ... ---
  const filaEncabezados = document.createElement("tr");
  const thVacio = document.createElement("th");
  filaEncabezados.appendChild(thVacio);

  for (let col = 0; col < NUM_COLUMNAS; col++) {
    const th = document.createElement("th");
    th.textContent = indiceALetra(col);
    filaEncabezados.appendChild(th);
  }
  tabla.appendChild(filaEncabezados);

  // --- Filas de datos: encabezado numérico + celdas editables ---
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

// Convierte una celda de "modo lectura" a "modo edición" con un <input>
function activarEdicion(td, nombre) {
  // Si ya hay un input abierto en esta celda, no hacer nada
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
    mostrarCelda(nombre);
  };

  input.addEventListener("blur", confirmar);
  input.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") input.blur();
  });
}

// Redibuja el contenido visible de una celda a partir del modelo.
// Nivel 3: si el contenido empieza con "=", es una fórmula: se le quita el
// "=" y se manda al evaluador. Si no, se muestra tal cual (texto o número).
function mostrarCelda(nombre) {
  const td = document.getElementById("celda-" + nombre);
  const contenido = obtenerContenido(nombre);
  td.classList.remove("celda-error");

  if (contenido.startsWith("=")) {
    try {
      const resultado = evaluarExpresion(contenido.slice(1));
      td.textContent = resultado;
    } catch (error) {
      td.classList.add("celda-error");
      td.textContent = "#ERROR!";
    }
  } else {
    td.textContent = contenido;
  }
}

// Arrancar la aplicación
document.addEventListener("DOMContentLoaded", generarCuadricula);