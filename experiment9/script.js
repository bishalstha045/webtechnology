class ScientificCalculator {
    constructor() {
        this.currentInput = '0';
        this.prevInput = '';
        this.memory = 0;
        this.isDegree = true;
        this.history = JSON.parse(localStorage.getItem('calc_history')) || [];
        this.newCalculation = false;

        this.initDOM();
        this.bindEvents();
        this.renderHistory();
        this.initTheme();
    }

    initDOM() {
        this.currDisplay = document.getElementById('currDisplay');
        this.prevDisplay = document.getElementById('prevDisplay');
        this.angleBadge = document.getElementById('angleMode');
        this.memBadge = document.getElementById('memoryBadge');
        this.displayContainer = document.querySelector('.display');
        this.toast = document.getElementById('toast');
    }

    bindEvents() {
        // Buttons
        document.querySelector('.keypad').addEventListener('click', (e) => {
            const btn = e.target.closest('.btn');
            if (!btn) return;

            if (btn.dataset.value) this.handleInput(btn.dataset.value);
            if (btn.dataset.action) this.handleAction(btn.dataset.action);
        });

        // Keyboard
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Copy Result
        this.displayContainer.addEventListener('click', () => this.copyToClipboard());

        // History
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());
        document.getElementById('historyList').addEventListener('click', (e) => {
            const item = e.target.closest('.history-item');
            if (item) {
                if (e.target.closest('.hist-del-btn')) {
                    const id = parseInt(item.dataset.id);
                    this.deleteHistoryItem(id);
                    return;
                }
                this.currentInput = item.dataset.result;
                this.updateDisplay();
            }
        });

        // Theme
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
    }

    updateDisplay() {
        this.currDisplay.innerText = this.currentInput;
        this.prevDisplay.innerText = this.prevInput;
        this.angleBadge.innerText = this.isDegree ? 'DEG' : 'RAD';

        // Auto scroll display
        this.currDisplay.scrollLeft = this.currDisplay.scrollWidth;
    }

    handleInput(val) {
        if (this.currentInput === 'Error') this.currentInput = '0';
        if (this.newCalculation && !['+', '-', '*', '/', '%', '^'].includes(val)) {
            this.currentInput = '0';
        }
        this.newCalculation = false;

        if (this.currentInput === '0' && val !== '.') {
            if (val === '*' || val === '/' || val === '+' || val === '-' || val === '^' || val === '%') {
                this.currentInput = '0' + val;
            } else {
                this.currentInput = val;
            }
        } else {
            this.currentInput += val;
        }
        this.updateDisplay();
    }

    handleAction(action) {
        switch (action) {
            case 'delete':
                if (this.currentInput === 'Error') this.currentInput = '0';
                else if (this.currentInput.length > 1) this.currentInput = this.currentInput.slice(0, -1);
                else this.currentInput = '0';
                break;
            case 'clearAll':
                this.currentInput = '0';
                this.prevInput = '';
                break;
            case 'angle':
                this.isDegree = !this.isDegree;
                break;
            case 'calculate':
                this.calculate();
                break;
        }
        this.updateDisplay();
    }

    handleKeyboard(e) {
        const key = e.key;
        if (/[0-9]/.test(key)) this.handleInput(key);
        else if (['+', '-', '*', '/', '%', '.', '(', ')'].includes(key)) this.handleInput(key);
        else if (key === 'Enter' || key === '=') { e.preventDefault(); this.calculate(); }
        else if (key === 'Backspace') this.handleAction('delete');
        else if (key === 'Escape') this.handleAction('clearAll');
    }

    async calculate() {
        if (!this.currentInput || this.currentInput === 'Error') return;

        const expr = this.currentInput;
        this.prevInput = expr + ' =';

        let parsed = expr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/π/g, 'pi()')
            .replace(/e(?!x)/g, 'exp(1)')
            .replace(/sqrt\(/g, 'sqrt(')
            .replace(/cbrt\(/g, 'cbrt(')
            .replace(/log\(/g, 'log10(')
            .replace(/ln\(/g, 'log(')
            .replace(/asin\(/g, this.isDegree ? 'rad2deg(asin(' : 'asin(')
            .replace(/acos\(/g, this.isDegree ? 'rad2deg(acos(' : 'acos(')
            .replace(/atan\(/g, this.isDegree ? 'rad2deg(atan(' : 'atan(')
            .replace(/sin\(/g, this.isDegree ? 'sin(deg2rad(' : 'sin(')
            .replace(/cos\(/g, this.isDegree ? 'cos(deg2rad(' : 'cos(')
            .replace(/tan\(/g, this.isDegree ? 'tan(deg2rad(' : 'tan(')
            .replace(/\|([^\|]+)\|/g, 'abs($1)')
            .replace(/e\^/g, 'exp(');

        // Power (x^y) - transform to pow()
        parsed = parsed.replace(/(\w+|\([^)]+\))\^(\w+|\([^)]+\))/g, 'pow($1, $2)');

        // Handle Factorial locally before sending to PHP
        while (parsed.includes('!')) {
            parsed = parsed.replace(/(\d+)!/, (match, p1) => this.factorial(parseInt(p1)));
        }

        this.currentInput = '...';
        this.updateDisplay();

        try {
            const response = await fetch('calculate.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ parsedPHP: parsed })
            });

            const data = await response.json();

            if (data.error) {
                this.currentInput = 'Error';
            } else {
                this.currentInput = data.result.toString();
                this.addToHistory(expr, this.currentInput);
            }
        } catch (error) {
            this.currentInput = 'Error';
        }

        this.newCalculation = true;
        this.updateDisplay();
    }

    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }

    addToHistory(expr, result) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const id = Date.now();
        this.history.unshift({ id, expr, result, time });
        if (this.history.length > 20) this.history.pop();
        localStorage.setItem('calc_history', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        const list = document.getElementById('historyList');
        list.innerHTML = '';
        if (this.history.length === 0) {
            list.innerHTML = '<div class="empty-history">No history yet</div>';
            return;
        }

        this.history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.dataset.id = item.id;
            div.dataset.result = item.result;
            div.innerHTML = `
                <div class="hist-header">
                    <span class="hist-time">${item.time || ''}</span>
                    <button class="hist-del-btn" title="Delete Item"><i class="fas fa-times"></i></button>
                </div>
                <div class="hist-expr">${item.expr} =</div>
                <div class="hist-result">${item.result}</div>
            `;
            list.appendChild(div);
        });
    }

    deleteHistoryItem(id) {
        this.history = this.history.filter(h => h.id !== id);
        localStorage.setItem('calc_history', JSON.stringify(this.history));
        this.renderHistory();
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('calc_history');
        this.renderHistory();
    }

    copyToClipboard() {
        if (this.currentInput && this.currentInput !== 'Error') {
            navigator.clipboard.writeText(this.currentInput).then(() => {
                this.toast.classList.add('show');
                setTimeout(() => this.toast.classList.remove('show'), 2000);
            });
        }
    }

    initTheme() {
        const theme = localStorage.getItem('calc_theme') || 'dark';
        document.documentElement.dataset.theme = theme;
        this.updateThemeIcon(theme);
    }

    toggleTheme() {
        const current = document.documentElement.dataset.theme;
        const target = current === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = target;
        localStorage.setItem('calc_theme', target);
        this.updateThemeIcon(target);
    }

    updateThemeIcon(theme) {
        const icon = document.getElementById('themeToggle').querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Start Calculator
document.addEventListener('DOMContentLoaded', () => new ScientificCalculator());
