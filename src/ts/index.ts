import getTodayDateTime from "./DateTime.js";

const categories = document.getElementById("category") as HTMLSelectElement;
const enterBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const costInp = document.getElementById("costInp") as HTMLInputElement;
const totalCost = document.getElementById("total-cost") as HTMLSpanElement;
const inputError = document.getElementById("costInpError") as HTMLSpanElement
const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement;
const datetimeInputEl = document.getElementById("datetimeInput") as HTMLInputElement;
const description = document.getElementById("description") as HTMLInputElement;

const modal = document.getElementById("myModal") as HTMLDivElement;
const modalCloseBtn = document.getElementsByClassName("close")[0];
const modalViewBtns = document.getElementsByClassName("category-list-btn") as HTMLCollectionOf<HTMLButtonElement>;
const modalBody = document.getElementById("modal-body-items") as HTMLDivElement;

const xValues: string[] = ["Food/Drink", "Transport", "Activity", "Shopping", "Accommodation", "Health", "Other"];
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

type UserData = {
    category: string
    cost: number
    description?: string
    date: string
}
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

    if (!isNaN(costInputValue) && costInputValue > 0 && datetimeInputEl.value !== "") {
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

        const userData: UserData = {
            category: xValues[selectedCategory],
            cost: costInputValue,
            date: datetimeInputEl.value,
            description: description.value
        }
        saveUserData(userData);

        costInp.value = "";
        description.value = "";
    } else {
        inputError.hidden = false;
    }
});

function processCategoryListValues(divEl: HTMLDivElement, cost: number): void {
    divEl.children[1].textContent = `Category cost: € ${cost}`;
}

function saveUserData(userData: UserData): void {
    let localStorageData: UserData[] | null = JSON.parse(<string>localStorage.getItem("userData"));
    localStorageData !== null ? localStorageData.push(userData) : localStorageData = [userData];
    localStorage.setItem("userData", JSON.stringify(localStorageData));
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

for (let button of modalViewBtns) {
    button.addEventListener("click", (): void => {
        modalBody.innerHTML = "";
        const userData: UserData[] = JSON.parse(localStorage.getItem("userData") as string);
        if (userData !== null) {
            const modalTitle = document.getElementById("modal-title") as HTMLHeadingElement
            const selectedCategory: string = xValues[Number(button.dataset.index)]
            const data: UserData[] = userData.filter(data => data.category === selectedCategory)
            if (data.length > 0) {
                modalTitle.textContent = selectedCategory;
                data.forEach(item => {
                    const itemDiv = document.createElement("div");
                    itemDiv.classList.add("modal-item");

                    const costElement: HTMLParagraphElement = document.createElement("p");
                    costElement.textContent = `€ ${item.cost}`;

                    const dateTime: HTMLParagraphElement = document.createElement("p");
                    dateTime.textContent = `${item.date.split("T")[0]} ${item.date.split("T")[1]}`;

                    const description: HTMLParagraphElement = document.createElement("p");
                    description.textContent = `${item.description} `

                    itemDiv.appendChild(costElement);
                    itemDiv.appendChild(dateTime);
                    itemDiv.appendChild(description);
                    modalBody.appendChild(itemDiv);
                })
                modal.style.display = "block";
            }
        }
    })
}

function getLocalStorageData(): number[] | null {
    const data = localStorage.getItem("costValues");
    return data ? JSON.parse(data) : null;
}

//Reset button
resetBtn.addEventListener("click", (): void => {
    if (confirm("Are you sure you want to reset the data?")) {
        localStorage.clear();
        location.reload();
    }
});

//Simulate enter
costInp.addEventListener("keypress", (event: KeyboardEvent): void => {
    if (event.key == "Enter") {
        enterBtn.click();
    }
});
window.addEventListener("click", (event: MouseEvent): void => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});
modalCloseBtn.addEventListener("click", (): void => {
    modal.style.display = "none";
});