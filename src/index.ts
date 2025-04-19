const catergories = document.getElementById("category") as HTMLSelectElement;
const enterBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const costInp = document.getElementById("costInp") as HTMLInputElement;
const catSection = document.getElementById("category-section") as HTMLElement;

const xValues: string[] = ["food/drinks", "transport", "activity", "shopping", "accommodation", "health", "other"]
let selectedCategory: number = 0

const barColors: string[] = [
    "#b91d47",
    "#00aba9",
    "#2b5797",
    "#fb3cf3",
    "#1e7145",
    "#acff76",
    "#9f9f9f"
]

let costValues: number[] | null = []
document.addEventListener("DOMContentLoaded", () => {
    costValues = getLocalStorageData()
    if (costValues === null) {
        costValues = [0, 0, 0, 0, 0, 0, 0]
        localStorage.setItem("costValues", JSON.stringify(costValues))
    }
    toonChart()
})

catergories.addEventListener("change", (): void => {
    for (let category of catergories) {
        if (category.selected) {
            selectedCategory = category.index
        }
    }
})

enterBtn.addEventListener("click", (): void => {
    if (costInp.value.trim() !== "") {
        const costValues: number[] = JSON.parse(<string>localStorage.getItem("costValues"))
        costValues[selectedCategory] += Number(costInp.value)

        localStorage.setItem("costValues", JSON.stringify(costValues))
        toonChart()
    }
})

function appendCatSection(catName: string, cost: number, description?: string): void {




}


function toonChart(): void {
    new Chart("myChart", {
        type: "pie",
        data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors,
                data: JSON.parse(<string>localStorage.getItem("costValues")),
            }]
        }
    });
}

function getLocalStorageData(): number[] | null {
    return JSON.parse(<string>localStorage.getItem("costValues"))
}





