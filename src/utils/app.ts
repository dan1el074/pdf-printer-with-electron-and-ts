const nextBtn: HTMLElement = document.getElementById('next-btn');
const actionPage: HTMLElement = document.querySelector('.action-page');
const previousBtn: HTMLElement = document.getElementById('previous-btn');
const detPreviousBtn: HTMLElement = document.getElementById('det-previous-btn');

nextBtn.addEventListener('click', () => {
    const fileSpan: HTMLElement = document.getElementById('new-placeholder');
    const regex:RegExp = /\.[^.]+$/;
    let validate = true;

    if (!fileSpan.innerHTML) {
        inputSearch.style.border = '2px solid red';
        error.style.display = 'block';
        error.innerHTML = 'Selecione um arquivo!';
        validate = false;
    }

    if (!inputOrder.value) {
        inputOrder.style.border = '2px solid red';
        error2.innerHTML = 'Digite o número do pedido!';
        validate = false;
    }

    if (inputOrder.value) {
        inputOrder.style.border = '2px solid #fff';
        error2.innerHTML = '';
    }

    if(validate) {
        actionPage.style.transform = 'translateX(-100%)';
        ipcRenderer.send('action/getCodes', inputOrder.value);
    }
});

previousBtn.addEventListener('click', () => {
    actionPage.style.transform = 'translateX(100%)';
    alertContainer.innerHTML = '';
});

printBtn.addEventListener('blur', () => {
    printBtn.style.backgroundColor = '#1689fc';
    printBtn.style.transition = '1s';
});

detPreviousBtn.addEventListener('click', () => {
    detPage.style.transform = 'translateX(100%)';
    const detValue: HTMLSelectElement = document.querySelector('#input-det')
    detValue.value = '';
})
