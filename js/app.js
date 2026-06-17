const transactions = [];

const form = document.getElementById('transaction-form');
const description = form.querySelector('#description');
const amount = form.querySelector('#amount');
const type = form.querySelector('#type');
const transactionList = document.getElementById('transaction-list');
const list = transactionList.querySelector('#list');

const summary = document.getElementById('transaction-summary');
const summaryList = summary.querySelector('#summary');
const income = summaryList.querySelector('#income');
const expense = summaryList.querySelector('#expense');
const balance = summaryList.querySelector('#balance');


form.addEventListener('submit', (event) => {
    event.preventDefault();

    const transaction = {
        id: Date.now(),
        description: description.value,
        amount: Number(amount.value),
        type: type.value
    };
    transactions.push(transaction);
    console.log(transactions);
    refreshUI();

    form.reset();
});

function renderTransactions() {
    list.innerHTML = transactions
        .map(transaction => `
            <div class="transaction">
                <span>
                    ${transaction.description}
                    -
                    ${transaction.amount}
                    -
                    ${transaction.type}
                </span>

                <button data-transaction-id="${transaction.id}">
                    Delete
                </button>
            </div>
        `).join('');
}

function updateSummary() {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
        if (transaction.type === 'Expense') {
            totalExpense += transaction.amount;
        }
        else {
            totalIncome += transaction.amount;
        }
    });
    
    const totalBalance = totalIncome - totalExpense;

    income.textContent = totalIncome;
    expense.textContent = totalExpense;
    balance.textContent = totalBalance;

    //console.log(mySummary.balance);
}

list.addEventListener('click', (event) => {
    if (event.target.tagName !== 'BUTTON') return;

    const id = Number(event.target.dataset.transactionId);

    const index = transactions.findIndex(
        transaction => transaction.id === id
    );

    if (index !== -1) {
        transactions.splice(index, 1);

        refreshUI();
    }
});

function refreshUI() {
    renderTransactions();
    updateSummary();
}