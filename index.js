import getTodayDateTime from "./DateTime.js";
const categories = document.getElementById("category");
const enterBtn = document.getElementById("submit-btn");
const costInp = document.getElementById("costInp");
const totalCost = document.getElementById("total-cost");
const inputError = document.getElementById("costInpError");
const resetBtn = document.getElementById("reset-btn");
const datetimeInputEl = document.getElementById("datetimeInput");
const xValues = ["food/drink", "transport", "activity", "shopping", "accommodation", "health", "other"];
let selectedCategory = 0;
const barColors = [
    "#fd0046", //food
    "#003fb8", //transport
    "#36972b", //activity
    "#fffb00", //shopping
    "#702b03", //accommodation
    "#c5449d", //health
    "#1e1e1e" //other
];
let costValues = [];
let chart;
document.addEventListener("DOMContentLoaded", () => {
    datetimeInputEl.value = getTodayDateTime();
    costValues = getLocalStorageData();
    if (costValues === null) {
        costValues = [0, 0, 0, 0, 0, 0, 0];
        localStorage.setItem("costValues", JSON.stringify(costValues));
    }
    else {
        const total = costValues.reduce((i, j) => i + j);
        totalCost.textContent = `Total cost € ${total.toFixed(2)}`;
    }
    chart = makeChart();
    for (let i = 0; i < 7; i++) {
        const divEl = document.getElementById(`${xValues[i]}`);
        processCategoryListValues(divEl, costValues[i]);
    }
});
categories.addEventListener("change", () => {
    selectedCategory = categories.selectedIndex;
});
enterBtn.addEventListener("click", () => {
    const costInputValue = Number(Number(costInp.value.trim()).toFixed(2));
    if (!isNaN(costInputValue) && costInputValue > 0) {
        inputError.hidden = true;
        const storedCostValuesString = localStorage.getItem("costValues");
        let storedCostValues = storedCostValuesString ? JSON.parse(storedCostValuesString) : Array(xValues.length).fill(0);
        storedCostValues[selectedCategory] = Number((storedCostValues[selectedCategory] + costInputValue).toFixed(2));
        // Update the chart data
        if (chart && chart.data && chart.data.datasets && chart.data.datasets[0]) {
            chart.data.datasets[0].data = storedCostValues;
            //Rerender chart
            chart.update();
        }
        else {
            console.error("Chart object not found.");
        }
        localStorage.setItem("costValues", JSON.stringify(storedCostValues));
        const divEl = document.getElementById(`${xValues[selectedCategory]}`);
        processCategoryListValues(divEl, storedCostValues[selectedCategory]);
        const total = storedCostValues.reduce((i, j) => i + j, 0);
        totalCost.textContent = `Total cost € ${total.toFixed(2)}`;
        console.log(datetimeInputEl.value);
        costInp.value = "";
    }
    else {
        inputError.hidden = false;
    }
});
//Reset button
resetBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset the data?")) {
        localStorage.clear();
        location.reload();
    }
});
function processCategoryListValues(divEl, cost) {
    divEl.children[1].textContent = `Category cost: € ${cost}`;
}
function makeChart() {
    //@ts-ignore
    return new Chart("myChart", {
        type: "pie",
        data: {
            labels: xValues,
            datasets: [{
                    backgroundColor: barColors,
                    data: JSON.parse(localStorage.getItem("costValues")),
                }]
        }
    });
}
function getLocalStorageData() {
    const data = localStorage.getItem("costValues");
    return data ? JSON.parse(data) : null;
}
costInp.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
        enterBtn.click();
    }
});
