       // Get the user id from sessionStorage (or however you pass data)
       const userId = sessionStorage.getItem('userId') || 'Unknown User';
       document.getElementById('user-id-display').textContent = 'User: ' + userId;
       
       // Logout functionality: clear session and redirect to login
       document.getElementById('logout-btn').addEventListener('click', () => {
         sessionStorage.removeItem('userId');
         window.location.href = '/auth/login.html';
       });
// Global variables and utilities
window.categories = {
    income: [
        { name: 'Salary', icon: 'fa-money-bill-wave', color: 'emerald' },
        { name: 'Investment', icon: 'fa-chart-line', color: 'blue' },
        { name: 'Freelance', icon: 'fa-laptop', color: 'purple' },
        { name: 'Other', icon: 'fa-plus', color: 'gray' }
    ],
    expense: [
        { name: 'Food', icon: 'fa-utensils', color: 'orange' },
        { name: 'Transport', icon: 'fa-car', color: 'indigo' },
        { name: 'Utilities', icon: 'fa-bolt', color: 'yellow' },
        { name: 'Entertainment', icon: 'fa-film', color: 'pink' },
        { name: 'Shopping', icon: 'fa-shopping-bag', color: 'red' }
    ]
};

// Global state
window.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
window.expenseChart = null;
window.budgets = JSON.parse(localStorage.getItem('budgets')) || {};

// Constants
const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'INR': '₹',
    'GBP': '£'
};

// Utility Functions
function getCurrencySymbol(currency = null) {
    const selectedCurrency = currency || localStorage.getItem('selectedCurrency') || 'USD';
    return currencySymbols[selectedCurrency];
}

function getColorForCategory(color) {
    const colorMap = {
        'red': '#ef4444',
        'orange': '#f97316',
        'yellow': '#eab308',
        'green': '#22c55e',
        'blue': '#3b82f6',
        'indigo': '#6366f1',
        'purple': '#a855f7',
        'pink': '#ec4899',
        'emerald': '#10b981',
        'gray': '#6b7280'
    };
    return colorMap[color] || '#6b7280';
}

// Notification System
const notificationQueue = [];
let isNotificationShowing = false;

function showNotification(message, type = 'success') {
    notificationQueue.push({ message, type });
    if (!isNotificationShowing) {
        showNextNotification();
    }
}

function showNextNotification() {
    if (notificationQueue.length === 0) {
        isNotificationShowing = false;
        return;
    }

    isNotificationShowing = true;
    const { message, type } = notificationQueue.shift();
    
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' : 
        type === 'warning' ? 'bg-yellow-500' : 
        'bg-red-500'
    } text-white transform translate-y-0 opacity-100 transition-all duration-300`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => {
            notification.remove();
            showNextNotification();
        }, 300);
    }, 3000);
}

// Transaction Management
function createTransaction(formData) {
    const category = window.categories[formData.type].find(c => c.name === formData.category);
    const transactionDate = formData.date ? new Date(formData.date) : new Date();
    
    return {
        id: Date.now(),
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        categoryIcon: category.icon,
        categoryColor: category.color,
        date: transactionDate.toISOString(),
        createdAt: new Date().toISOString(),
        receipt: null
    };
}

function updateTransactionsList() {
    const transactionsList = document.getElementById('transactions-list');
    const recentTransactions = window.transactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        transactionsList.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                No transactions yet. Add your first transaction above!
            </div>`;
        return;
    }

    transactionsList.innerHTML = recentTransactions.map(transaction => {
        const date = new Date(transaction.date);
        return generateTransactionHTML(transaction, date);
    }).join('');
}

function generateTransactionHTML(transaction, date) {
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const symbol = getCurrencySymbol();

    return `
        <div class="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 
                    transition-colors duration-200 ${transaction.type === 'income' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-${transaction.categoryColor}-100 flex items-center justify-center">
                    <i class="fas ${transaction.categoryIcon} text-${transaction.categoryColor}-500"></i>
                </div>
                <div>
                    <h4 class="font-semibold">${transaction.description}</h4>
                    <div class="flex items-center space-x-2 text-sm text-gray-500">
                        <span>${transaction.category}</span>
                        <span>•</span>
                        <span>${formattedDate}</span>
                        <span>•</span>
                        <span>${formattedTime}</span>
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <span class="font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${symbol}${transaction.amount.toFixed(2)}
                </span>
                <div class="flex space-x-2">
                    ${generateReceiptButton(transaction)}
                    <button onclick="deleteTransaction(${transaction.id})" class="text-gray-400 hover:text-red-500">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function generateReceiptButton(transaction) {
    if (transaction.receipt) {
        return `
            <button onclick="viewReceipt(${transaction.id})" class="text-blue-500 hover:text-blue-700">
                <i class="fas fa-file-alt"></i>
            </button>`;
    }
    return `
        <label class="cursor-pointer text-gray-400 hover:text-gray-600">
            <i class="fas fa-upload"></i>
            <input type="file" class="hidden" accept="image/*,.pdf" 
                   onchange="handleReceiptUpload(event, ${transaction.id})">
        </label>`;
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeSidebar();
    initializeTabSystem();
    initializeCurrencySystem();
    initializeTransactionSystem();
    initializeDarkMode();
    setupEventListeners();
    updateTransactionsList();
    updateBalances();
    initializeRewardsSystem();
    makeTableResponsive();
    window.addEventListener('resize', debounce(updateChartDimensions, 250));
    updateChartDimensions();
    initializeMobileOptimizations();
});

// Make functions globally available
window.showNotification = showNotification;
window.handleReceiptUpload = handleReceiptUpload;
window.viewReceipt = viewReceipt;
window.deleteTransaction = deleteTransaction;
window.transactions = transactions;
window.categories = categories;
window.currencySymbols = currencySymbols;
window.initializeExpensesTab = initializeExpensesTab;
window.initializeInsightsTab = initializeInsightsTab;
window.initializeGameTab = initializeGameTab;
window.updateExpenseChart = updateExpenseChart;
window.handleBudgetSubmit = handleBudgetSubmit;

// Receipt Handling System
async function handleReceiptUpload(event, transactionId) {
    const file = event.target.files[0];
    if (!file || file.size > 10 * 1024 * 1024 || !file.type.startsWith('image/')) {
        showNotification('Please upload a valid image file under 10MB', 'error');
        return;
    }

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const transaction = window.transactions.find(t => t.id === transactionId);
            if (transaction) {
                transaction.receipt = {
                    name: file.name,
                    data: e.target.result,
                    type: file.type
                };
                localStorage.setItem('transactions', JSON.stringify(window.transactions));
                showNotification('Receipt uploaded successfully');
                updateTransactionsList();
            }
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Receipt upload error:', error);
        showNotification('Error uploading receipt', 'error');
    }
}

function viewReceipt(transactionId) {
    const transaction = window.transactions.find(t => t.id === transactionId);
    if (transaction?.receipt) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Receipt</h3>
                    <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="receipt-content">
                    <img src="${transaction.receipt.data}" alt="Receipt" class="max-w-full h-auto">
                </div>
                <div class="mt-4 text-sm text-gray-500">${transaction.receipt.name}</div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

// Helper function to populate form with extracted receipt data
function populateFormWithData(data) {
    if (!data) return;
    
    const elements = {
        amount: document.getElementById('amount'),
        description: document.getElementById('description'),
        date: document.getElementById('transaction-date')
    };

    if (data.amount && elements.amount) {
        elements.amount.value = data.amount.toFixed(2);
    }
    if (data.description && elements.description) {
        elements.description.value = data.description;
    }
    if (data.date && elements.date) {
        elements.date.value = data.date;
    }
}

// Enhanced receipt text parsing
function parseReceiptText(text) {
    const data = {
        amount: null,
        date: null,
        description: ''
    };

    // Extract amount - look for currency symbols and decimal numbers
    const amountRegex = /(?:[$€£₹]\s*)?(\d+(?:\.\d{2})?)/;
    const amountMatch = text.match(amountRegex);
    if (amountMatch) {
        const possibleAmount = parseFloat(amountMatch[1]);
        if (!isNaN(possibleAmount)) {
            data.amount = possibleAmount;
        }
    }

    // Extract date - support multiple formats
    const dateRegexes = [
        /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/,  // DD/MM/YYYY or MM/DD/YYYY
        /\d{4}[-/]\d{1,2}[-/]\d{1,2}/,    // YYYY/MM/DD
        /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}/i // Month DD, YYYY
    ];

    for (const regex of dateRegexes) {
        const dateMatch = text.match(regex);
        if (dateMatch) {
            const parsedDate = new Date(dateMatch[0]);
            if (!isNaN(parsedDate)) {
                data.date = parsedDate.toISOString().split('T')[0];
                break;
            }
        }
    }

    // Extract description - usually the first non-date, non-amount line
    const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    for (const line of lines) {
        // Skip lines that are just amounts or dates
        if (!line.match(amountRegex) && !dateRegexes.some(re => line.match(re))) {
            data.description = line.substring(0, 50);
            break;
        }
    }

    return Object.values(data).some(value => value) ? data : null;
}

// Update the processReceipt function to use enhanced error handling
async function processReceipt(file) {
    const preview = document.getElementById('receipt-preview');
    const image = document.getElementById('receipt-image');
    const status = document.getElementById('scanning-status');
    const extractedData = document.getElementById('extracted-data');
    
    try {
        // Show preview
        preview.classList.remove('hidden');
        image.src = URL.createObjectURL(file);
        status.textContent = 'Initializing scanner...';
        
        // Perform OCR
        const result = await Tesseract.recognize(file, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    status.textContent = `Scanning: ${Math.round(m.progress * 100)}%`;
                }
            }
        });

        // Parse extracted text
        const data = parseReceiptText(result.data.text);
        
        if (data) {
            status.textContent = 'Receipt scanned successfully!';
            status.className = 'text-green-600';
            displayExtractedData(data);
            populateFormWithData(data);
        } else {
            status.textContent = 'Could not extract data. Please fill in manually.';
            status.className = 'text-yellow-600';
        }
    } catch (error) {
        console.error('Receipt scanning error:', error);
        status.textContent = 'Error scanning receipt. Please try again or enter manually.';
        status.className = 'text-red-600';
    }
}

// Update the existing displayExtractedData function with better formatting
function displayExtractedData(data) {
    const extractedDataDiv = document.getElementById('extracted-data');
    if (!extractedDataDiv) return;

    const symbol = getCurrencySymbol();
    const formattedDate = data.date ? new Date(data.date).toLocaleDateString() : '';

    extractedDataDiv.innerHTML = `
        <div class="space-y-2 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-semibold text-gray-700">Extracted Information:</h4>
            <div class="grid gap-2 text-sm">
                ${data.amount ? `
                    <div class="flex justify-between">
                        <span class="text-gray-600">Amount:</span>
                        <span class="font-medium">${symbol}${data.amount.toFixed(2)}</span>
                    </div>
                ` : ''}
                ${data.date ? `
                    <div class="flex justify-between">
                        <span class="text-gray-600">Date:</span>
                        <span class="font-medium">${formattedDate}</span>
                    </div>
                ` : ''}
                ${data.description ? `
                    <div class="flex justify-between">
                        <span class="text-gray-600">Description:</span>
                        <span class="font-medium">${data.description}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Add event listener for receipt upload
document.getElementById('receipt-upload')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size should be less than 10MB', 'error');
        return;
    }

    await processReceipt(file);
});

// Initialization Functions
function initializeSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    // Create backdrop element
    const backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
    
    // Toggle sidebar
    sidebarToggle?.addEventListener('click', () => {
        sidebar?.classList.toggle('show');
        backdrop.classList.toggle('show');
    });
    
    // Close sidebar when clicking backdrop
    backdrop.addEventListener('click', () => {
        sidebar?.classList.remove('show');
        backdrop.classList.remove('show');
    });
    
    // Close sidebar when clicking a link (mobile)
    const sidebarLinks = sidebar?.querySelectorAll('a');
    sidebarLinks?.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar?.classList.remove('show');
                backdrop.classList.remove('show');
            }
        });
    });
    
    // Close sidebar on window resize if open
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar?.classList.remove('show');
            backdrop.classList.remove('show');
        }
    });
}

function initializeTabSystem() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    // Set initial active tab
    const initialTab = document.querySelector('.tab-link.active');
    if (initialTab) {
        const initialTargetTab = initialTab.getAttribute('data-tab');
        const initialContent = document.getElementById(initialTargetTab);
        if (initialContent) {
            initialContent.classList.remove('hidden');
            // Initialize the initial tab's content
            initializeTabContent(initialTargetTab);
        }
    }

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = link.getAttribute('data-tab');

            // Remove active state from all tabs
            tabLinks.forEach(l => l.classList.remove('active', 'bg-gray-100'));
            tabContents.forEach(c => c.classList.add('hidden'));

            // Add active state to current tab
            link.classList.add('active', 'bg-gray-100');
            const tabContent = document.getElementById(targetTab);
            if (tabContent) {
                tabContent.classList.remove('hidden');
                initializeTabContent(targetTab);
            }
        });
    });
}

// Helper function to initialize specific tab content
function initializeTabContent(targetTab) {
    switch(targetTab) {
        case 'expenses': 
            initializeExpensesTab(); 
            break;
        case 'budget': 
            initializeBudgetTab(); 
            break;
        case 'insights': 
            initializeInsightsTab(); 
            break;
        case 'rewards':
            initializeRewardsSystem();
            break;
        case 'game':
            initializeGameTab();
            break;
    }
}

function initializeCurrencySystem() {
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
        currencySelect.value = localStorage.getItem('selectedCurrency') || 'USD';
        currencySelect.addEventListener('change', () => {
            localStorage.setItem('selectedCurrency', currencySelect.value);
            updateCurrencyDisplay();
        });
    }
    updateCurrencyDisplay();
}

function updateCurrencyDisplay() {
    const symbol = getCurrencySymbol();
    
    document.querySelectorAll('[data-amount]').forEach(element => {
        const amount = parseFloat(element.dataset.amount);
        element.textContent = `${symbol}${amount.toFixed(2)}`;
    });

    if (window.expenseChart) {
        updateExpenseChart();
    }
}

function initializeTransactionSystem() {
    const typeSelect = document.getElementById('type');
    const categorySelect = document.getElementById('category');
    const transactionForm = document.getElementById('transaction-form');

    // Category options update
    typeSelect?.addEventListener('change', () => {
        const type = typeSelect.value;
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Select Category</option>';
            window.categories[type].forEach(cat => {
                categorySelect.innerHTML += `
                    <option value="${cat.name}" data-icon="${cat.icon}" data-color="${cat.color}">
                        ${cat.name}
                    </option>
                `;
            });
        }
    });

    // Form submission
    transactionForm?.addEventListener('submit', handleTransactionSubmit);

    // Initial category population
    typeSelect?.dispatchEvent(new Event('change'));
    
    // Set default datetime
    setDefaultDateTime();
}

function handleTransactionSubmit(e) {
    e.preventDefault();
    const formData = {
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        date: document.getElementById('transaction-date').value
    };

    if (!formData.description || !formData.amount || !formData.category || !formData.date) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    checkBudgetLimits(formData);
    const transaction = createTransaction(formData);
    window.transactions.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(window.transactions));
    
    // Reset form
    e.target.reset();
    
    // Update UI
    updateTransactionsList();
    updateBalances();
    updateExpenseChart();
    
    showNotification('Transaction added successfully');

    // Add responsive form reset
    if (window.innerWidth <= 768) {
        // Scroll to top of transactions list on mobile
        document.getElementById('transactions-list')?.scrollIntoView({ behavior: 'smooth' });
    }
}

function getCategoryTotals() {
    const currentDate = new Date();
    return window.transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && 
                   date.getMonth() === currentDate.getMonth() && 
                   date.getFullYear() === currentDate.getFullYear();
        })
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});
}

function populateBudgetCategories(select) {
    select.innerHTML = '<option value="">Select Category</option>';
    window.categories.expense.forEach(cat => {
        select.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
    });
}

function setupBudgetEventListeners(addBtn, modal, closeBtn, form) {
    addBtn?.addEventListener('click', () => modal?.classList.remove('hidden'));
    closeBtn?.addEventListener('click', () => modal?.classList.add('hidden'));
    modal?.addEventListener('click', e => {
        if (e.target === modal) modal.classList.add('hidden');
    });
    form?.addEventListener('submit', handleBudgetSubmit);
}

function handleBudgetSubmit(e) {
    e.preventDefault();
    const category = document.getElementById('budget-category').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);

    if (category && amount) {
        window.budgets[category] = amount;
        localStorage.setItem('budgets', JSON.stringify(window.budgets));
        document.getElementById('budget-modal').classList.add('hidden');
        updateBudgetDisplay();
        showNotification('Budget updated successfully');
    }
}

function updateBudgetDisplay() {
    const progressContainer = document.getElementById('budget-progress');
    const totalBudgetElement = document.getElementById('total-budget');
    const remainingBudgetElement = document.getElementById('remaining-budget');
    
    if (!progressContainer || !totalBudgetElement || !remainingBudgetElement) return;

    const { totalBudget, totalSpent, budgetProgress } = calculateBudgetProgress();
    displayBudgetProgress(progressContainer, budgetProgress);
    updateBudgetSummary(totalBudgetElement, remainingBudgetElement, totalBudget, totalSpent);
}

function calculateBudgetProgress() {
    const currentDate = new Date();
    const monthlyTransactions = window.transactions.filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && 
               date.getMonth() === currentDate.getMonth() && 
               date.getFullYear() === currentDate.getFullYear();
    });

    let totalBudget = 0;
    let totalSpent = 0;
    const budgetProgress = [];

    Object.entries(window.budgets).forEach(([category, budget]) => {
        totalBudget += budget;
        const spent = monthlyTransactions
            .filter(t => t.category === category)
            .reduce((sum, t) => sum + t.amount, 0);
        totalSpent += spent;
        budgetProgress.push({ category, budget, spent });
    });

    return { totalBudget, totalSpent, budgetProgress };
}

function displayBudgetProgress(container, progress) {
    const symbol = getCurrencySymbol();
    container.innerHTML = progress.map(({ category, budget, spent }) => {
        const percentage = (spent / budget) * 100;
        const status = percentage > 90 ? 'danger' : percentage > 70 ? 'warning' : 'safe';
        
        return `
            <div class="mb-4">
                <div class="flex justify-between text-sm mb-1">
                    <span>${category}</span>
                    <span>${symbol}${spent.toFixed(2)} / ${symbol}${budget.toFixed(2)}</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar ${status}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function updateBudgetSummary(totalElement, remainingElement, total, spent) {
    const symbol = getCurrencySymbol();
    const remaining = total - spent;

    totalElement.textContent = `${symbol}${total.toFixed(2)}`;
    remainingElement.textContent = `${symbol}${remaining.toFixed(2)}`;
    remainingElement.className = `text-xl font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`;
}

// Insights System
function initializeInsightsTab() {
    updateTrendsChart();
    updateComparisonChart();
    updateTopCategories();
    updateSpendingPatterns();
    updateRecommendations();
}

// ... Add all the insights-related functions here ...

// Game System
function initializeGameTab() {
    const game = {
        isActive: false,
        budget: 1000,
        remaining: 1000,
        score: 0,
        timeRemaining: 1800,
        timer: null,
        currentChallenge: null,
        history: [],
        challenges: [
            {
                description: "Unexpected car repair needed. How much will you spend?",
                minAmount: 200,
                maxAmount: 800,
                idealPercentage: 0.3
            },
            {
                description: "Monthly grocery shopping. How much will you allocate?",
                minAmount: 100,
                maxAmount: 500,
                idealPercentage: 0.2
            },
            {
                description: "Emergency medical expense. How much do you set aside?",
                minAmount: 150,
                maxAmount: 600,
                idealPercentage: 0.25
            },
            {
                description: "Phone bill and internet services due. How much to pay?",
                minAmount: 50,
                maxAmount: 200,
                idealPercentage: 0.08
            },
            {
                description: "Planning a weekend trip. What's your budget?",
                minAmount: 100,
                maxAmount: 400,
                idealPercentage: 0.15
            },
            {
                description: "Home maintenance repairs needed. How much to spend?",
                minAmount: 150,
                maxAmount: 700,
                idealPercentage: 0.28
            },
            {
                description: "New work clothes needed. Set your shopping budget:",
                minAmount: 80,
                maxAmount: 300,
                idealPercentage: 0.12
            },
            {
                description: "Family member's wedding gift. How much to give?",
                minAmount: 50,
                maxAmount: 250,
                idealPercentage: 0.1
            },
            {
                description: "Annual insurance premium due. How much to allocate?",
                minAmount: 200,
                maxAmount: 800,
                idealPercentage: 0.3
            },
            {
                description: "Monthly entertainment budget. How much to set aside?",
                minAmount: 40,
                maxAmount: 200,
                idealPercentage: 0.08
            }
        ]
    };

    setupGameEventListeners(game);
    return game;
}

// ... Add all the game-related functions here ...

// Dark Mode System
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const icon = darkModeToggle?.querySelector('i');
    
    // Set initial state
    if (isDarkMode) {
        document.body.classList.add('dark');
        icon?.classList.replace('fa-moon', 'fa-sun');
    }
    
    darkModeToggle?.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('darkMode', isDark);
        
        // Toggle icon
        if (icon) {
            icon.classList.toggle('fa-moon');
            icon.classList.toggle('fa-sun');
        }
        
        // Update charts if they exist
        if (window.expenseChart) {
            updateExpenseChart();
        }
        if (window.trendsChart) {
            updateTrendsChart();
        }
        if (window.comparisonChart) {
            updateComparisonChart();
        }
    });
}

// Expenses Tab Functions
function initializeExpensesTab() {
    const dateRange = document.getElementById('date-range');
    const dateInputs = document.querySelectorAll('.date-range-inputs');
    const filterCategory = document.getElementById('filter-category');

    // Set default dates
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    document.getElementById('date-from')?.setAttribute('value', thirtyDaysAgo.toISOString().split('T')[0]);
    document.getElementById('date-to')?.setAttribute('value', today.toISOString().split('T')[0]);

    // Setup filters
    setupExpenseFilters(dateRange, dateInputs, filterCategory);
    
    // Initial update
    updateExpensesView();
}

function setupExpenseFilters(dateRange, dateInputs, filterCategory) {
    // Populate category filter
    filterCategory.innerHTML = '<option value="">All Categories</option>';
    window.categories.expense.forEach(cat => {
        filterCategory.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
    });

    // Date range handler
    dateRange.addEventListener('change', () => {
        dateInputs.forEach(input => {
            input.classList.toggle('hidden', dateRange.value !== 'custom');
        });
        updateExpensesView();
    });

    // Filter change handlers
    [dateRange, filterCategory, ...dateInputs].forEach(filter => {
        filter?.addEventListener('change', updateExpensesView);
    });
}

function getFilteredTransactions() {
    const dateRange = document.getElementById('date-range')?.value || '30';
    const category = document.getElementById('filter-category')?.value;
    const dateFrom = document.getElementById('date-from')?.value;
    const dateTo = document.getElementById('date-to')?.value;

    return window.transactions.filter(t => {
        if (t.type !== 'expense') return false;
        if (category && t.category !== category) return false;

        const transactionDate = new Date(t.date);
        if (dateRange === 'custom' && dateFrom && dateTo) {
            return transactionDate >= new Date(dateFrom) && 
                   transactionDate <= new Date(dateTo);
        } else {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
            return transactionDate >= daysAgo;
        }
    });
}

// Receipt Processing Functions
async function processReceipt(file) {
    const preview = document.getElementById('receipt-preview');
    const image = document.getElementById('receipt-image');
    const status = document.getElementById('scanning-status');
    
    try {
        preview.classList.remove('hidden');
        image.src = URL.createObjectURL(file);
        status.textContent = 'Scanning receipt...';

        const result = await Tesseract.recognize(file, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    status.textContent = `Scanning: ${Math.round(m.progress * 100)}%`;
                }
            }
        });

        const extractedData = parseReceiptText(result.data.text);
        if (extractedData) {
            status.textContent = 'Receipt scanned successfully!';
            displayExtractedData(extractedData);
            populateFormWithData(extractedData);
        } else {
            status.textContent = 'Could not extract data. Please fill in manually.';
        }
    } catch (error) {
        status.textContent = 'Error scanning receipt. Please try again.';
        console.error('Receipt scanning error:', error);
    }
}

// Insights Functions
function updateTrendsChart() {
    const ctx = document.getElementById('trends-chart')?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (window.trendsChart) {
        window.trendsChart.destroy();
    }

    const data = getLast6MonthsData();
    window.trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Monthly Expenses',
                data: data.expenses,
                borderColor: '#EF4444',
                tension: 0.3,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => getCurrencySymbol() + value
                    }
                }
            }
        }
    });
}

function updateComparisonChart() {
    const ctx = document.getElementById('comparison-chart')?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (window.comparisonChart) {
        window.comparisonChart.destroy();
    }

    const { income, expenses } = getCurrentMonthComparison();
    window.comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [income, expenses],
                backgroundColor: ['#10B981', '#EF4444']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => getCurrencySymbol() + value
                    }
                }
            }
        }
    });
}

function updateSpendingPatterns() {
    const currentMonth = getCurrentMonthTransactions();
    const dailyTotals = getDailyTotals(currentMonth);
    const highestDay = getHighestSpendingDay(dailyTotals);
    const averageSpending = calculateAverageSpending(dailyTotals);
    const savingsRate = calculateSavingsRate();

    updateSpendingStats(highestDay, averageSpending, savingsRate);
}

// Game Functions
function setupGameEventListeners(game) {
    const startButton = document.getElementById('start-game');
    const submitButton = document.getElementById('submit-decision');
    const playAgainButton = document.getElementById('play-again');
    
    // Store game instance in window to maintain state
    window.currentGame = game;

    startButton?.addEventListener('click', () => {
        startGame(window.currentGame);
    });

    submitButton?.addEventListener('click', () => {
        if (!window.currentGame?.isActive) {
            showNotification('Please start a new game first', 'error');
            return;
        }
        handleGameDecision(window.currentGame);
    });

    playAgainButton?.addEventListener('click', () => {
        document.getElementById('game-over-modal').classList.add('hidden');
        startGame(window.currentGame);
    });
}

function startGame(game) {
    if (!game) return;
    
    // Reset game state
    game.isActive = true;
    game.budget = 1000;
    game.remaining = 1000;
    game.score = 0;
    game.timeRemaining = 1800;
    game.history = [];

    // Update UI
    const modal = document.getElementById('game-over-modal');
    const actions = document.getElementById('challenge-actions');
    const timerDisplay = document.getElementById('game-timer');
    
    modal?.classList.add('hidden');
    actions?.classList.remove('hidden');
    if (timerDisplay) timerDisplay.textContent = '30:00';

    updateGameStatus(game);
    generateNewChallenge(game);
    startGameTimer(game);

    showNotification('Game started! Make your first budget decision', 'success');
}

// Fix game decision handling
function handleGameDecision(game) {
    const amountInput = document.getElementById('decision-amount');
    const amount = parseFloat(amountInput?.value || '0');

    if (isNaN(amount) || amount < 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }

    if (amount > game.remaining) {
        showNotification('You don\'t have enough budget!', 'error');
        return;
    }

    if (amount < game.currentChallenge.minAmount || amount > game.currentChallenge.maxAmount) {
        showNotification(`Amount should be between $${game.currentChallenge.minAmount} and $${game.currentChallenge.maxAmount}`, 'warning');
    }

    processGameDecision(game, amount);
    amountInput.value = '';
}

// Add endGame function
function endGame(game) {
    if (!game) return;

    game.isActive = false;
    clearInterval(game.timer);
    game.timer = null;

    const modal = document.getElementById('game-over-modal');
    const finalScore = document.getElementById('final-score');
    const feedback = document.getElementById('game-feedback');
    const actions = document.getElementById('challenge-actions');

    if (finalScore) finalScore.textContent = game.score;
    if (feedback) {
        feedback.textContent = game.score >= 400 ? 'Outstanding! You\'re a budgeting master!' :
                             game.score >= 300 ? 'Great job! You have good budgeting skills!' :
                             game.score >= 200 ? 'Good effort! Keep practicing your budgeting!' :
                                               'Keep trying! Budgeting takes practice!';
    }

    actions?.classList.add('hidden');
    modal?.classList.remove('hidden');
    showNotification('Game Over! Check your final score', 'info');
}

// Add helper functions
function getLast6MonthsData() {
    const labels = [];
    const expenses = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleString('default', { month: 'short' }));
        
        const monthlyExpenses = window.transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'expense' && 
                       tDate.getMonth() === date.getMonth() &&
                       tDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);
        
        expenses.push(monthlyExpenses);
    }
    
    return { labels, expenses };
}

function getCurrentMonthComparison() {
    const now = new Date();
    const transactions = window.transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear();
    });

    return {
        income: transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
        expenses: transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)
    };
}

// Add event listener for receipt upload
document.getElementById('receipt-upload')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        await processReceipt(file);
    }
});

// ...rest of existing code...

// Add the missing functions before the initialization code
function updateExpenseChart() {
    const ctx = document.getElementById('expense-chart')?.getContext('2d');
    if (!ctx) return;

    const filteredTransactions = getFilteredTransactions();
    const categoryTotals = filteredTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = labels.map(category => {
        const categoryInfo = window.categories.expense.find(c => c.name === category);
        return getColorForCategory(categoryInfo?.color || 'gray');
    });

    if (window.expenseChart) {
        window.expenseChart.destroy();
    }

    window.expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: document.body.classList.contains('dark') ? '#fff' : '#333' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            const symbol = getCurrencySymbol();
                            return `${context.label}: ${symbol}${context.raw.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateExpensesView() {
    const filteredTransactions = getFilteredTransactions();
    
    // Update expense table
    updateExpensesTable(filteredTransactions);
    
    // Update category breakdown
    updateCategoryBreakdown(filteredTransactions);
    
    // Update chart
    updateExpenseChart();
}

function updateExpensesTable(transactions) {
    const tbody = document.getElementById('expenses-table-body');
    if (!tbody) return;

    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    No expenses found for the selected period
                </td>
            </tr>`;
        return;
    }

    const symbol = getCurrencySymbol();
    tbody.innerHTML = transactions
        .map(t => `
            <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                    ${new Date(t.date).toLocaleDateString()}
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        ${t.description}
                        ${t.receipt ? `
                            <button onclick="viewReceipt(${t.id})" class="ml-2 text-blue-500 hover:text-blue-700">
                                <i class="fas fa-file-alt"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center">
                        <i class="fas ${t.categoryIcon} text-${t.categoryColor}-500 mr-2"></i>
                        ${t.category}
                    </span>
                </td>
                <td class="px-6 py-4 text-red-600 font-medium">
                    ${symbol}${t.amount.toFixed(2)}
                </td>
            </tr>
        `).join('');
}

// Make sure these functions are available globally before other initializations
window.updateExpenseChart = updateExpenseChart;
window.updateExpensesView = updateExpensesView;

// ...rest of existing code...

// Add this function after updateExpensesTable
function updateCategoryBreakdown(transactions) {
    const categoryList = document.getElementById('category-list');
    if (!categoryList) return;

    // Calculate totals for each category
    const categoryTotals = transactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});

    // Calculate total expenses
    const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    if (totalExpenses === 0) {
        categoryList.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                No expenses found for the selected period
            </div>`;
        return;
    }

    // Get currency symbol
    const symbol = getCurrencySymbol();

    // Generate HTML for each category
    categoryList.innerHTML = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a) // Sort by amount descending
        .map(([category, amount]) => {
            const percentage = ((amount / totalExpenses) * 100).toFixed(1);
            const categoryInfo = window.categories.expense.find(c => c.name === category);
            
            return `
                <div class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 rounded-full bg-${categoryInfo.color}-100 flex items-center justify-center">
                            <i class="fas ${categoryInfo.icon} text-${categoryInfo.color}-500"></i>
                        </div>
                        <span>${category}</span>
                    </div>
                    <div class="text-right">
                        <div class="font-semibold">${symbol}${amount.toFixed(2)}</div>
                        <div class="text-sm text-gray-500">${percentage}%</div>
                    </div>
                </div>
            `;
        }).join('');
}

// Add missing insight functions
function updateSpendingStats(highestDay, averageSpending, savingsRate) {
    const symbol = getCurrencySymbol();
    
    // Update highest spending day
    document.getElementById('highest-spending-day').textContent = 
        highestDay ? `${highestDay.date} (${symbol}${highestDay.amount.toFixed(2)})` : 'No data';

    // Update average spending
    document.getElementById('average-spending').textContent = 
        averageSpending ? `${symbol}${averageSpending.toFixed(2)} per day` : 'No data';

    // Update savings rate
    document.getElementById('savings-rate').textContent = 
        `${savingsRate.toFixed(1)}%`;
}

function getHighestSpendingDay(dailyTotals) {
    if (Object.keys(dailyTotals).length === 0) return null;
    
    const [date, amount] = Object.entries(dailyTotals)
        .reduce(([maxDate, maxAmount], [date, amount]) => 
            amount > maxAmount ? [date, amount] : [maxDate, maxAmount],
            [null, -Infinity]);
    
    return { 
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }), 
        amount 
    };
}

function calculateAverageSpending(dailyTotals) {
    const totals = Object.values(dailyTotals);
    return totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
}

function calculateSavingsRate() {
    const { income, expenses } = getCurrentMonthComparison();
    return income > 0 ? ((income - expenses) / income * 100) : 0;
}

function getDailyTotals(transactions) {
    return transactions.reduce((acc, t) => {
        const date = new Date(t.date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + t.amount;
        return acc;
    }, {});
}

// Add missing game functions
function generateNewChallenge(game) {
    if (game.challenges.length === 0) {
        endGame(game);
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * game.challenges.length);
    game.currentChallenge = game.challenges[randomIndex];
    
    document.getElementById('challenge-description').textContent = 
        game.currentChallenge.description;
}

function updateGameStatus(game) {
    const symbol = getCurrencySymbol();
    document.getElementById('game-budget').textContent = `${symbol}${game.budget.toFixed(2)}`;
    document.getElementById('game-remaining').textContent = `${symbol}${game.remaining.toFixed(2)}`;
    document.getElementById('game-score').textContent = game.score.toString();
}

function startGameTimer(game) {
    if (game.timer) clearInterval(game.timer);
    
    game.timer = setInterval(() => {
        game.timeRemaining--;
        
        const minutes = Math.floor(game.timeRemaining / 60);
        const seconds = game.timeRemaining % 60;
        document.getElementById('game-timer').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
        if (game.timeRemaining <= 0 || game.remaining <= 0) {
            endGame(game);
        }
    }, 1000);
}

function processGameDecision(game, amount) {
    const idealAmount = game.budget * game.currentChallenge.idealPercentage;
    const difference = Math.abs(amount - idealAmount);
    const percentageOff = difference / idealAmount;
    
    let pointsEarned = 100;
    if (percentageOff > 0.5) pointsEarned = 0;
    else if (percentageOff > 0.3) pointsEarned = 25;
    else if (percentageOff > 0.1) pointsEarned = 50;
    else if (percentageOff > 0.05) pointsEarned = 75;

    // Update game state first
    game.score += pointsEarned;
    game.remaining -= amount;
    
    game.history.unshift({
        challenge: game.currentChallenge.description,
        amount: amount,
        points: pointsEarned,
        remaining: game.remaining
    });

    // Update UI synchronously
    updateGameStatus(game);
    updateGameHistory(game);
    document.getElementById('decision-amount').value = '';

    // Show notification immediately
    showNotification(`You earned ${pointsEarned} points!`, 
        pointsEarned > 50 ? 'success' : 'warning');

    // Generate new challenge after a short delay
    setTimeout(() => {
        generateNewChallenge(game);
    }, 100);
}

function updateGameHistory(game) {
    const symbol = getCurrencySymbol();
    const historyContainer = document.getElementById('game-history');
    
    historyContainer.innerHTML = game.history
        .map(item => `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                    <div class="font-semibold">${item.challenge}</div>
                    <div class="text-sm text-gray-500">
                        Remaining: ${symbol}${item.remaining.toFixed(2)}
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-semibold text-[#377f8e]">
                        ${symbol}${item.amount.toFixed(2)}
                    </div>
                    <div class="text-sm ${item.points >= 75 ? 'text-green-600' : 'text-yellow-600'}">
                        +${item.points} points
                    </div>
                </div>
            </div>
        `).join('');
}

// ...rest of existing code...

// Add missing insights functions
function updateTopCategories() {
    const topCategoriesDiv = document.getElementById('top-categories');
    const categoryTotals = getCategoryTotals();
    const sortedCategories = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    const symbol = getCurrencySymbol();
    topCategoriesDiv.innerHTML = sortedCategories
        .map(([category, amount], index) => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded mb-2">
                <div class="flex items-center space-x-2">
                    <span class="text-lg font-bold text-gray-500">#${index + 1}</span>
                    <span>${category}</span>
                </div>
                <span class="font-semibold">${symbol}${amount.toFixed(2)}</span>
            </div>
        `).join('');
}

function updateRecommendations() {
    const recommendationsDiv = document.getElementById('recommendations');
    const { income, expenses } = getCurrentMonthComparison();
    const savingsRate = income > 0 ? ((income - expenses) / income * 100) : 0;
    const recommendations = [];

    // Generate recommendations based on financial analysis
    if (savingsRate < 20) {
        recommendations.push({
            icon: 'fa-piggy-bank',
            color: 'blue',
            title: 'Increase Your Savings',
            description: 'Try to save at least 20% of your monthly income.'
        });
    }

    const categoryTotals = getCategoryTotals();
    const [topCategory, amount] = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)[0] || [];

    if (topCategory && amount > expenses * 0.4) {
        recommendations.push({
            icon: 'fa-chart-pie',
            color: 'yellow',
            title: 'High Category Spending',
            description: `Your ${topCategory} spending seems high. Consider setting a budget.`
        });
    }

    recommendations.push({
        icon: 'fa-lightbulb',
        color: 'green',
        title: 'Smart Tip',
        description: 'Set up automatic transfers to your savings account on payday.'
    });

    recommendationsDiv.innerHTML = recommendations
        .map(rec => `
            <div class="p-4 bg-gray-50 rounded-lg mb-3">
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                        <i class="fas ${rec.icon} text-${rec.color}-500 text-xl"></i>
                    </div>
                    <div>
                        <h4 class="font-semibold text-sm">${rec.title}</h4>
                        <p class="text-sm text-gray-600">${rec.description}</p>
                    </div>
                </div>
            </div>
        `).join('');
}

// Fix export functionality
function setupExportDropdown() {
    const exportButton = document.getElementById('export-button');
    const exportMenu = document.getElementById('export-menu');

    if (!exportButton || !exportMenu) return;

    // Remove any existing event listeners
    const newExportButton = exportButton.cloneNode(true);
    exportButton.parentNode.replaceChild(newExportButton, exportButton);
    
    newExportButton.addEventListener('click', (e) => {
        e.stopPropagation();
        exportMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!exportMenu.contains(e.target) && !newExportButton.contains(e.target)) {
            exportMenu.classList.add('hidden');
        }
    });

    // Handle export format selection with debounce
    exportMenu.querySelectorAll('button').forEach(button => {
        if (!button.dataset.format) return;
        button.addEventListener('click', debounce((e) => {
            const format = e.currentTarget.dataset.format;
            if (format) {
                exportTransactions(format);
                exportMenu.classList.add('hidden');
            }
        }, 300));
    });
}

// Add debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add budget check
function checkBudgetLimits(formData) {
    if (formData.type === 'expense' && window.budgets[formData.category]) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlySpent = window.transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'expense' && 
                       t.category === formData.category &&
                       date.getMonth() === currentMonth &&
                       date.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        if (monthlySpent + formData.amount > window.budgets[formData.category]) {
            showNotification(`Warning: This expense will exceed your ${formData.category} budget!`, 'warning');
        }
    }
}

// Update handleTransactionSubmit to include budget check
const originalHandleTransactionSubmit = handleTransactionSubmit;
handleTransactionSubmit = function(e) {
    e.preventDefault();
    const formData = {
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        date: document.getElementById('transaction-date').value
    };

    if (!formData.description || !formData.amount || !formData.category || !formData.date) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    checkBudgetLimits(formData);
    originalHandleTransactionSubmit.call(this, e);
};

// Fix game system
function initializeGameTab() {
    const game = {
        isActive: false,
        budget: 1000,
        remaining: 1000,
        score: 0,
        timeRemaining: 1800,
        timer: null,
        currentChallenge: null,
        history: [],
        challenges: [
            {
                description: "Unexpected car repair needed. How much will you spend?",
                minAmount: 200,
                maxAmount: 800,
                idealPercentage: 0.3
            },
            {
                description: "Monthly grocery shopping. How much will you allocate?",
                minAmount: 100,
                maxAmount: 500,
                idealPercentage: 0.2
            },
            {
                description: "Emergency medical expense. How much do you set aside?",
                minAmount: 150,
                maxAmount: 600,
                idealPercentage: 0.25
            },
            {
                description: "Phone bill and internet services due. How much to pay?",
                minAmount: 50,
                maxAmount: 200,
                idealPercentage: 0.08
            },
            {
                description: "Planning a weekend trip. What's your budget?",
                minAmount: 100,
                maxAmount: 400,
                idealPercentage: 0.15
            },
            {
                description: "Home maintenance repairs needed. How much to spend?",
                minAmount: 150,
                maxAmount: 700,
                idealPercentage: 0.28
            },
            {
                description: "New work clothes needed. Set your shopping budget:",
                minAmount: 80,
                maxAmount: 300,
                idealPercentage: 0.12
            },
            {
                description: "Family member's wedding gift. How much to give?",
                minAmount: 50,
                maxAmount: 250,
                idealPercentage: 0.1
            },
            {
                description: "Annual insurance premium due. How much to allocate?",
                minAmount: 200,
                maxAmount: 800,
                idealPercentage: 0.3
            },
            {
                description: "Monthly entertainment budget. How much to set aside?",
                minAmount: 40,
                maxAmount: 200,
                idealPercentage: 0.08
            }
        ]
    };

    setupGameEventListeners(game);
    return game;
}

function startGame(game) {
    console.log('Starting game with:', game);
    if (!game) {
        console.error('Game object is undefined');
        return;
    }

    // Reset game state
    game.isActive = true;
    game.budget = 1000;
    game.remaining = 1000;
    game.score = 0;
    game.timeRemaining = 1800;
    game.history = [];

    // Update UI elements
    const modal = document.getElementById('game-over-modal');
    const actions = document.getElementById('challenge-actions');
    const timerDisplay = document.getElementById('game-timer');
    
    if (modal) modal.classList.add('hidden');
    if (actions) actions.classList.remove('hidden');
    if (timerDisplay) timerDisplay.textContent = '30:00';

    updateGameStatus(game);
    generateNewChallenge(game);
    startGameTimer(game);

    showNotification('Game started! Make your first budget decision', 'success');
}

// Make sure to expose required functions
window.updateTopCategories = updateTopCategories;
window.updateRecommendations = updateRecommendations;
window.startGame = startGame;
window.handleGameDecision = handleGameDecision;
window.generateNewChallenge = generateNewChallenge;
window.initializeGameTab = initializeGameTab;

// ...rest of existing code...

// Add missing receipt parsing function
function parseReceiptText(text) {
    const data = {
        amount: null,
        date: null,
        description: ''
    };

    // Look for amount (matches patterns like $123.45 or 123.45)
    const amountMatch = text.match(/(?:\$\s*)?(\d+\.\d{2})/);
    if (amountMatch) {
        data.amount = parseFloat(amountMatch[1]);
    }

    // Look for date (matches common date formats)
    const dateMatch = text.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/);
    if (dateMatch) {
        const date = new Date(dateMatch[0]);
        if (!isNaN(date)) {
            data.date = date.toISOString().split('T')[0];
        }
    }

    // Get first line as merchant/description
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length > 0) {
        data.description = lines[0].substring(0, 50);
    }

    return Object.values(data).some(value => value) ? data : null;
}

// Add missing getCurrentMonthTransactions function
function getCurrentMonthTransactions() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return window.transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
    });
}

// Fix game system initialization
function setupGameEventListeners(game) {
    const startButton = document.getElementById('start-game');
    const submitButton = document.getElementById('submit-decision');
    const playAgainButton = document.getElementById('play-again');
    
    // Store game instance in window to maintain state
    window.currentGame = game;

    startButton?.addEventListener('click', () => {
        startGame(window.currentGame);
    });

    submitButton?.addEventListener('click', () => {
        if (!window.currentGame?.isActive) {
            showNotification('Please start a new game first', 'error');
            return;
        }
        handleGameDecision(window.currentGame);
    });

    playAgainButton?.addEventListener('click', () => {
        document.getElementById('game-over-modal').classList.add('hidden');
        startGame(window.currentGame);
    });
}

// Fix game start function
function startGame(game) {
    console.log('Starting game with:', game);
    if (!game) {
        console.error('Game object is undefined');
        return;
    }

    // Reset game state
    game.isActive = true;
    game.budget = 1000;
    game.remaining = 1000;
    game.score = 0;
    game.timeRemaining = 1800;
    game.history = [];

    // Update UI elements
    const modal = document.getElementById('game-over-modal');
    const actions = document.getElementById('challenge-actions');
    const timerDisplay = document.getElementById('game-timer');
    
    if (modal) modal.classList.add('hidden');
    if (actions) actions.classList.remove('hidden');
    if (timerDisplay) timerDisplay.textContent = '30:00';

    updateGameStatus(game);
    generateNewChallenge(game);
    startGameTimer(game);

    showNotification('Game started! Make your first budget decision', 'success');
}

// Add this to fix game initialization
document.addEventListener('DOMContentLoaded', () => {
    // ...existing initialization code...

    // Initialize game with proper scope
    const game = {
        isActive: false,
        budget: 1000,
        remaining: 1000,
        score: 0,
        timeRemaining: 1800,
        timer: null,
        currentChallenge: null,
        history: [],
        challenges: [
            {
                description: "Unexpected car repair needed. How much will you spend?",
                minAmount: 200,
                maxAmount: 800,
                idealPercentage: 0.3
            },
            {
                description: "Monthly grocery shopping. How much will you allocate?",
                minAmount: 100,
                maxAmount: 500,
                idealPercentage: 0.2
            },
            {
                description: "Emergency medical expense. How much do you set aside?",
                minAmount: 150,
                maxAmount: 600,
                idealPercentage: 0.25
            },
            {
                description: "Phone bill and internet services due. How much to pay?",
                minAmount: 50,
                maxAmount: 200,
                idealPercentage: 0.08
            },
            {
                description: "Planning a weekend trip. What's your budget?",
                minAmount: 100,
                maxAmount: 400,
                idealPercentage: 0.15
            },
            {
                description: "Home maintenance repairs needed. How much to spend?",
                minAmount: 150,
                maxAmount: 700,
                idealPercentage: 0.28
            },
            {
                description: "New work clothes needed. Set your shopping budget:",
                minAmount: 80,
                maxAmount: 300,
                idealPercentage: 0.12
            },
            {
                description: "Family member's wedding gift. How much to give?",
                minAmount: 50,
                maxAmount: 250,
                idealPercentage: 0.1
            },
            {
                description: "Annual insurance premium due. How much to allocate?",
                minAmount: 200,
                maxAmount: 800,
                idealPercentage: 0.3
            },
            {
                description: "Monthly entertainment budget. How much to set aside?",
                minAmount: 40,
                maxAmount: 200,
                idealPercentage: 0.08
            }
        ]
    };

    // Setup game with proper scope
    window.currentGame = game;
    setupGameEventListeners(game);
});

// ...rest of existing code...

// Add these functions after the initialization code

function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        window.transactions = window.transactions.filter(t => t.id !== id);
        localStorage.setItem('transactions', JSON.stringify(window.transactions));
        updateTransactionsList();
        updateBalances();
        updateExpenseChart();
        showNotification('Transaction deleted successfully');
    }
}

function setDefaultDateTime() {
    const dateInput = document.getElementById('transaction-date');
    if (dateInput) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
}

function updateBalances() {
    const currentMonthTransactions = getCurrentMonthTransactions();
    const { income, expenses } = calculateMonthlyTotals(currentMonthTransactions);
    const total = calculateTotalBalance();

    updateBalanceDisplays(total, income, expenses);
}

function calculateMonthlyTotals(transactions) {
    return transactions.reduce((acc, t) => {
        if (t.type === 'income') {
            acc.income += t.amount;
        } else {
            acc.expenses += t.amount;
        }
        return acc;
    }, { income: 0, expenses: 0 });
}

function calculateTotalBalance() {
    return window.transactions.reduce((total, t) => {
        return total + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);
}

function updateBalanceDisplays(total, income, expenses) {
    const symbol = getCurrencySymbol();
    
    const elements = {
        total: document.getElementById('total-balance'),
        income: document.getElementById('monthly-income'),
        expenses: document.getElementById('monthly-expenses')
    };

    if (elements.total) {
        elements.total.textContent = `${symbol}${total.toFixed(2)}`;
        elements.total.className = `text-3xl font-bold ${total >= 0 ? 'text-[#377f8e]' : 'text-red-600'}`;
    }
    
    if (elements.income) {
        elements.income.textContent = `${symbol}${income.toFixed(2)}`;
    }
    
    if (elements.expenses) {
        elements.expenses.textContent = `${symbol}${expenses.toFixed(2)}`;
    }
}

// ...rest of existing code...

function setupEventListeners() {
    // Export dropdown setup
    setupExportDropdown();

    // Handle clicks outside modals
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('budget-modal');
        if (modal && !modal.contains(e.target) && !e.target.closest('#add-budget')) {
            modal.classList.add('hidden');
        }
    });

    // Setup currency change listener
    const currencySelect = document.getElementById('currency-select');
    currencySelect?.addEventListener('change', () => {
        localStorage.setItem('selectedCurrency', currencySelect.value);
        updateCurrencyDisplay();
        updateExpenseChart();
        updateTransactionsList();
        updateBalances();
    });

    // Initialize export functionality
    const exportMenu = document.getElementById('export-menu');
    exportMenu?.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            const format = e.currentTarget.getAttribute('data-format');
            exportTransactions(format);
            exportMenu.classList.add('hidden');
        });
    });
}

// Add export functionality
function exportTransactions(format) {
    const transactions = getFilteredTransactions();
    const symbol = getCurrencySymbol();
    
    const data = transactions.map(t => ({
        Date: new Date(t.date).toLocaleDateString(),
        Description: t.description,
        Category: t.category,
        Amount: `${symbol}${t.amount.toFixed(2)}`,
        Type: t.type
    }));

    switch (format) {
        case 'csv':
            exportAsCSV(data);
            break;
        case 'excel':
            exportAsExcel(data);
            break;
        case 'pdf':
            exportAsPDF(data);
            break;
    }
}

function exportAsCSV(data) {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');

    downloadFile(csvContent, 'transactions.csv', 'text/csv');
}

function exportAsExcel(data) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "transactions.xlsx");
}

function exportAsPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.autoTable({
        head: [Object.keys(data[0])],
        body: data.map(row => Object.values(row))
    });

    doc.save('transactions.pdf');
}

function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ...rest of existing code...

// Rewards System Functions
let currentProblem = null;

function initializeRewardsSystem() {
    // Get DOM elements
    const mathProblemSection = document.getElementById('math-problem-section');
    const mathProblemElement = document.getElementById('math-problem');
    const mathAnswerInput = document.getElementById('math-answer');
    const submitAnswerButton = document.getElementById('submit-answer');
    const rewardSection = document.getElementById('reward-section');
    const errorMessage = document.getElementById('error-message');
    const claimButtons = document.querySelectorAll('.claim-reward-btn');

    // Attach event listeners to claim buttons
    claimButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Generate new problem
            currentProblem = {
                num1: Math.floor(Math.random() * 20) + 1,
                num2: Math.floor(Math.random() * 20) + 1,
                operation: Math.random() > 0.5 ? '+' : '-'
            };

            // Ensure no negative answers for subtraction
            if (currentProblem.operation === '-' && currentProblem.num2 > currentProblem.num1) {
                [currentProblem.num1, currentProblem.num2] = [currentProblem.num2, currentProblem.num1];
            }

            // Calculate answer
            currentProblem.answer = currentProblem.operation === '+' 
                ? currentProblem.num1 + currentProblem.num2 
                : currentProblem.num1 - currentProblem.num2;

            // Update UI
            mathProblemElement.textContent = `Solve: ${currentProblem.num1} ${currentProblem.operation} ${currentProblem.num2}`;
            mathProblemSection.classList.remove('hidden');
            rewardSection.classList.add('hidden');
            errorMessage.classList.add('hidden');
            mathAnswerInput.value = '';
        });
    });

    // Handle answer submission
    submitAnswerButton?.addEventListener('click', () => {
        if (!currentProblem) {
            showNotification('Please click a claim reward button first', 'error');
            return;
        }

        const userAnswer = parseInt(mathAnswerInput.value, 10);

        if (isNaN(userAnswer)) {
            errorMessage.textContent = 'Please enter a valid number';
            errorMessage.classList.remove('hidden');
            return;
        }

        if (userAnswer === currentProblem.answer) {
            mathProblemSection.classList.add('hidden');
            rewardSection.classList.remove('hidden');
            errorMessage.classList.add('hidden');
            document.getElementById('unique-code').textContent = generateCode();
            showNotification('Congratulations! You solved it correctly!', 'success');
            currentProblem = null;
        } else {
            errorMessage.textContent = 'Incorrect answer. Try again!';
            errorMessage.classList.remove('hidden');
            mathAnswerInput.value = '';
            showNotification('Incorrect answer. Try again!', 'error');
        }
    });

    // Add enter key support
    mathAnswerInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitAnswerButton.click();
        }
    });
}

function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) code += '-';
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// ...rest of existing code...

function updateChartDimensions() {
    const isMobile = window.innerWidth <= 768;
    const chartCanvas = document.getElementById('expense-chart');
    if (chartCanvas) {
        chartCanvas.style.height = isMobile ? '250px' : '300px';
    }
}

function makeTableResponsive() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('overflow-x-auto', '-mx-4', 'md:mx-0');
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });
}

function initializeMobileOptimizations() {
    // Handle touch events for dropdowns
    const dropdowns = document.querySelectorAll('.relative');
    dropdowns.forEach(dropdown => {
        let touchStartY;
        dropdown.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        dropdown.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            if (Math.abs(touchEndY - touchStartY) < 5) { // Minimal vertical movement
                const menu = dropdown.querySelector('[id$="-menu"]');
                if (menu) {
                    menu.classList.toggle('hidden');
                }
            }
        });
    });

    // Close dropdowns when touching outside
    document.addEventListener('touchstart', (e) => {
        if (!e.target.closest('.relative')) {
            document.querySelectorAll('[id$="-menu"]').forEach(menu => {
                menu.classList.add('hidden');
            });
        }
    }, { passive: true });
}

// Add to the initialization
document.addEventListener('DOMContentLoaded', () => {
    /* ...existing initialization code... */
    initializeMobileOptimizations();
    makeTableResponsive();
    updateChartDimensions();
});

/* ...rest of existing code... */

function initializeBudgetTab() {
    const addBudgetBtn = document.getElementById('add-budget');
    const modal = document.getElementById('budget-modal');
    const closeBtn = document.getElementById('close-budget-modal');
    const budgetForm = document.getElementById('budget-form');
    const categorySelect = document.getElementById('budget-category');

    populateBudgetCategories(categorySelect);
    setupBudgetEventListeners(addBudgetBtn, modal, closeBtn, budgetForm);
    updateBudgetDisplay();
}

// Add this to the global assignments
window.initializeBudgetTab = initializeBudgetTab;

// ...rest of existing code...
