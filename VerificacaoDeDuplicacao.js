numeroLista = [1, 2, 3, 4, 5, 5, 4,3,2,5,645,123,342,52,23,12345,434,234,432,234,122]


// function temDuplica() {
    
// for (let i = 0; i < numeroLista.length; i++) {

//     for (let j = i + 1; j < numeroLista.length; j++) {
//             if (numeroLista[i] === numeroLista[j]) {

//                 console.log("Eu, o Robo, achei o número repetido.")

//                 return true; 
//             }
//         }
//     }
//     return false;
// }

// temDuplica()


function temDuplicatas(listagem){

    const numerosVistos = new Set()
    const numerosDuplicados = new Set()
    for (const num of listagem){
        if (numerosVistos.has(num)){
            numerosDuplicados.add(num)
        }else{
            numerosVistos.add(num)
        }
    }
    return { temDuplicatas: numerosDuplicados.size > 0, numerosDuplicados: [...numerosDuplicados] }
}

temDuplicatas(numeroLista)