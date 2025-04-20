import getTodayDateTime from "./DateTime.js";
const categories = document.getElementById("category");
const enterBtn = document.getElementById("submit-btn");
const costInp = document.getElementById("costInp");
const totalCost = document.getElementById("total-cost");
const inputError = document.getElementById("costInpError");
const resetBtn = document.getElementById("reset-btn");
const datetimeInputEl = document.getElementById("datetimeInput");
const description = document.getElementById("description");
const modal = document.getElementById("myModal");
const modalCloseBtn = document.getElementsByClassName("close")[0];
const modalViewBtns = document.getElementsByClassName("category-list-btn");
const modalBody = document.getElementById("modal-body-items");
const xValues = ["Food/Drink", "Transport", "Activity", "Shopping", "Accommodation", "Health", "Other"];
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
    if (!isNaN(costInputValue) && costInputValue > 0 && datetimeInputEl.value !== "") {
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
        const userData = {
            category: xValues[selectedCategory],
            cost: costInputValue,
            date: datetimeInputEl.value,
            description: description.value
        };
        saveUserData(userData);
        costInp.value = "";
        description.value = "";
    }
    else {
        inputError.hidden = false;
    }
});
function processCategoryListValues(divEl, cost) {
    divEl.children[1].textContent = `Category cost: € ${cost}`;
}
function saveUserData(userData) {
    let localStorageData = JSON.parse(localStorage.getItem("userData"));
    localStorageData !== null ? localStorageData.push(userData) : localStorageData = [userData];
    localStorage.setItem("userData", JSON.stringify(localStorageData));
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
for (let button of modalViewBtns) {
    button.addEventListener("click", () => {
        modalBody.innerHTML = "";
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData !== null) {
            const modalTitle = document.getElementById("modal-title");
            const selectedCategory = xValues[Number(button.dataset.index)];
            const data = userData.filter(data => data.category === selectedCategory);
            if (data.length > 0) {
                modalTitle.textContent = selectedCategory;
                data.forEach(item => {
                    const itemDiv = document.createElement("div");
                    itemDiv.classList.add("modal-item");
                    const costElement = document.createElement("p");
                    costElement.textContent = `€ ${item.cost}`;
                    const dateTime = document.createElement("p");
                    dateTime.textContent = `${item.date.split("T")[0]} ${item.date.split("T")[1]}`;
                    const description = document.createElement("p");
                    description.textContent = `${item.description} `;
                    itemDiv.appendChild(costElement);
                    itemDiv.appendChild(dateTime);
                    itemDiv.appendChild(description);
                    modalBody.appendChild(itemDiv);
                });
                modal.style.display = "block";
            }
        }
    });
}
function getLocalStorageData() {
    const data = localStorage.getItem("costValues");
    return data ? JSON.parse(data) : null;
}
//Reset button
resetBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset the data?")) {
        localStorage.clear();
        location.reload();
    }
});
//Simulate enter
costInp.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
        enterBtn.click();
    }
});
window.addEventListener("click", (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});
modalCloseBtn.addEventListener("click", () => {
    modal.style.display = "none";
});
