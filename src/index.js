"use strict";
const categories = document.getElementById("category");
const enterBtn = document.getElementById("submit-btn");
const costInp = document.getElementById("costInp");
const catSection = document.getElementById("category-section");
const xValues = ["food/drinks", "transport", "activity", "shopping", "accommodation", "health", "other"];
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
    chart = chartMaken();
});
categories.addEventListener("change", () => {
    selectedCategory = categories.selectedIndex;
});
enterBtn.addEventListener("click", () => {
    if (costInp.value.trim() !== "") {
        const storedCostValues = JSON.parse(localStorage.getItem("costValues"));
        storedCostValues[selectedCategory] += Number(costInp.value);
        // Update the chart data
        // @ts-ignore
        chart.data.datasets[0].data = storedCostValues;
        //Rerender chart
        chart.update();
        localStorage.setItem("costValues", JSON.stringify(storedCostValues));
        costInp.value = "";
    }
});
/*
function appendCatSection(catName: string, cost: number, description?: string): void {
    const span = document.createElement("span");
    span.innerText = `${catName}: ${cost}`; // Display cost in the appended section
    catSection.appendChild(span);
}

 */
function chartMaken() {
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
