import getTodayDateTime from "./DateTime.js";
//Does it look bad or messy? :D I tried my best refactoring, optimizing and keeping it clean
//There is always room for improvement! So if you are reading this, let me know if you have any suggestions :)
const DOMELEMEMENTS = {
    //Select elements
    cat: document.getElementById("category"),
    //Input elements
    costInp: document.getElementById("costInp"),
    dateInp: document.getElementById("datetimeInput"),
    descInp: document.getElementById("description"),
    //Span elements
    totalCost: document.getElementById("total-cost"),
    inpErr: document.getElementById("costInpError"),
    resetBtn: document.getElementById("reset-btn"),
    enterBtn: document.getElementById("submit-btn"),
    //Modal elements
    modal: document.getElementById("myModal"),
    modalClose: document.getElementsByClassName("close")[0],
    modalViewBtns: document.getElementsByClassName("category-list-btn"),
    modalBody: document.getElementById("modal-body-items"),
};
const CATEGORIES = ["Food/Drink", "Transport", "Activity", "Shopping", "Accommodation", "Health", "Other"];
const COLORS = [
    "#fd0046",
    "#003fb8",
    "#36972b",
    "#fffb00",
    "#702b03",
    "#c5449d",
    "#1e1e1e"
];
const COST_KEY = "costValues";
const USER_KEY = "userData";
let selectedCatIndex = 0;
let nextId; // Id to keep track of buttons :) not sure if it's the best way to do it, but it works for now :D
let costs = [];
let myChart = null;
const getLocal = (key) => JSON.parse(localStorage.getItem(key));
const setLocal = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const initCosts = () => {
    costs = getLocal(COST_KEY) || Array(CATEGORIES.length).fill(0);
    setLocal(COST_KEY, costs);
    DOMELEMEMENTS.totalCost.textContent = `Total cost € ${costs.reduce((sum, cost) => sum + cost, 0).toFixed(2)}`;
};
const initId = () => {
    //So if userData size is bigger 0,
    // then nextId's value is assigned to the last element's id in userData + 1
    // otherwise it's assigned to 0 🐈
    const users = getLocal(USER_KEY) || [];
    nextId = users.length > 0 ? users[users.length - 1].id + 1 : 0;
};
document.addEventListener("DOMContentLoaded", () => {
    DOMELEMEMENTS.dateInp.value = getTodayDateTime();
    initCosts();
    initId();
    myChart = makeChart();
    CATEGORIES.forEach((_, i) => updateCatDisplay(i, costs[i] || 0));
});
// @ts-ignore
const makeChart = () => new Chart("myChart", {
    type: "pie",
    data: {
        labels: CATEGORIES,
        datasets: [{
                backgroundColor: COLORS,
                data: costs,
            }],
    },
});
const updateCatDisplay = (index, cost) => {
    const el = document.getElementById(CATEGORIES[index]);
    el ? el.children[1].textContent = `Category cost: € ${cost.toFixed(2)}` : void 0;
};
const saveExpense = (expense) => {
    const expenses = getLocal(USER_KEY) || [];
    expenses.push(expense);
    setLocal(USER_KEY, expenses);
};
const updateChartData = () => {
    if (myChart?.data?.datasets) {
        myChart.data.datasets[0].data = costs;
        myChart.update();
    }
};
DOMELEMEMENTS.cat.addEventListener("change", () => {
    selectedCatIndex = DOMELEMEMENTS.cat.selectedIndex;
});
DOMELEMEMENTS.enterBtn.addEventListener("click", () => {
    const cost = Number(DOMELEMEMENTS.costInp.value.trim());
    if (!isNaN(cost) && cost > 0 && DOMELEMEMENTS.dateInp.value) {
        DOMELEMEMENTS.inpErr.hidden = true;
        costs[selectedCatIndex] = Number((costs[selectedCatIndex] + cost).toFixed(2));
        setLocal(COST_KEY, costs);
        updateCatDisplay(selectedCatIndex, costs[selectedCatIndex]);
        DOMELEMEMENTS.totalCost.textContent = `Total cost € ${costs.reduce((i, j) => i + j, 0).toFixed(2)}`;
        updateChartData();
        saveExpense({
            id: nextId++,
            category: CATEGORIES[selectedCatIndex],
            cost,
            date: DOMELEMEMENTS.dateInp.value,
            description: DOMELEMEMENTS.descInp.value,
        });
        DOMELEMEMENTS.costInp.value = "";
        DOMELEMEMENTS.descInp.value = "";
    }
    else {
        DOMELEMEMENTS.inpErr.hidden = false;
    }
});
Array.from(DOMELEMEMENTS.modalViewBtns).forEach(btn => btn.addEventListener("click", () => {
    DOMELEMEMENTS.modalBody.innerHTML = "";
    const expenses = getLocal(USER_KEY) || [];
    if (expenses.length > 0) {
        const cat = CATEGORIES[Number(btn.dataset.index)];
        const catExpenses = expenses.filter(e => e.category === cat);
        document.getElementById("modal-title").textContent = cat;
        if (catExpenses.length > 0) {
            catExpenses.forEach(item => {
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("modal-item");
                const closeBtn = document.createElement("span");
                closeBtn.classList.add("close-modal");
                closeBtn.innerHTML = "&times;";
                closeBtn.addEventListener("click", () => {
                    const currentCosts = getLocal(COST_KEY);
                    const currentExpenses = getLocal(USER_KEY) || [];
                    if (currentCosts) {
                        const catIndex = CATEGORIES.indexOf(item.category);
                        currentCosts[catIndex] = Number((currentCosts[catIndex] - item.cost).toFixed(2));
                        setLocal(COST_KEY, currentCosts);
                        const indexToRemove = currentExpenses.findIndex(e => e.id === item.id);
                        if (indexToRemove > -1) {
                            currentExpenses.splice(indexToRemove, 1);
                            setLocal(USER_KEY, currentExpenses);
                        }
                        updateCatDisplay(catIndex, currentCosts[catIndex]);
                        costs = currentCosts;
                        DOMELEMEMENTS.totalCost.textContent = `Total cost € ${costs.reduce((i, j) => i + j, 0).toFixed(2)}`;
                        updateChartData();
                        itemDiv.remove();
                    }
                });
                const costEl = document.createElement("p");
                costEl.textContent = `€ ${item.cost.toFixed(2)}`;
                const dateEl = document.createElement("p");
                const [datePart, timePart] = item.date.split("T");
                dateEl.textContent = `${datePart} ${timePart?.split(".")[0] || ""}`;
                const descEl = document.createElement("p");
                descEl.textContent = item.description || "";
                itemDiv.append(closeBtn, costEl, dateEl, descEl);
                DOMELEMEMENTS.modalBody.appendChild(itemDiv);
            });
            DOMELEMEMENTS.modal.style.display = "block";
        }
        else {
            const noItems = document.createElement("i");
            noItems.textContent = "No items in this category yet.";
            DOMELEMEMENTS.modalBody.appendChild(noItems);
            DOMELEMEMENTS.modal.style.display = "block";
        }
    }
}));
DOMELEMEMENTS.resetBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset the data?")) {
        localStorage.clear();
        location.reload();
    }
});
DOMELEMEMENTS.costInp.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        DOMELEMEMENTS.enterBtn.click();
    }
});
window.addEventListener("click", (e) => {
    if (e.target === DOMELEMEMENTS.modal) {
        DOMELEMEMENTS.modal.style.display = "none";
    }
});
DOMELEMEMENTS.modalClose.addEventListener("click", () => {
    DOMELEMEMENTS.modal.style.display = "none";
});
