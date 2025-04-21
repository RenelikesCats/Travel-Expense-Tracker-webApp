import getTodayDateTime from "./DateTime.js";

//Does it look bad or messy? :D I tried my best refactoring, optimizing and keeping it clean
//There is always room for improvement! So if you are reading this, let me know if you have any suggestions :)

const DOMELEMEMENTS = {
    //Select elements
    cat: document.getElementById("category") as HTMLSelectElement,
    //Input elements
    costInp: document.getElementById("costInp") as HTMLInputElement,
    dateInp: document.getElementById("datetimeInput") as HTMLInputElement,
    descInp: document.getElementById("description") as HTMLInputElement,
    //Span elements
    totalCost: document.getElementById("total-cost") as HTMLSpanElement,
    inpErr: document.getElementById("costInpError") as HTMLSpanElement,

    resetBtn: document.getElementById("reset-btn") as HTMLButtonElement,
    enterBtn: document.getElementById("submit-btn") as HTMLButtonElement,

    //Modal elements
    modal: document.getElementById("myModal") as HTMLDivElement,
    modalClose: document.getElementsByClassName("close")[0] as HTMLSpanElement,
    modalViewBtns: document.getElementsByClassName("category-list-btn") as HTMLCollectionOf<HTMLButtonElement>,
    modalBody: document.getElementById("modal-body-items") as HTMLDivElement,
};

const CATEGORIES: string[] = ["Food/Drink", "Transport", "Activity", "Shopping", "Accommodation", "Health", "Other"];
const COLORS: string[] = [
    "#fd0046",
    "#003fb8",
    "#36972b",
    "#fffb00",
    "#702b03",
    "#c5449d",
    "#1e1e1e"];

const COST_KEY: string = "costValues";
const USER_KEY: string = "userData";

let selectedCatIndex: number = 0;
let nextId: number;// Id to keep track of buttons :) not sure if it's the best way to do it, but it works for now :D
let costs: number[] = [];
let myChart: Chart | null = null;

type ExpenseData = {
    id: number
    category: string
    cost: number
    description?: string
    date: string
};

const getLocal = <T>(key: string): T | null => JSON.parse(localStorage.getItem(key) as string);
const setLocal = <T>(key: string, data: T): void => localStorage.setItem(key, JSON.stringify(data));
const initCosts = (): void => {
    costs = getLocal<number[]>(COST_KEY) || Array(CATEGORIES.length).fill(0);
    setLocal(COST_KEY, costs);
    DOMELEMEMENTS.totalCost.textContent = `Total cost € ${costs.reduce((sum, cost) => sum + cost, 0).toFixed(2)}`;
};
const initId = (): void => {
    //So if userData size is bigger 0,
    // then nextId's value is assigned to the last element's id in userData + 1
    // otherwise it's assigned to 0 🐈
    const users = getLocal<ExpenseData[]>(USER_KEY) || [];
    nextId = users.length > 0 ? users[users.length - 1].id + 1 : 0;
};

document.addEventListener("DOMContentLoaded", (): void => {
    DOMELEMEMENTS.dateInp.value = getTodayDateTime();
    initCosts();
    initId();
    myChart = makeChart();
    CATEGORIES.forEach((_, i) => updateCatDisplay(i, costs[i] || 0));
});


// @ts-ignore
const makeChart = (): Chart => new Chart("myChart", {
    type: "pie",
    data: {
        labels: CATEGORIES,
        datasets: [{
            backgroundColor: COLORS,
            data: costs,
        }],
    },
});
const updateCatDisplay = (index: number, cost: number): void => {
    const el = document.getElementById(CATEGORIES[index]) as HTMLDivElement;
    el ? el.children[1].textContent = `Category cost: € ${cost.toFixed(2)}` : void 0;
};
const saveExpense = (expense: ExpenseData): void => {
    const expenses = getLocal<ExpenseData[]>(USER_KEY) || [];
    expenses.push(expense);
    setLocal(USER_KEY, expenses);
};
const updateChartData = (): void => {
    if (myChart?.data?.datasets) {
        myChart.data.datasets[0].data = costs;
        myChart.update();
    }
};

DOMELEMEMENTS.cat.addEventListener("change", (): void => {
    selectedCatIndex = DOMELEMEMENTS.cat.selectedIndex;
});

DOMELEMEMENTS.enterBtn.addEventListener("click", (): void => {
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
    } else {
        DOMELEMEMENTS.inpErr.hidden = false;
    }
});

Array.from(DOMELEMEMENTS.modalViewBtns).forEach(btn => btn.addEventListener("click", (): void => {
    DOMELEMEMENTS.modalBody.innerHTML = "";
    const expenses = getLocal<ExpenseData[]>(USER_KEY) || [];

    if (expenses.length > 0) {
        const cat: string = CATEGORIES[Number(btn.dataset.index)];
        const catExpenses = expenses.filter(e => e.category === cat);
        (document.getElementById("modal-title") as HTMLHeadingElement).textContent = cat;

        if (catExpenses.length > 0) {
            catExpenses.forEach(item => {
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("modal-item");
                const closeBtn = document.createElement("span");
                closeBtn.classList.add("close-modal");
                closeBtn.innerHTML = "&times;";
                closeBtn.addEventListener("click", (): void => {
                    const currentCosts = getLocal<number[]>(COST_KEY);
                    const currentExpenses = getLocal<ExpenseData[]>(USER_KEY) || [];
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
        } else {
            const noItems = document.createElement("i");
            noItems.textContent = "No items in this category yet.";
            DOMELEMEMENTS.modalBody.appendChild(noItems);
            DOMELEMEMENTS.modal.style.display = "block";
        }
    }
}));

DOMELEMEMENTS.resetBtn.addEventListener("click", (): void => {
    if (confirm("Are you sure you want to reset the data?")) {
        localStorage.clear();
        location.reload();
    }
});

DOMELEMEMENTS.costInp.addEventListener("keypress", (e: KeyboardEvent): void => {
    if (e.key === "Enter") {
        DOMELEMEMENTS.enterBtn.click();
    }
});

window.addEventListener("click", (e: MouseEvent): void => {
    if (e.target === DOMELEMEMENTS.modal) {
        DOMELEMEMENTS.modal.style.display = "none";
    }
});

DOMELEMEMENTS.modalClose.addEventListener("click", (): void => {
    DOMELEMEMENTS.modal.style.display = "none";
});