let customers = [];
let transactions = [];
let filteredTransactions = [];
let chart;

document.addEventListener('DOMContentLoaded', async function() {

    const customerTableBody = document.getElementById('customerTableBody');
    const customerFilter = document.getElementById('customerFilter');
    const amountFilter = document.getElementById('amountFilter');
    const transactionChartCtx = document.getElementById('transactionChart').getContext('2d');
    // Get Data From Api......................................................................
    const api1 = await fetch('http://localhost:3000/customers');
    customers = await api1.json();
        
    const api2 = await fetch('http://localhost:3000/transactions');
    transactions = await api2.json();
        
    filteredTransactions = transactions;
    renderTable();
    
    // Display Data into table....................................................................
    function renderTable() {
        let tableRows = '';
        for (let index = 0; index < filteredTransactions.length; index++) {
            const transaction = filteredTransactions[index];
            const customer = customers.find(c => c.id == transaction.customer_id);
            if (customer) {
                tableRows += `
                    <tr>
                        <td>${customer.name}</td>
                        <td>${transaction.date}</td>
                        <td>${transaction.amount}</td>
                    </tr>`;
            }
        }
        customerTableBody.innerHTML = tableRows;
    }
    // Filter Customer By Name Or Amount...................................................................
    window.filterData = function() {
        const customerName = customerFilter.value.toLowerCase();
        const amount = parseFloat(amountFilter.value);

        filteredTransactions = transactions.filter(transaction => {
            const customer = customers.find(c => c.id == transaction.customer_id);
            const matchesCustomer = customer && customer.name.toLowerCase().includes(customerName);
            const matchesAmount = isNaN(amount) || transaction.amount >= amount;
            return matchesCustomer && matchesAmount;
        });

        renderTable();
        renderChart();
    };
    // Render Chart ..........................................................................
    function renderChart() {
        if (chart) {
            chart.destroy();
        }

        const selectedCustomerName = customerFilter.value.toLowerCase();
        const selectedCustomer = customers.find(c => c.name.toLowerCase().includes(selectedCustomerName));

        if (!selectedCustomer) {
            return;
        }

        const customerTransactions = filteredTransactions.filter(t => t.customer_id == selectedCustomer.id);
        const dailyTotals = {};

        customerTransactions.forEach(transaction => {
            if (!dailyTotals[transaction.date]) {
                dailyTotals[transaction.date] = 0;
            }
            dailyTotals[transaction.date] += transaction.amount;
        });

        const labels = Object.keys(dailyTotals);
        const data = Object.values(dailyTotals);

        chart = new Chart(transactionChartCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Transaction Amount',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                scales: {
                    x: {
                        beginAtZero: true
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});
