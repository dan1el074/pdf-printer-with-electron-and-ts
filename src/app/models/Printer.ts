import {exec} from "child_process";
import {log} from "../services/logService";
import printer = require('pdf-to-printer');

export class Printer implements Printable {
    readonly name: string;
    private adobePath: string;

    constructor(name: string, adobePath: string) {
        this.name = name;
        this.adobePath = adobePath;
    }

    public print(temporaryFilePath: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            log(`Impressora selecionada: ${this.name}`);

            if (this.name == "Salvar como PDF") {
                reject('Salvo como PDF')
                return;
            }

            await this.printWithPdfToPrinter(temporaryFilePath)
                .then(text => resolve(text))
                .catch(text => reject(text))
        })
    }

    public printWithAdobe(temporaryFilePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const command: string = `"${this.adobePath}" /n /s /h /t "${temporaryFilePath}" "${this.name}"`;
            exec(command, (error: Error, _stdout: string, _stderr: string): void => {
                if (error) {
                    reject(error);
                }
            });
            resolve("Arquivo impresso via: Adobe");
        })
    }

    public printWithPdfToPrinter(temporaryFilePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const options = { printer: this.name };

            printer.print(temporaryFilePath, options)
                .then(() => {
                    resolve('Impressão iniciada com sucesso!');
                })
                .catch(err => {
                    reject(`Erro ao imprimir o arquivo: ${err}`);
                });
        })
    }
}
