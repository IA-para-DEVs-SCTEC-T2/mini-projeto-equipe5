const numeros = [1, 2, 3, 4, 5, 5, 3, 7];

/**
 * Verifica duplicatas em uma lista de inteiros usando filter.
 * @param {number[]} lista - Lista de inteiros a verificar.
 * @returns {{ temDuplica: boolean, duplicatas: number[] }}
 */
function verificarDuplicatas(lista) {
    const duplicatas = lista.filter((num, index) => lista.indexOf(num) !== index);
    const unicas = [...new Set(duplicatas)];

    return {
        temDuplica: unicas.length > 0,
        duplicatas: unicas,
    };
}

const resultado = verificarDuplicatas(numeros);

if (resultado.temDuplica) {
    console.log("Duplicatas encontradas:", resultado.duplicatas);
} else {
    console.log("Nenhuma duplicata encontrada.");
}
