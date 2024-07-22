const nextBtn: HTMLElement = document.getElementById('next-btn');
const actionPage: HTMLElement = document.querySelector('.action-page');
const previousBtn: HTMLElement = document.getElementById('previous-btn');
const detPreviousBtn: HTMLElement = document.getElementById('det-previous-btn');

nextBtn.addEventListener('click', () => {
    const fileSpan: HTMLElement = document.getElementById('new-placeholder');
    const regex:RegExp = /\.[^.]+$/;

    if (fileSpan.innerHTML) {
        if (String(fileSpan.innerHTML.match(regex)) == '.xlsx') {
            actionPage.style.transform = 'translateX(-100%)';
            ipcRenderer.send('action/getCodes');
        } else {
            inputSearch.style.border = '2px solid red';
            inputSearch.style.animation =
                'shake 0.5s cubic-bezier(0.455, 0.030, 0.515, 0.955) both';
            error.style.display = 'block';
            error.innerHTML = 'Arquivo invalido!';
        }
    } else {
        inputSearch.style.border = '2px solid red';
        inputSearch.style.animation =
            'shake 0.5s cubic-bezier(0.455, 0.030, 0.515, 0.955) both';
        error.style.display = 'block';
        error.innerHTML = 'Selecione um arquivo!';
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
