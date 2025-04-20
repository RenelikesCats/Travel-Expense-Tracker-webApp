import getTodayDateTime from "./DateTime.js";

const categories = document.getElementById("category") as HTMLSelectElement;
const enterBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const costInp = document.getElementById("costInp") as HTMLInputElement;
const totalCost = document.getElementById("total-cost") as HTMLSpanElement;
const inputError = document.getElementById("costInpError") as HTMLSpanElement
const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement;
const datetimeInputEl = document.getElementById("datetimeInput") as HTMLInputElement;

const xValues: string[] = ["food/drink", "transport", "activity", "shopping", "accommodation", "health", "other"];
let selectedCategory: number = 0;

const barColors: string[] = [
    "#fd0046", //food
    "#003fb8", //transport
    "#36972b", //activity
    "#fffb00", //shopping
    "#702b03", //accommodation
    "#c5449d", //health
    "#1e1e1e"  //other
];

let costValues: number[] | null = [];
let chart: Chart;

document.addEventListener("DOMContentLoaded", (): void => {
    datetimeInputEl.value = getTodayDateTime();
    costValues = getLocalStorageData();
    if (costValues === null) {
        costValues = [0, 0, 0, 0, 0, 0, 0];
        localStorage.setItem("costValues", JSON.stringify(costValues));
    } else {
        const total: number = costValues.reduce((i: number, j: number) => i + j);
        totalCost.textContent = `Total cost € ${total.toFixed(2)}`
    }
    chart = makeChart();

    for (let i: number = 0; i < 7; i++) {
        const divEl = document.getElementById(`${xValues[i]}`) as HTMLDivElement;
        processCategoryListValues(divEl, costValues[i])
    }
});

categories.addEventListener("change", (): void => {
    selectedCategory = categories.selectedIndex;
});

enterBtn.addEventListener("click", (): void => {
    const costInputValue: number = Number(Number(costInp.value.trim()).toFixed(2));

    if (!isNaN(costInputValue) && costInputValue > 0) {
        inputError.hidden = true;
        const storedCostValuesString = localStorage.getItem("costValues");
        let storedCostValues: number[] = storedCostValuesString ? JSON.parse(storedCostValuesString) : Array(xValues.length).fill(0);

        storedCostValues[selectedCategory] = Number((storedCostValues[selectedCategory] + costInputValue).toFixed(2));

        // Update the chart data
        if (chart && chart.data && chart.data.datasets && chart.data.datasets[0]) {
            chart.data.datasets[0].data = storedCostValues;
            //Rerender chart
            chart.update();
        } else {
            console.error("Chart object not found.");
        }

        localStorage.setItem("costValues", JSON.stringify(storedCostValues));

        const divEl = document.getElementById(`${xValues[selectedCategory]}`) as HTMLDivElement;
        processCategoryListValues(divEl, storedCostValues[selectedCategory]);

        const total: number = storedCostValues.reduce((i: number, j: number) => i + j, 0);
        totalCost.textContent = `Total cost € ${total.toFixed(2)}`;

        console.log(datetimeInputEl.value);


        costInp.value = "";

    } else {
        inputError.hidden = false;
    }
});

//Reset button
resetBtn.addEventListener("click", (): void => {
    if (confirm("Are you sure you want to reset the data?")) {
        localStorage.clear();
        location.reload();
    }
});

function processCategoryListValues(divEl: HTMLDivElement, cost: number): void {
    divEl.children[1].textContent = `Category cost: € ${cost}`;
}

function makeChart(): Chart {
    //@ts-ignore
    return new Chart("myChart", {
        type: "pie",
        data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors,
                data: JSON.parse(localStorage.getItem("costValues") as string),
            }]
        }
    });
}

function getLocalStorageData(): number[] | null {
    const data = localStorage.getItem("costValues");
    return data ? JSON.parse(data) : null;
}

costInp.addEventListener("keypress", (event: KeyboardEvent): void => {
    if (event.key == "Enter") {
        enterBtn.click();
    }
})