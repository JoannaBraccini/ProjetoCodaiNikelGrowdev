const myModal = new bootstrap.Modal("#transaction-modal");
let logged = sessionStorage.getItem("logged");
const session = localStorage.getItem("session");
let data = {
    transactions: []
};

document.getElementById("button-logout").addEventListener("click", logout);
document.getElementById("transactions-button").addEventListener("click", function() {
    window.location.href = ("transactions.html")
});

//Adicionar Lançamento
document.getElementById("transaction-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const value = parseFloat(document.getElementById("value-input").value); //parseFloat transforma o dado em número que possa ter vírgula
    const description = document.getElementById("description-input").value;
    const date = document.getElementById("date-input").value;
    const type = document.querySelector('input[name="type-input"]:checked').value; //query seleciona itens específicos---checked para pegar o marcado
      
    data.transactions.unshift({ //push adiciona ao final da lista, unshift adiciona ao topo da lista
        value: value, type: type, description: description, date: date
    });

    if (!checkBalance()) {
        e.target.reset();
        return;
    }

    //Ordenar as transações por data
    sortTransactionsByDate();

    saveData(data);
    e.target.reset();
    myModal.hide();

    getCashIn();
    getCashOut();
    getTotal();

    alert("Lançamento adicionado com sucesso.");

});

checkLogged();

function checkLogged() {
    if(session) {
        sessionStorage.setItem("logged", session);
        logged = session;
    }

    if(!logged) {
        window.location.href = "index.html";
        return;
    }

    const dataUser = localStorage.getItem(logged);
    if(dataUser) {
        data = JSON.parse(dataUser);        
        sortTransactionsByDate(); //Ordenar as transações por data
    }   
    
    getCashIn();
    getCashOut();
    getTotal();
}

function logout() {
    sessionStorage.removeItem("logged");
    localStorage.removeItem("session");

    window.location.href = "index.html";
}

function getCashIn() {
    const transactions = data.transactions
    const cashIn = transactions.filter((item) => item.type === "1"); //filter separa de acordo com o parâmetro

    if(cashIn.length) {
        let cashInHtml = ``;
        let limit = 0;

        if(cashIn.length > 5) {
            limit = 5;
        } else {
            limit = cashIn.length;
        }

        for (let index = 0; index < limit; index++) { //executa o que estiver no escopo pelo número de vezes estipulado (limit)
            // += adiciona ao que já tem
            cashInHtml += `
            <div class="row mb-4">
                <div class="col-12">
                    <h3 class="fs-2">R$ ${cashIn[index].value.toFixed(2)}</h3>
                    <div class="container p-0">
                        <div class="row">
                            <div class="col-12 col-md-8">
                                <p>${cashIn[index].description}</p>
                            </div>
                            <div class="col-12 col-md-3 d-flex justify-content-end">
                                ${cashIn[index].date}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `            
        }
        document.getElementById("cash-in-list").innerHTML = cashInHtml; // inner html = dentro do elemento
    }
}

function getCashOut() {
    const transactions = data.transactions
    const cashOut = transactions.filter((item) => item.type === "2");

    if(cashOut.length) {
        let cashOutHtml = ``;
        let limit = 0;

        if(cashOut.length > 5) {
            limit = 5;
        } else {
            limit = cashOut.length;
        }

        for (let index = 0; index < limit; index++) {
            cashOutHtml += `
            <div class="row mb-4">
                <div class="col-12">
                    <h3 class="fs-2">R$ ${cashOut[index].value.toFixed(2)}</h3>
                    <div class="container p-0">
                        <div class="row">
                            <div class="col-12 col-md-8">
                                <p>${cashOut[index].description}</p>
                            </div>
                            <div class="col-12 col-md-3 d-flex justify-content-end">
                                ${cashOut[index].date}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `            
        }
        document.getElementById("cash-out-list").innerHTML = cashOutHtml;
    }
}

function checkBalance() {
    const totalBalance = data.transactions.reduce((acc, item) => acc + (item.type === "1" ? item.value : -item.value), 0);
    const type = document.querySelector('input[name="type-input"]:checked').value;

    if (type === "1") {
        // Se for uma entrada, registrar a operação independentemente do saldo
        return true;
    }

    if (totalBalance < 0) {
        const confirmacao = confirm("Atenção. Seu saldo após cadastrar essa despesa será negativo, deseja continuar?");

        if (!confirmacao) {
            alert("Operação cancelada.");
            // Desfazer a última transação adicionada
            data.transactions.shift();  // Remove o primeiro elemento do array
            return false;
        }
    }

    return true;  // Registrar a operação se o saldo não for negativo ou se for uma entrada
}

function getTotal() {
    const transactions = data.transactions;
    let total = 0;

    transactions.forEach((item) => {
        if(item.type === "1") {
            total += item.value;
        } else {
            total -= item.value;
        }

    });
    
    document.getElementById("total").innerHTML = `R$ ${total.toFixed(2)}`
}

function saveData(data) {
    localStorage.setItem(data.login, JSON.stringify(data));
}

function sortTransactionsByDate() {
    data.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}
