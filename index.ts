const categories = document.getElementById("category") as HTMLSelectElement;
const enterBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const costInp = document.getElementById("costInp") as HTMLInputElement;


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

document.addEventListener("DOMContentLoaded", () => {
    costValues = getLocalStorageData();
    if (costValues === null) {
        costValues = [0, 0, 0, 0, 0, 0, 0];
        localStorage.setItem("costValues", JSON.stringify(costValues));
    }
    chart = makeChart();

    for (let i:number = 0; i < 7; i++) {
        const divEl = document.getElementById(`${xValues[i]}`) as HTMLDivElement;
        processCategoryListValues(divEl, costValues[i])
    }
});

categories.addEventListener("change", (): void => {
    selectedCategory = categories.selectedIndex;
});

enterBtn.addEventListener("click", (): void => {
    const inputError = document.getElementById("costInpError") as HTMLSpanElement

    if (costInp.value.trim() !== "" && Number(costInp.value) > 0) {
        inputError.hidden = true
        const storedCostValues: number[] = JSON.parse(localStorage.getItem("costValues") as string);
        storedCostValues[selectedCategory] += Number(costInp.value);

        // Update the chart data
        // @ts-ignore
        chart.data.datasets[0].data = storedCostValues;
        //Rerender chart
        chart.update();

        localStorage.setItem("costValues", JSON.stringify(storedCostValues));
        const divEl = document.getElementById(`${xValues[selectedCategory]}`) as HTMLDivElement;
        processCategoryListValues(divEl, storedCostValues[selectedCategory]);

        costInp.value = "";

    } else {
        inputError.hidden = false
    }
});

function processCategoryListValues(divEl: HTMLDivElement, cost: number): void {
    divEl.children[1].textContent = `Totaal: ${cost}`;

}

function makeChart(): Chart {
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