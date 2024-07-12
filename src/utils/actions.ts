const inputSearch: HTMLElement = document.querySelector(".input-search");
const printBtn: HTMLElement = document.getElementById("print-btn");
const placeholder: HTMLElement = document.getElementById("placeholder");
const newPlaceholder: HTMLElement = document.getElementById("new-placeholder");
const error: HTMLElement = document.querySelector(".error");
const printersSelect: HTMLElement = document.getElementById("printers-select");
let showDialog: boolean = false;

// mandando att pro backend
inputSearch.addEventListener("click", () => {
    if (!showDialog) {
        ipcRenderer.send("action/showDialog");
        showDialog = true;
    }
});

printBtn.addEventListener("click", () => {
    const chosenPrinter: HTMLSelectElement = document.querySelector("#printers-select");
    console.log(chosenPrinter.value);
    ipcRenderer.send("app/start", chosenPrinter.value);
    printBtn.style.backgroundColor = "#00E500";
    printBtn.style.transition = "1s";
});

// recebendo att do backend
ipcRenderer.on("action/closeDialog", (): void => {
    showDialog = false;
});

ipcRenderer.on("set/fileName", (event, data): void => {
    placeholder.style.display = "none";
    inputSearch.style.border = "2px solid #fff";
    newPlaceholder.style.display = "inline";
    newPlaceholder.innerHTML = data;
    error.style.display = "none";
    showDialog = false;
});

ipcRenderer.on("set/printers", (event, data: Array<string>): void => {
    data.forEach((printer: string): void => {
        printersSelect.innerHTML += `<option value="${printer}">${printer}</option>`;
    });
});
