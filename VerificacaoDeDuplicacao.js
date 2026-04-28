numero = [1, 2, 3, 4, 5, 5]


function temDuplica() {
    
for (let i = 0; i < numero.length; i++) {

    for (let j = i + 1; j < numero.length; j++) {
            if (numero[i] === numero[j]) {

                console.log("Eu, o Robo, achei o número repetido.")

                return true; 
            }
        }
    }
    return false;
}

temDuplica()