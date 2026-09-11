const inputSearch: HTMLElement = document.querySelector('.input-search');
const windowTitle: HTMLElement = document.getElementById("windowTitle");
const appTitle: HTMLElement = document.getElementById("appTitle");
const inputOrder: HTMLInputElement = <HTMLInputElement>document.getElementById('input-order');
const printBtn: HTMLElement = document.getElementById('print-btn');
const placeholder: HTMLElement = document.getElementById('placeholder');
const newPlaceholder: HTMLElement = document.getElementById('new-placeholder');
const error: HTMLElement = document.querySelector('.error');
const error2: HTMLElement = document.querySelector('.error2');
const printersSelect: HTMLElement = document.getElementById('printers-select');
const detPage: HTMLElement = document.querySelector('.det-page');
const detInput: HTMLInputElement = <HTMLInputElement>document.querySelector('#input-det')
const alertContainer: HTMLElement = document.querySelector('.alert-container');
const saveDetAndPrint: HTMLElement = document.getElementById('det-btn');
let showDialog: boolean = false;
let isBusy: boolean = false;

function setBusy(busy: boolean): void {
    isBusy = busy;
    document.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>(
        'section button, section input, section select, .alert-container button'
    ).forEach(control => control.disabled = busy);
    inputSearch.style.pointerEvents = busy ? 'none' : '';
    document.body.setAttribute('aria-busy', String(busy));
    printBtn.textContent = busy ? 'Processando...' : 'Imprimir';
}

ipcRenderer.on('app/setBusy', (_event: any, busy: boolean): void => {
    setBusy(busy);
});

function sendToBackend(route: string, data?: any) {
    if (isBusy) return;
    if (['app/start', 'action/saveDETs', 'action/getCodes', 'action/showDialog'].includes(route)) {
        setBusy(true);
    }
    if(data) {
        ipcRenderer.send(route, data);
        return
    }
    ipcRenderer.send(route);
}

// mandando att pro backend
inputSearch.addEventListener('click', () => {
    if (!showDialog && !isBusy) {
        sendToBackend('action/showDialog');
        showDialog = true;
    }
});

printBtn.addEventListener('click', () => {
    if (isBusy) return;
    const chosenPrinter: HTMLSelectElement = document.querySelector('#printers-select');
    if (!chosenPrinter.value) return;
    alertContainer.innerHTML = '';
    sendToBackend('app/start', chosenPrinter.value);
});

saveDetAndPrint.addEventListener('click', () => {
    if (isBusy) return;
    const detValue: HTMLSelectElement = document.querySelector('#input-det')
    const printer: HTMLSelectElement = document.querySelector('#printers-select');
    sendToBackend('action/saveDETs', [detValue.value, printer.value]);
})

// recebendo att do backend
ipcRenderer.on('app/setTitle', (_event: any, version: string): void => {
    appTitle.innerHTML += " " + version;
    windowTitle.innerHTML += " " + version;
});

ipcRenderer.on('action/closeDialog', (): void => {
    showDialog = false;
});

ipcRenderer.on('set/fileName', (_event: any, data: string): void => {
    placeholder.style.display = 'none';
    inputSearch.style.border = '2px solid #fff';
    newPlaceholder.style.display = 'inline';
    newPlaceholder.innerHTML = data;
    error.style.display = 'none';
    inputOrder.focus();
    showDialog = false;
});

ipcRenderer.on('set/printers', (_event: any, data: Array<string>): void => {
    printersSelect.innerHTML = '';
    data.forEach((printer: string): void => {
        const option: HTMLOptionElement = document.createElement('option');
        option.value = printer;
        option.textContent = printer;
        printersSelect.appendChild(option);
    });
});

ipcRenderer.on('action/showDetPage', (_event: any, fileDET: string): void => {
    const detValue = document.getElementById('detValue');
    detValue.innerText = fileDET.split('.')[0];
    detPage.style.transform = 'translateX(-100%)';
    detInput.focus();
});

ipcRenderer.on('action/restart', (_event: any, fileDET: string): void => {
    alertContainer.innerHTML = '';
    detPage.style.transform = 'translateX(100%)';
});
