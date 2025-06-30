$(document).ready(function() {
    // Calculator state
    let currentOperand = '0';
    let previousOperand = '';
    let operation = undefined;
    let calculationHistory = [];
    
    // DOM Elements
    const currentOperandElement = $('.current-operand');
    const previousOperandElement = $('.previous-operand');
    const historyList = $('.history-list');
    
    // Initialize calculator
    updateDisplay();
    loadHistory();
    
    // Number buttons click handler
    $('.number-btn').on('click', function() {
        const number = $(this).data('number');
        animateButton(this);
        
        // Handle decimal point separately
        if (number === '.') {
            if (!currentOperand.includes('.')) {
                // If current operand is empty or 0, start with '0.'
                if (currentOperand === '0') {
                    currentOperand = '0.';
                } else {
                    currentOperand += '.';
                }
            }
        } 
        // Handle numbers
        else {
            if (currentOperand === '0') {
                currentOperand = number.toString();
            } else {
                currentOperand += number.toString();
            }
        }
        
        updateDisplay();
    });
    
    // Operation buttons click handler
    $('.operation-btn').on('click', function() {
        const operationType = $(this).data('operation');
        animateButton(this);
        
        switch(operationType) {
            case 'clear':
                clearAll();
                break;
            case 'backspace':
                backspace();
                break;
            case 'percentage':
                percentage();
                break;
            case '±':
                toggleSign();
                break;
            case '=':
                compute();
                break;
            default:
                chooseOperation(operationType);
        }
        
        updateDisplay();
    });
    
    // Clear history button
    $('#clear-history').on('click', function() {
        calculationHistory = [];
        saveHistory();
        renderHistory();
    });
    
    // History item click handler
    $(document).on('click', '.history-item', function() {
        const result = $(this).data('result');
        currentOperand = result.toString();
        updateDisplay();
    });
    
    // Keyboard support
    $(document).on('keydown', function(e) {
        if ((e.key >= 0 && e.key <= 9) || e.key === '.') {
            const button = $(`.number-btn[data-number="${e.key}"]`);
            if (button.length) {
                animateButton(button[0]);
                
                if (e.key === '.') {
                    if (!currentOperand.includes('.')) {
                        if (currentOperand === '0') {
                            currentOperand = '0.';
                        } else {
                            currentOperand += '.';
                        }
                    }
                } else {
                    if (currentOperand === '0') {
                        currentOperand = e.key;
                    } else {
                        currentOperand += e.key;
                    }
                }
                
                updateDisplay();
            }
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            const operationMap = {'/': '÷', '*': '×'};
            const op = operationMap[e.key] || e.key;
            const button = $(`.operation-btn[data-operation="${op}"]`);
            if (button.length) {
                animateButton(button[0]);
                chooseOperation(op);
                updateDisplay();
            }
        } else if (e.key === 'Enter' || e.key === '=') {
            const button = $('.operation-btn[data-operation="="]');
            animateButton(button[0]);
            compute();
            updateDisplay();
        } else if (e.key === 'Escape') {
            const button = $('.operation-btn[data-operation="clear"]');
            animateButton(button[0]);
            clearAll();
            updateDisplay();
        } else if (e.key === 'Backspace') {
            const button = $('.operation-btn[data-operation="backspace"]');
            animateButton(button[0]);
            backspace();
            updateDisplay();
        }
    });
    
    // Calculator functions
    function clearAll() {
        currentOperand = '0';
        previousOperand = '';
        operation = undefined;
    }
    
    function backspace() {
        if (currentOperand.length === 1) {
            currentOperand = '0';
        } else {
            currentOperand = currentOperand.slice(0, -1);
        }
    }
    
    function percentage() {
        currentOperand = (parseFloat(currentOperand) / 100).toString();
    }
    
    function toggleSign() {
        currentOperand = (parseFloat(currentOperand) * -1).toString();
    }
    
    function chooseOperation(op) {
        if (currentOperand === '0' && previousOperand === '') return;
        
        if (previousOperand !== '') {
            compute(false);
        }
        
        operation = op;
        previousOperand = currentOperand;
        currentOperand = '0';
    }
    
    function compute(addToHistory = true) {
        let computation;
        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                computation = prev / current;
                break;
            default:
                return;
        }
        
        if (addToHistory) {
            // Add to history
            const historyEntry = {
                calculation: `${previousOperand} ${operation} ${currentOperand}`,
                result: computation
            };
            
            calculationHistory.push(historyEntry);
            if (calculationHistory.length > 10) {
                calculationHistory.shift();
            }
            
            saveHistory();
            renderHistory();
        }
        
        currentOperand = computation.toString();
        operation = undefined;
        previousOperand = '';
    }
    
    function updateDisplay() {
        // Show decimal point even if it's alone (like "0.")
        currentOperandElement.text(currentOperand);
        
        if (operation != null) {
            previousOperandElement.text(`${formatNumber(previousOperand)} ${operation}`);
        } else {
            previousOperandElement.text('');
        }
    }
    
    function formatNumber(number) {
        const floatNumber = parseFloat(number);
        if (isNaN(floatNumber)) return number;
        
        // For integers, don't show decimal places
        if (floatNumber % 1 === 0) {
            return floatNumber.toLocaleString('en');
        }
        
        // For decimals, limit to 8 decimal places
        return floatNumber.toLocaleString('en', {
            maximumFractionDigits: 8
        });
    }
    
    // History functions
    function saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(calculationHistory));
    }
    
    function loadHistory() {
        const savedHistory = localStorage.getItem('calculatorHistory');
        if (savedHistory) {
            calculationHistory = JSON.parse(savedHistory);
            renderHistory();
        }
    }
    
    function renderHistory() {
        historyList.empty();
        
        calculationHistory.forEach((item, index) => {
            const historyItem = $(`
                <div class="history-item fade-in" data-result="${item.result}">
                    <div class="d-flex justify-content-between">
                        <small class="text-white-50">${item.calculation}</small>
                        <strong>${formatNumber(item.result)}</strong>
                    </div>
                </div>
            `);
            
            historyItem.css('animation-delay', `${index * 0.05}s`);
            historyList.append(historyItem);
        });
    }
    
    // Animation function
    function animateButton(button) {
        $(button).addClass('button-press');
        setTimeout(() => {
            $(button).removeClass('button-press');
        }, 200);
    }
});