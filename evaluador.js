 

// FASE 1: TOKENIZAR
// Recorre el string caracter por caracter y agrupa dígitos consecutivos
// en un solo token numérico. Ignora espacios.
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

    if ("+-*/()".includes(c)) {
      tokens.push({ tipo: "OPERADOR", valor: c });
      i++;
      continue;
    }

    // Cualquier otro caracter (por ahora) es inválido en este nivel
    throw new Error("Caracter inesperado: " + c);
  }

  return tokens;
}

// FASE 2: EVALUAR (descenso recursivo)
// "posicion" es un objeto { i: 0 } que compartimos por referencia entre
// las funciones para que todas avancen sobre la MISMA lista de tokens.
function evaluarExpresion(texto) {
  const tokens = tokenizar(texto);
  const posicion = { i: 0 };
  const resultado = expresion(tokens, posicion);

  if (posicion.i < tokens.length) {
    throw new Error("Fórmula mal escrita: sobran caracteres");
  }
  return resultado;
}

function expresion(tokens, pos) {
  let valor = termino(tokens, pos);

  while (
    pos.i < tokens.length &&
    (tokens[pos.i].valor === "+" || tokens[pos.i].valor === "-")
  ) {
    const operador = tokens[pos.i].valor;
    pos.i++;
    const derecho = termino(tokens, pos);
    valor = operador === "+" ? valor + derecho : valor - derecho;
  }
  return valor;
}

function termino(tokens, pos) {
  let valor = factor(tokens, pos);

  while (
    pos.i < tokens.length &&
    (tokens[pos.i].valor === "*" || tokens[pos.i].valor === "/")
  ) {
    const operador = tokens[pos.i].valor;
    pos.i++;
    const derecho = factor(tokens, pos);
    if (operador === "/") {
      if (derecho === 0) throw new Error("#DIV/0!");
      valor = valor / derecho;
    } else {
      valor = valor * derecho;
    }
  }
  return valor;
}

function factor(tokens, pos) {
  const actual = tokens[pos.i];

  if (!actual) throw new Error("Fórmula incompleta");

  if (actual.tipo === "NUMERO") {
    pos.i++;
    return actual.valor;
  }

  if (actual.valor === "(") {
    pos.i++; // consumir "("
    const valor = expresion(tokens, pos);
    if (!tokens[pos.i] || tokens[pos.i].valor !== ")") {
      throw new Error("Falta paréntesis de cierre");
    }
    pos.i++; // consumir ")"
    return valor;
  }

  if (actual.valor === "-") {
    pos.i++; // número negativo, ej. -5
    return -factor(tokens, pos);
  }

  throw new Error("Token inesperado: " + actual.valor);
}
