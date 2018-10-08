
//BUDGET CONTROLLER
let budgetController = (function(){

    let expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0){
        this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        } 
    };

    expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    let income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal =function(type){
        let sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };


    let data = {
        allItems: {
            exp: [],
            inc: []            
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };


    return {
        addItem: function(type, des, val){
            let newItem, ID;
            
            //create ID
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                ID = 0;
            }
            
            //create new item based on inc and exp
            if (type === 'exp'){
                newItem = new expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new income(ID, des, val);
            }
            //push into data structure
            data.allItems[type].push(newItem);
            //return new element
            return newItem;
        },

        deleteItem: function(type, id){
            let ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function(){
            // calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget=> income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of the income that we spent
            if (data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function(){
            let allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
    
        testing: function(){
            console.log(data);
        }
    
    
    
    
    
    
    };


})();


//UI CONTROLLER
let uiController = (function(){

    let domStrings = {
        inputType: '.add__type',
        inputDesciption: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };


    let formatNumber = function(num, type) {
        let numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3 ){
            int = int.substr(0 , int.length - 3) + ',' + int.substr(int.length - 3 , 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    let nodeListForEach = function (list, callback) {
        for (let i = 0 ; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){

            return {
            type : document.querySelector(domStrings.inputType).value, // either inc or exp
            description : document.querySelector(domStrings.inputDesciption).value,
            value : parseFloat(document.querySelector(domStrings.inputValue).value)
            };            
         },
        

        //X1
        addListItem: function(obj, type){
            let html, newHtml, element;

            //create HTML string with placeholer text
            if (type === 'inc'){
                element =domStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {            
                element = domStrings.expensesContainer;

                html = ' <div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // insert html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID){
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
    
        },
        
        clearFields: function(){
            let fields, fieldsArr;

            fields = document.querySelectorAll(domStrings.inputDesciption + ',' + domStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        }, 

        displayBudget: function(obj) {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(domStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0){
            document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(domStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages){
            let fields = document.querySelectorAll(domStrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0){
                current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            let now, year;
            
            now = new Date();
            months = ['January' , 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(domStrings.dateLabel).textContent = months[month] + ' ' +  year;

        },

        changedType: function(){
            let fields = document.querySelectorAll(
                domStrings.inputType + ',' +
                domStrings.inputDesciption + ',' +
                domStrings.inputValue);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus')
            });

            document.querySelector(domStrings.inputBtn).classList.toggle('red');
            
        },
        
        getdomStrings: function(){
            return domStrings;            
        }

    
    };

})();




//GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, uiCtrl){
    
    //EVENT LISTENERS
    let setupEventListners = function(){
        let dom = uiCtrl.getdomStrings();
        document.querySelector(dom.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {    
            if (event.keyCode === 13 || event.which === 13){
                   ctrlAddItem();
            }    
        });

        document.querySelector(dom.container).addEventListener('click', ctrlDeleteitem);

        document.querySelector(dom.inputType).addEventListener('change', uiCtrl.changedType);
    };

    let updateBudget = function(){
        //4. calculate budget
        budgetCtrl.calculateBudget();
        //5. return the budget
        let budget = budgetCtrl.getBudget();
        //6 . display budget on UI
        uiCtrl.displayBudget(budget);
    };

    let updatePercentages = function(){
        //calculate percentages
        budgetCtrl.calculatePercentages();
        //read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages();
        //update the UI with new percentages
        uiCtrl.displayPercentages(percentages);
        
    };
        
    //DEALING WITH INPUT FROM EVENT LISTNERS
    let ctrlAddItem = function() {
        let input, newItem;
        
        //1. get input data
        input = uiCtrl.getInput();
        console.log(input);

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
        //2. add item to budger controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        //3. add item to UI X2
        uiCtrl.addListItem(newItem, input.type);
        //4. clear the fields
        uiCtrl.clearFields();
        //5. calculate and update budget
        updateBudget();
        //6. calculate and update percentages
        updatePercentages();
        }     
        
    };

    let ctrlDeleteitem = function(event){
        let itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // delete item from UI
            uiCtrl.deleteListItem(itemID);
            // update and show new budget
            updateBudget();

        }

    };

    //EXPOSING ONLY REQUIRED FUNCTIONS TO GLOBAL
    return {
        init: function(){
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });          
            setupEventListners();

        }
    }
   




})(budgetController, uiController);

//RUNNING EXPOSED FN
controller.init();