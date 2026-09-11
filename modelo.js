/*
  MODELO DE DATOS
  ----------------
  Aquí NO hay nada de HTML. Esto es a propósito: la hoja de cálculo "de verdad"
  vive en esta estructura de datos. El DOM (la tabla que ve el usuario) es solo
  una FOTO de este estado. Cuando algo cambia aquí, ui.js se encarga de
  redibujar la foto.

  Elegimos representar la hoja como un OBJETO cuyas llaves son nombres de celda
  tipo "A1", "B2", etc. en vez de una matriz [fila][columna].
  ¿Por qué? Porque una fórmula como "=A1+B2" ya viene expresada con nombres de
  celda, así que si el modelo también usa esos nombres como llave, no hay que
  estar convirtiendo entre "fila 0, columna 0" y "A1" todo el tiempo.
*/

const NUM_FILAS = 15;
const NUM_COLUMNAS = 10;

// El estado completo de la hoja: { "A1": "10", "B2": "=A1+5", ... }
// Guardamos el contenido CRUDO tal como lo escribió el usuario (texto o fórmula).
const celdas = {};

// Convierte un índice de columna (0,1,2...) a letra (A,B,C...,Z,AA,AB...)
function indiceALetra(indice) {
  let letra = "";
  indice = indice + 1;
  while (indice > 0) {
    let resto = (indice - 1) % 26;
    letra = String.fromCharCode(65 + resto) + letra;
    indice = Math.floor((indice - 1) / 26);
  }
  return letra;
}

// Construye el nombre de celda a partir de fila (0-indexada) y columna (0-indexada)
function nombreCelda(fila, columna) {
  return indiceALetra(columna) + (fila + 1);
}

// Obtiene el contenido crudo de una celda (lo que escribió el usuario)
function obtenerContenido(nombre) {
  return celdas[nombre] !== undefined ? celdas[nombre] : "";
}

// Guarda el contenido crudo de una celda
function establecerContenido(nombre, valor) {
  celdas[nombre] = valor;
}
