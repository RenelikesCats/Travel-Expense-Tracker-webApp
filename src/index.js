"use strict";
const catergories = document.getElementById("category");
const enterBtn = document.getElementById("submit-btn");
const costInp = document.getElementById("costInp");
const catSection = document.getElementById("category-section");
const xValues = ["food/drinks", "transport", "activity", "shopping", "accommodation", "health", "other"];
let selectedCategory = 0;
const barColors = [
    "#b91d47",
    "#00aba9",
    "#2b5797",
    "#fb3cf3",
    "#1e7145",
    "#acff76",
    "#9f9f9f"
];
let costValues = [];
document.addEventListener("DOMContentLoaded", () => {
    costValues = getLocalStorageData();
    if (costValues === null) {
        costValues = [0, 0, 0, 0, 0, 0, 0];
        localStorage.setItem("costValues", JSON.stringify(costValues));
    }
    toonChart();
});
catergories.addEventListener("change", () => {
    for (let category of catergories) {
        if (category.selected) {
            selectedCategory = category.index;
        }
    }
});
enterBtn.addEventListener("click", () => {
    if (costInp.value.trim() !== "") {
        const costValues = JSON.parse(localStorage.getItem("costValues"));
        costValues[selectedCategory] += Number(costInp.value);
        localStorage.setItem("costValues", JSON.stringify(costValues));
        toonChart();
    }
});
function appendCatSection(catName, cost, description) {
}
function toonChart() {
    new Chart("myChart", {
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
    return JSON.parse(localStorage.getItem("costValues"));
}
