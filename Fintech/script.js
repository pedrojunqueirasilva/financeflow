// FinanceFlow - Sistema de Controle Financeiro Pessoal
// JavaScript para funcionalidades interativas

// Dados simulados para demonstração
const financeData = {
    balance: 15847.32,
    monthlyIncome: 8500.00,
    monthlyExpenses: 6234.18,
    monthlySavings: 2265.82,
    transactions: [
        { id: 1, description: 'Salário', category: 'Receita', amount: 5000.00, date: '2025-01-05', type: 'income' },
        { id: 2, description: 'Supermercado', category: 'Alimentação', amount: -156.78, date: '2025-01-15', type: 'expense' },
        { id: 3, description: 'Combustível', category: 'Transporte', amount: -120.00, date: '2025-01-14', type: 'expense' },
        { id: 4, description: 'Cinema', category: 'Lazer', amount: -45.00, date: '2025-01-13', type: 'expense' }
    ],
    goals: [
        { id: 1, name: 'Viagem Europa', target: 15000, current: 9750, deadline: '2025-12-31' },
        { id: 2, name: 'Fundo Emergência', target: 30000, current: 12000, deadline: '2025-06-30' }
    ],
    budgets: {
        'alimentacao': { budgeted: 1500, spent: 1095 },
        'transporte': { budgeted: 800, spent: 720 },
        'lazer': { budgeted: 600, spent: 650 }
    }
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupTransactionForm();
    setupCharts();
    updateDashboard();
    setupSearchFunctionality();
    setupSyncIndicator();
    setupDateInputs();
}

// Navegação entre abas
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            
            // Remove active class from all nav items and tab contents
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked nav item and corresponding tab
            item.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Update charts if switching to dashboard
            if (targetTab === 'dashboard') {
                setTimeout(updateCharts, 100);
            }
        });
    });
}

// Configuração do formulário de transação
function setupTransactionForm() {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const form = document.querySelector('.transaction-form');
    const amountInput = document.getElementById('amount');
    const dateInput = document.getElementById('date');

    // Toggle entre receita e despesa
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Formatação automática do valor
    if (amountInput) {
        amountInput.addEventListener('input', formatCurrency);
    }

    // Data padrão como hoje
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Submissão do formulário
    if (form) {
        form.addEventListener('submit', handleTransactionSubmit);
    }
}

// Formatação de moeda
function formatCurrency(event) {
    let value = event.target.value.replace(/\D/g, '');
    value = (value / 100).toFixed(2);
    value = value.replace('.', ',');
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    event.target.value = value;
}

// Manipulação do envio de transação
function handleTransactionSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const transactionType = document.querySelector('.toggle-btn.active').getAttribute('data-type');
    const amount = parseFloat(document.getElementById('amount').value.replace(/\./g, '').replace(',', '.'));
    
    const transaction = {
        id: Date.now(),
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        amount: transactionType === 'expense' ? -amount : amount,
        date: document.getElementById('date').value,
        type: transactionType,
        account: document.getElementById('account').value
    };
    
    // Adicionar transação aos dados
    financeData.transactions.unshift(transaction);
    
    // Atualizar saldo
    financeData.balance += transaction.amount;
    
    // Atualizar dashboard
    updateDashboard();
    
    // Limpar formulário
    event.target.reset();
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    // Mostrar feedback
    showNotification('Transação salva com sucesso!', 'success');
    
    // Voltar para o dashboard
    document.querySelector('[data-tab="dashboard"]').click();
}

// Atualização do dashboard
function updateDashboard() {
    updateSummaryCards();
    updateRecentTransactions();
    updateGoalsProgress();
    updateCharts();
}

// Atualizar cartões de resumo
function updateSummaryCards() {
    const balanceElement = document.querySelector('.balance-card .amount');
    const incomeElement = document.querySelector('.income-card .amount');
    const expenseElement = document.querySelector('.expense-card .amount');
    const savingsElement = document.querySelector('.savings-card .amount');
    
    if (balanceElement) balanceElement.textContent = formatMoney(financeData.balance);
    if (incomeElement) incomeElement.textContent = formatMoney(financeData.monthlyIncome);
    if (expenseElement) expenseElement.textContent = formatMoney(financeData.monthlyExpenses);
    if (savingsElement) savingsElement.textContent = formatMoney(financeData.monthlySavings);
}

// Atualizar transações recentes
function updateRecentTransactions() {
    const container = document.querySelector('.transactions-widget');
    if (!container) return;
    
    const transactionsHtml = financeData.transactions.slice(0, 5).map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <span class="description">${transaction.description}</span>
                <span class="category">${transaction.category}</span>
            </div>
            <span class="amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                ${transaction.amount > 0 ? '+' : ''}${formatMoney(Math.abs(transaction.amount))}
            </span>
        </div>
    `).join('');
    
    container.innerHTML = `<h3>Transações Recentes</h3>${transactionsHtml}`;
}

// Atualizar progresso das metas
function updateGoalsProgress() {
    const goalsContainer = document.querySelector('.goals-widget');
    if (!goalsContainer) return;
    
    const goalsHtml = financeData.goals.map(goal => {
        const progress = Math.round((goal.current / goal.target) * 100);
        return `
            <div class="goal-item">
                <span>${goal.name}</span>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progress}%"></div>
                </div>
                <span>${progress}%</span>
            </div>
        `;
    }).join('');
    
    goalsContainer.innerHTML = `<h3>Metas em Andamento</h3>${goalsHtml}`;
}

// Configuração dos gráficos
function setupCharts() {
    // Aguardar um pouco para garantir que os elementos estejam renderizados
    setTimeout(() => {
        createPieChart();
        createBarChart();
        createLineChart();
        createGoalsChart();
        createBudgetChart();
    }, 100);
}

// Atualizar gráficos
function updateCharts() {
    createPieChart();
    createBarChart();
    createLineChart();
}

// Gráfico de pizza - Distribuição de gastos
function createPieChart() {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;
    
    // Destruir gráfico existente se houver
    if (window.pieChartInstance) {
        window.pieChartInstance.destroy();
    }
    
    const expenses = financeData.transactions
        .filter(t => t.amount < 0)
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
            return acc;
        }, {});
    
    window.pieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(expenses),
            datasets: [{
                data: Object.values(expenses),
                backgroundColor: [
                    '#1e40af',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6',
                    '#06b6d4'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Gráfico de barras - Evolução mensal
function createBarChart() {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;
    
    if (window.barChartInstance) {
        window.barChartInstance.destroy();
    }
    
    const months = ['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan'];
    const incomeData = [7800, 8200, 7900, 8500, 8300, 8500];
    const expenseData = [6200, 6800, 6100, 6500, 6400, 6234];
    
    window.barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Receitas',
                    data: incomeData,
                    backgroundColor: '#10b981',
                    borderRadius: 4
                },
                {
                    label: 'Despesas',
                    data: expenseData,
                    backgroundColor: '#ef4444',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de linha - Fluxo de caixa
function createLineChart() {
    const ctx = document.getElementById('lineChart');
    if (!ctx) return;
    
    if (window.lineChartInstance) {
        window.lineChartInstance.destroy();
    }
    
    const days = Array.from({length: 30}, (_, i) => i + 1);
    const projectedBalance = days.map(day => {
        return financeData.balance + (day * 75); // Projeção simples
    });
    
    window.lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Saldo Projetado',
                data: projectedBalance,
                borderColor: '#1e40af',
                backgroundColor: 'rgba(30, 64, 175, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de evolução das metas
function createGoalsChart() {
    const ctx = document.getElementById('goalsChart');
    if (!ctx) return;
    
    if (window.goalsChartInstance) {
        window.goalsChartInstance.destroy();
    }
    
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const europeTrip = [5000, 6200, 7100, 8000, 8900, 9750];
    const emergencyFund = [8000, 8800, 9500, 10200, 11100, 12000];
    
    window.goalsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Viagem Europa',
                    data: europeTrip,
                    borderColor: '#1e40af',
                    backgroundColor: 'rgba(30, 64, 175, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Fundo Emergência',
                    data: emergencyFund,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de análise de orçamentos
function createBudgetChart() {
    const ctx = document.getElementById('budgetChart');
    if (!ctx) return;
    
    if (window.budgetChartInstance) {
        window.budgetChartInstance.destroy();
    }
    
    const categories = ['Alimentação', 'Transporte', 'Lazer'];
    const budgeted = [1500, 800, 600];
    const spent = [1095, 720, 650];
    
    window.budgetChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [
                {
                    label: 'Orçado',
                    data: budgeted,
                    backgroundColor: '#e2e8f0',
                    borderRadius: 4
                },
                {
                    label: 'Gasto',
                    data: spent,
                    backgroundColor: '#1e40af',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

// Funcionalidade de busca
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        // Implementar lógica de busca aqui
        console.log('Buscando por:', query);
    });
}

// Indicador de sincronização
function setupSyncIndicator() {
    const syncIcon = document.getElementById('syncIcon');
    if (!syncIcon) return;
    
    // Simular sincronização
    setInterval(() => {
        syncIcon.style.color = '#10b981'; // Verde quando sincronizado
    }, 5000);
}

// Configurar inputs de data
function setupDateInputs() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = new Date().toISOString().split('T')[0];
        }
    });
}

// Utilitários
function formatMoney(amount) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(amount);
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : '#1e40af'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Funcionalidades adicionais para recursos avançados
function setupAdvancedFeatures() {
    // Calculadora
    document.addEventListener('click', function(e) {
        if (e.target.closest('.feature-item') && e.target.closest('.feature-item').textContent.includes('Calculadora')) {
            openCalculator();
        }
    });
}

function openCalculator() {
    // Implementar calculadora modal
    const calculator = document.createElement('div');
    calculator.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-bottom: 1rem;">Calculadora</h3>
                <input type="text" id="calcDisplay" style="width: 100%; padding: 1rem; font-size: 1.5rem; text-align: right; margin-bottom: 1rem; border: 2px solid #e2e8f0; border-radius: 8px;" readonly>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;">
                    <button onclick="clearCalc()" style="padding: 1rem; border: none; background: #ef4444; color: white; border-radius: 8px; cursor: pointer;">C</button>
                    <button onclick="appendToCalc('/')" style="padding: 1rem; border: none; background: #1e40af; color: white; border-radius: 8px; cursor: pointer;">÷</button>
                    <button onclick="appendToCalc('*')" style="padding: 1rem; border: none; background: #1e40af; color: white; border-radius: 8px; cursor: pointer;">×</button>
                    <button onclick="deleteLast()" style="padding: 1rem; border: none; background: #f59e0b; color: white; border-radius: 8px; cursor: pointer;">⌫</button>
                    <button onclick="appendToCalc('7')" style="padding: 1rem; border: none; background: #f8fafc; border-radius: 8px; cursor: pointer;">7</button>
                    <button onclick="appendToCalc('8')" style="padding: 1rem; border: none; background: #f8fafc; border-radius: 8px; cursor: pointer;">8</button>
                    <button onclick="appendToCalc('9')" style="padding: 1rem; border: none; background: #f8fafc; border-radius: 8px; cursor: pointer;">9</button>
                    <button onclick="appendToCalc('-')" style="padding: 1rem; border: none; background: #1e40af; color: white; border-radius: 8px; cursor: pointer;">-</button>
                    <button onclick="appendToCalc('4')" style="padding: 1rem; border: none; background: #f8fafc; border-radius: 8px; cursor: pointer;">4</button>
                    <button onclick="appendToCalc('5')" style="padding: 1rem; border: none; background: #f8fafc; border-radius: 8px; cursor: pointer;">5</button>
                    <button onclick="appendToCalc('6')" style="padding: 1rem; border: none; background: #f8fafc; border-radius: 8px; cursor: pointer;">6</button>
                    <button onclick="appendToCalc('+')" style="padding: 1rem; border: none; background: #1e40af; color: white; border-radius: 8px; cursor: pointer;">+</button>
                    <button onclick="appendToCalc('1')" style="padding: 1rem; border: none; background: #f8fafc; border-radius: 8px; cursor: pointer;">1</button>
                    <button onclick="appendToCalc('2')" style="padding: 1rem; border: none; background: #f8fafc; border-radius: 8px; cursor: pointer;">2</button>
                    <button onclick="appendToCalc('3')" style="padding: 1rem; border: none; background: #f8fafc; border-radius: 8px; cursor: pointer;">3</button>
                    <button onclick="calculateResult()" style="padding: 1rem; border: none; background: #10b981; color: white; border-radius: 8px; cursor: pointer; grid-row: span 2;">=</button>
                    <button onclick="appendToCalc('0')" style="padding: 1rem; border: none; background: #f8fafc; border-radius: 8px; cursor: pointer; grid-column: span 2;">0</button>
                    <button onclick="appendToCalc('.')" style="padding: 1rem; border: none; background: #f8fafc; border-radius: 8px; cursor: pointer;">,</button>
                </div>
                <button onclick="closeCalculator()" style="width: 100%; margin-top: 1rem; padding: 1rem; border: none; background: #64748b; color: white; border-radius: 8px; cursor: pointer;">Fechar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(calculator);
    window.currentCalculator = calculator;
}

// Funções da calculadora
window.appendToCalc = function(value) {
    const display = document.getElementById('calcDisplay');
    display.value += value;
};

window.clearCalc = function() {
    document.getElementById('calcDisplay').value = '';
};

window.deleteLast = function() {
    const display = document.getElementById('calcDisplay');
    display.value = display.value.slice(0, -1);
};

window.calculateResult = function() {
    const display = document.getElementById('calcDisplay');
    try {
        const result = eval(display.value.replace(',', '.'));
        display.value = result.toString().replace('.', ',');
    } catch (error) {
        display.value = 'Erro';
    }
};

window.closeCalculator = function() {
    if (window.currentCalculator) {
        document.body.removeChild(window.currentCalculator);
        window.currentCalculator = null;
    }
};

// Inicializar recursos avançados
setupAdvancedFeatures();

// Simulação de dados em tempo real
setInterval(() => {
    // Simular pequenas variações no saldo
    const variation = (Math.random() - 0.5) * 10;
    financeData.balance += variation;
    updateSummaryCards();
}, 30000); // Atualizar a cada 30 segundos

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('financeFlowData', JSON.stringify(financeData));
}

// Carregar dados do localStorage
function loadData() {
    const savedData = localStorage.getItem('financeFlowData');
    if (savedData) {
        Object.assign(financeData, JSON.parse(savedData));
    }
}

// Carregar dados ao inicializar
loadData();

// Salvar dados periodicamente
setInterval(saveData, 10000); // Salvar a cada 10 segundos