"use strict";
const categories = document.getElementById("category");
const enterBtn = document.getElementById("submit-btn");
const costInp = document.getElementById("costInp");
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
    costValues = getLocalStorageData();
    if (costValues === null) {
        costValues = [0, 0, 0, 0, 0, 0, 0];
        localStorage.setItem("costValues", JSON.stringify(costValues));
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
    const inputError = document.getElementById("costInpError");
    if (costInp.value.trim() !== "" && Number(costInp.value) > 0) {
        inputError.hidden = true;
        const storedCostValues = JSON.parse(localStorage.getItem("costValues"));
        storedCostValues[selectedCategory] += Number(costInp.value);
        // Update the chart data
        // @ts-ignore
        chart.data.datasets[0].data = storedCostValues;
        //Rerender chart
        chart.update();
        localStorage.setItem("costValues", JSON.stringify(storedCostValues));
        const divEl = document.getElementById(`${xValues[selectedCategory]}`);
        processCategoryListValues(divEl, storedCostValues[selectedCategory]);
        costInp.value = "";
    }
    else {
        inputError.hidden = false;
    }
});
function processCategoryListValues(divEl, cost) {
    divEl.children[1].textContent = `Totaal: ${cost}`;
}
function makeChart() {
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
