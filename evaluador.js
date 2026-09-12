
function tokenizar(expresion) {
  const tokens = [];
  let i = 0;

  while (i < expresion.length) {
    const c = expresion[i];

    if (c === " ") {
      i++;
      continue;
    }

    if (/[0-9.]/.test(c)) {
      let numero = "";
      while (i < expresion.length && /[0-9.]/.test(expresion[i])) {
        numero += expresion[i];
        i++;
      }
      tokens.push({ tipo: "NUMERO", valor: parseFloat(numero) });
      continue;
    }

  
    if (/[A-Za-z]/.test(c)) {
      let letras = "";
      while (i < expresion.length && /[A-Za-z]/.test(expresion[i])) {
        letras += expresion[i];
        i++;
      }

      if (i < expresion.length && /[0-9]/.test(expresion[i])) {
        let numeros = "";
        while (i < expresion.length && /[0-9]/.test(expresion[i])) {
          numeros += expresion[i];
          i++;
        }
        tokens.push({ tipo: "REFERENCIA", valor: (letras + numeros).toUpperCase() });
      } else {
        tokens.push({ tipo: "IDENTIFICADOR", valor: letras.toUpperCase() });
      }
      continue;
    }

    if ("+-*/():".includes(c)) {
      tokens.push({ tipo: "OPERADOR", valor: c });
      i++;
      continue;
    }

    throw new Error("Caracter inesperado: " + c);
  }

  return tokens;
}


function evaluarExpresion(texto, pilaEvaluacion) {
  if (!pilaEvaluacion) pilaEvaluacion = new Set();

  const tokens = tokenizar(texto);
  const posicion = { i: 0 };
  const resultado = expresion(tokens, posicion, pilaEvaluacion);

  if (posicion.i < tokens.length) {
    throw new Error("Fórmula mal escrita: sobran caracteres");
  }
  return resultado;
}

function expresion(tokens, pos, pilaEvaluacion) {
  let valor = termino(tokens, pos, pilaEvaluacion);

  while (
    pos.i < tokens.length &&
    (tokens[pos.i].valor === "+" || tokens[pos.i].valor === "-")
  ) {
    const operador = tokens[pos.i].valor;
    pos.i++;
    const derecho = termino(tokens, pos, pilaEvaluacion);
    valor = operador === "+" ? valor + derecho : valor - derecho;
  }
  return valor;
}

function termino(tokens, pos, pilaEvaluacion) {
  let valor = factor(tokens, pos, pilaEvaluacion);

  while (
    pos.i < tokens.length &&
    (tokens[pos.i].valor === "*" || tokens[pos.i].valor === "/")
  ) {
    const operador = tokens[pos.i].valor;
    pos.i++;
    const derecho = factor(tokens, pos, pilaEvaluacion);
    if (operador === "/") {
      if (derecho === 0) throw new Error("#DIV/0!");
      valor = valor / derecho;
    } else {
      valor = valor * derecho;
    }
  }
  return valor;
}

function factor(tokens, pos, pilaEvaluacion) {
  const actual = tokens[pos.i];

  if (!actual) throw new Error("Fórmula incompleta");

  if (actual.tipo === "NUMERO") {
    pos.i++;
    return actual.valor;
  }

  
  if (actual.tipo === "REFERENCIA") {
    pos.i++;
    return obtenerValorCelda(actual.valor, pilaEvaluacion);
  }


  if (actual.tipo === "IDENTIFICADOR") {
    const nombreFuncion = actual.valor;
    pos.i++;

    if (!tokens[pos.i] || tokens[pos.i].valor !== "(") {
      throw new Error("Se esperaba '(' después de " + nombreFuncion);
    }
    pos.i++; // consumir "("

    const inicio = tokens[pos.i];
    if (!inicio || inicio.tipo !== "REFERENCIA") {
      throw new Error("Se esperaba una referencia de celda en " + nombreFuncion);
    }
    pos.i++;

    if (!tokens[pos.i] || tokens[pos.i].valor !== ":") {
      throw new Error("Se esperaba ':' para formar un rango");
    }
    pos.i++;

    const fin = tokens[pos.i];
    if (!fin || fin.tipo !== "REFERENCIA") {
      throw new Error("Rango incompleto en " + nombreFuncion);
    }
    pos.i++;

    if (!tokens[pos.i] || tokens[pos.i].valor !== ")") {
      throw new Error("Falta ')' en " + nombreFuncion);
    }
    pos.i++; // consumir ")"

    const nombresEnRango = celdasEnRango(inicio.valor, fin.valor);
    const valoresEnRango = nombresEnRango.map((nombreCelda) =>
      obtenerValorCelda(nombreCelda, pilaEvaluacion)
    );

    return aplicarFuncion(nombreFuncion, valoresEnRango);
  }

  if (actual.valor === "(") {
    pos.i++;
    const valor = expresion(tokens, pos, pilaEvaluacion);
    if (!tokens[pos.i] || tokens[pos.i].valor !== ")") {
      throw new Error("Falta paréntesis de cierre");
    }
    pos.i++;
    return valor;
  }

  if (actual.valor === "-") {
    pos.i++;
    return -factor(tokens, pos, pilaEvaluacion);
  }

  throw new Error("Token inesperado: " + actual.valor);
}

function aplicarFuncion(nombreFuncion, valores) {
  if (valores.length === 0) return 0;

  switch (nombreFuncion) {
    case "SUMA":
      return valores.reduce((acumulado, v) => acumulado + v, 0);
    case "PROMEDIO":
      return valores.reduce((acumulado, v) => acumulado + v, 0) / valores.length;
    case "MAX":
      return Math.max(...valores);
    case "MIN":
      return Math.min(...valores);
    default:
      throw new Error("Función desconocida: " + nombreFuncion);
  }
}

function obtenerValorCelda(nombre, pilaEvaluacion) {
  if (pilaEvaluacion.has(nombre)) {
    throw new Error("REF_CIRCULAR");
  }

  const contenido = obtenerContenido(nombre);

  if (contenido === "") return 0; 

  if (contenido.startsWith("=")) {
    pilaEvaluacion.add(nombre);
    const resultado = evaluarExpresion(contenido.slice(1), pilaEvaluacion);
    pilaEvaluacion.delete(nombre); 
    return resultado;
  }

  const numero = parseFloat(contenido);
  return isNaN(numero) ? 0 : numero;
}


function extraerDependencias(formulaTexto) {
  let tokens;
  try {
    tokens = tokenizar(formulaTexto);
  } catch (error) {
    return []; 
  }

  const dependencias = new Set();

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].tipo !== "REFERENCIA") continue;

    const siguiente = tokens[i + 1];
    const posterior = tokens[i + 2];
    const esRango =
      siguiente && siguiente.valor === ":" && posterior && posterior.tipo === "REFERENCIA";

    if (esRango) {
      celdasEnRango(tokens[i].valor, posterior.valor).forEach((c) => dependencias.add(c));
      i += 2; // ya consumimos ":" y la segunda referencia del rango
    } else {
      dependencias.add(tokens[i].valor);
    }
  }

  return Array.from(dependencias);
}
