

const NUM_FILAS = 15;
const NUM_COLUMNAS = 10;
const celdas = {};

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


function nombreCelda(fila, columna) {
  return indiceALetra(columna) + (fila + 1);
}

function obtenerContenido(nombre) {
  return celdas[nombre] !== undefined ? celdas[nombre] : "";
}

// Guarda el contenido crudo de una celda
function establecerContenido(nombre, valor) {
  celdas[nombre] = valor;
}


function letraAIndice(letras) {
  let indice = 0;
  for (let i = 0; i < letras.length; i++) {
    indice = indice * 26 + (letras.charCodeAt(i) - 64); // 'A' = 65, así que -64 da 1
  }
  return indice - 1; 
}

function parsearReferencia(nombreReferencia) {
  const coincidencia = nombreReferencia.match(/^([A-Za-z]+)([0-9]+)$/);
  if (!coincidencia) {
    throw new Error("Referencia inválida: " + nombreReferencia);
  }
  const columna = letraAIndice(coincidencia[1].toUpperCase());
  const fila = parseInt(coincidencia[2], 10) - 1;
  return { fila, columna };
}


function celdasEnRango(nombreInicio, nombreFin) {
  const inicio = parsearReferencia(nombreInicio);
  const fin = parsearReferencia(nombreFin);
  const filaMin = Math.min(inicio.fila, fin.fila);
  const filaMax = Math.max(inicio.fila, fin.fila);
  const colMin = Math.min(inicio.columna, fin.columna);
  const colMax = Math.max(inicio.columna, fin.columna);

  const nombres = [];
  for (let f = filaMin; f <= filaMax; f++) {
    for (let c = colMin; c <= colMax; c++) {
      nombres.push(nombreCelda(f, c));
    }
  }
  return nombres;
}


const dependenciasDe = {};
const dependientes = {};

function actualizarDependencias(nombre, nuevasDependencias) {
  const anteriores = dependenciasDe[nombre] || [];
  anteriores.forEach((dep) => {
    if (dependientes[dep]) dependientes[dep].delete(nombre);
  });

  dependenciasDe[nombre] = nuevasDependencias;
  nuevasDependencias.forEach((dep) => {
    if (!dependientes[dep]) dependientes[dep] = new Set();
    dependientes[dep].add(nombre);
  });
}

function obtenerDependientesEnCadena(nombre) {
  const visitados = new Set();
  const pendientes = [nombre];

  while (pendientes.length > 0) {
    const actual = pendientes.pop();
    const hijos = dependientes[actual];
    if (hijos) {
      hijos.forEach((hijo) => {
        if (!visitados.has(hijo)) {
          visitados.add(hijo);
          pendientes.push(hijo);
        }
      });
    }
  }
  return Array.from(visitados);
}
