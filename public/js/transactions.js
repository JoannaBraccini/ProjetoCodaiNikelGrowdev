const myModal = new bootstrap.Modal("#transaction-modal");
let logged = sessionStorage.getItem("logged");
const session = localStorage.getItem("session");
let data = {
    transactions: []
};

document.getElementById("button-logout").addEventListener("click", logout);

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

    getTransactions();

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

    getTransactions();

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

function logout() {
    sessionStorage.removeItem("logged");
    localStorage.removeItem("session");

    window.location.href = "index.html";
}

function sortTransactionsByDate() {
    data.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function saveData(data) {
    localStorage.setItem(data.login, JSON.stringify(data));
}

function getTransactions() {
    const transactions = data.transactions;
    let transactionsHtml = ``;

    if(transactions.length) {
        transactions.forEach((item) => {
            let type = "Entrada";

            if(item.type === "2") {
                type = "Saída";
            }

            transactionsHtml += `
                <tr>
                    <th scope="row">${item.date}</th>
                    <td>${item.value.toFixed(2)}</td>
                    <td>${type}</td>
                    <td>${item.description}</td>
                </tr>
            `
        })
    }

    document.getElementById("transactions-list").innerHTML = transactionsHtml;
}