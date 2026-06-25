let transactions = [];

const descInput   = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeSelect  = document.getElementById('type');
const addBtn      = document.getElementById('add-btn');
const listEl      = document.getElementById('list');
const incomeEl    = document.getElementById('income');
const expenseEl   = document.getElementById('expense');
const balanceEl   = document.getElementById('balance');
const canvas      = document.getElementById('finance-chart');
const downloadCSV = document.getElementById('csv-file');

function addTransaction() {
    const desc   = descInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type   = typeSelect.value;

    if (!desc || isNaN(amount) || amount <= 0) {
        // Simple validation — could be replaced with inline error messages
        alert('Please enter a description and a valid positive amount.');
        return;
    }

    const now = new Date();
    const date = now.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });

    transactions.unshift({
        id: Date.now(),
        desc,
        amount,
        type,
        date,
    });

    // Clear the inputs after adding
    descInput.value  = '';
    amountInput.value = '';
    descInput.focus();

    saveTransactions();

    render();
}

function formatCurrency(amount) {
    return '₱' + amount.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function renderList() {
    if (transactions.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No transactions yet. Add one above.</p>';
        return;
    }

    listEl.innerHTML = transactions.map(t => {
        const isIncome  = t.type === 'Income';
        const iconClass = isIncome ? 'income' : 'expense';
        const icon      = isIncome ? '↓' : '↑';
        const sign      = isIncome ? '+' : '−';

        return `
            <div class="tx-item" data-id="${t.id}">
                <div class="tx-icon ${iconClass}">${icon}</div>
                <div class="tx-desc">
                    <div class="name">${t.desc}</div>
                    <div class="date">${t.date}</div>
                </div>
                <span class="tx-amount ${iconClass}">${sign}${formatCurrency(t.amount)}</span>
                <button class="remove-btn">Remove</button>
            </div>
        `;
    }).join('');
}


function renderSummary() {
    const income  = transactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    incomeEl.textContent  = formatCurrency(income);
    expenseEl.textContent = formatCurrency(expense);
    balanceEl.textContent = formatCurrency(balance);

    // Positive balance = green, negative = red
    balanceEl.style.color = balance >= 0 ? '#3B6D11' : '#A32D2D';
}


function render() {
    renderList();
    renderSummary();
    loadChart();
}


addBtn.addEventListener('click', addTransaction);

// Allow pressing Enter in any input to trigger add
descInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTransaction(); });
amountInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTransaction(); });

listEl.addEventListener('click', (e) => {

    if(e.target.classList.contains('remove-btn')) {
        const txItem = e.target.closest('.tx-item');
        const id = Number(txItem.dataset.id);

        transactions = transactions.filter(t => t.id !== id);

        saveTransactions();
        render();
    }
});

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function loadTransactions() {
    const savedTransactions = localStorage.getItem('transactions');

    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    }
}

let chart;
function loadChart() {
    const labels = transactions.map(t => t.desc);
    const amounts = transactions.map(t => t.amount);
    if (!chart) {
        chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Amount',
                    data: amounts
                }]
            }
        }); 
    }

    chart.data.labels = labels;
    chart.data.datasets[0].data = amounts;

    chart.update();
}

function exportCSV() {
    let csv = "Description,Amount,Type\n";

    transactions.forEach(t => {
        csv += `${t.desc},${t.amount},${t.type}\n`;
    });

    const blob = new Blob([csv], {
        type: "text/csv"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "transactions.csv";

    a.click();

    URL.revokeObjectURL(url);
}

downloadCSV.addEventListener('click', exportCSV);

loadTransactions();
render();