let contadorAlert: number  = 0;

ipcRenderer.on("message/notice", (event, data) => {
    contadorAlert += 1;
    let contador = contadorAlert;
    let div = document.createElement("div");
    div.setAttribute("id", `alert${contador}`);
    div.classList.add("alert");
    div.classList.add("notice");
    div.innerHTML = `<span>${data}</span>`;

    alertContainer.appendChild(div);

    setTimeout(() => {
        document.getElementById(`alert${contador}`).remove();
    }, 5000);
});

ipcRenderer.on("message/success", (event, data) => {
    contadorAlert += 1;
    let contador = contadorAlert;
    let div = document.createElement("div");
    div.setAttribute("id", `alert${contador}`);
    div.classList.add("alert");
    div.classList.add("success");
    div.innerHTML = `<span>${data}</span>`;

    alertContainer.appendChild(div);

    setTimeout(() => {
        document.getElementById(`alert${contador}`).remove();
    }, 5000);
});

ipcRenderer.on("message/error", (event, data) => {
    contadorAlert += 1;
    let contador = contadorAlert;
    let div = document.createElement("div");
    div.setAttribute("id", `alert${contador}`);
    div.classList.add("alert");
    div.classList.add("erro");
    div.innerHTML = `<span>${data}</span>`;

    alertContainer.appendChild(div);
});

ipcRenderer.on("message/simpleError", (event, data) => {
    contadorAlert += 1;
    let contador = contadorAlert;
    let div = document.createElement("div");
    div.setAttribute("id", `alert${contador}`);
    div.classList.add("alert");
    div.classList.add("simple-erro");
    div.innerHTML = `<span>${data}</span>`;

    alertContainer.appendChild(div);

    setTimeout(() => {
        document.getElementById(`alert${contador}`).remove();
    }, 5000);
});
