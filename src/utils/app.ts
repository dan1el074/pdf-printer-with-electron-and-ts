const nextBtn: HTMLElement = document.getElementById('next-btn');
const actionPage: HTMLElement = document.querySelector('.action-page');
const previousBtn: HTMLElement = document.getElementById('previous-btn');
const detPreviousBtn: HTMLElement = document.getElementById('det-previous-btn');

inputOrder.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        if (isBusy) return;
        nextBtn.click();
    }
});

document.addEventListener('keypress', (event) => {
    if (isBusy || event.target instanceof HTMLButtonElement || event.target instanceof HTMLSelectElement) return;
    if(actionPage.style.transform === 'translateX(-100%)' && detPage.style.transform !== 'translateX(-100%)') {
        if (event.key === 'Enter') {
            event.preventDefault();
            printBtn.click();
        }
    }
});

nextBtn.addEventListener('click', () => {
    if (isBusy) return;
    const fileSpan: HTMLElement = document.getElementById('new-placeholder');
    let validatedOrder = false;
    let validatedFile = false;

    if (!fileSpan.innerHTML) {
        inputSearch.style.border = '2px solid red';
        error.style.display = 'block';
        error.innerHTML = 'Selecione um arquivo!';
        return
    }

    if (fileSpan.innerHTML) {
        inputSearch.style.border = '2px solid #fff';
        error.style.display = 'none';
        validatedFile = true;
    }

    if (!inputOrder.value) {
        inputOrder.style.border = '2px solid red';
        error2.innerHTML = 'Digite o número do pedido!';
        return
    }

    if (inputOrder.value) {
        validatedOrder = true;
    }

    if (validatedOrder && validatedFile) {
        inputOrder.style.border = '2px solid #fff';
        error2.innerHTML = '';
        actionPage.style.transform = 'translateX(-100%)';
        sendToBackend('action/getCodes', inputOrder.value.toUpperCase());
        setTimeout(() => {
            printersSelect.focus();
        }, 300)
    }
});

printersSelect.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        if (isBusy) return;
        printBtn.click();
        return
    }
});

previousBtn.addEventListener('click', () => {
    if (isBusy) return;
    actionPage.style.transform = 'translateX(100%)';
    alertContainer.innerHTML = '';
});

detPreviousBtn.addEventListener('click', () => {
    if (isBusy) return;
    detPage.style.transform = 'translateX(100%)';
    actionPage.style.transform = 'translateX(100%)';
    alertContainer.innerHTML = '';

    setTimeout(() => {
        detInput.value = '';
    }, 300)
})

detPage.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        if (isBusy) return;
        saveDetAndPrint.click();
        return
    }
});
