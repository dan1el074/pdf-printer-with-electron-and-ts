import * as fs from 'fs';

let firstLog = true;

export function log(message: string): void {
    const route: string = '../../resources/logs/';
    const date = new Date();
    const day = `${date.getDate()<=9?'0'+date.getDate():date.getDate()}-${date.getMonth()+1<=9?'0'+(date.getMonth()+1):date.getMonth()+1}-${date.getFullYear()}`
    const timestamp = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds() <= 9 ? `0${date.getSeconds()}` : date.getSeconds()}`;
    const path = require("path");
    const filePath = path.join(__dirname, `${route}${day}.txt`);
    const content = `[${timestamp}] ${message} \r\n`;

    if(firstLog) {
        const firstContent: string =
            `------------------------------  Acesso as ${timestamp}  --------------------------------\r\n`;

        if(fs.existsSync(filePath)) {
            fs.appendFile(filePath, '\r\n \r\n' + firstContent, (err) => {
                if (err) {
                    console.error('Erro ao adicionar logs ao arquivo:', err);
                }
            });
        }
        if(!fs.existsSync(filePath)) {
            fs.writeFile(filePath, firstContent, (err) => {
                if (err) {
                    console.error('Erro ao criar logs:', err);
                }
            });
        }
        firstLog = false
    }

    fs.appendFile(filePath, content, (err) => {
        if (err) {
            console.error('Erro ao adicionar logs ao arquivo:', err);
        }
    });
}
