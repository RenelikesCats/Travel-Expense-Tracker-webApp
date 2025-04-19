const categories = document.getElementById("category") as HTMLSelectElement;
const enterBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const costInp = document.getElementById("costInp") as HTMLInputElement;
const catSection = document.getElementById("category-section") as HTMLElement;

const xValues: string[] = ["food/drinks", "transport", "activity", "shopping", "accommodation", "health", "other"];
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
    chart = chartMaken();
});

categories.addEventListener("change", (): void => {
    selectedCategory = categories.selectedIndex;
});

enterBtn.addEventListener("click", (): void => {
    if (costInp.value.trim() !== "") {
        const storedCostValues: number[] = JSON.parse(localStorage.getItem("costValues") as string);
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

function chartMaken(): Chart {
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