import { app, Menu, ipcMain, dialog } from "electron";
import { Window } from "../app/models/Window";
import { log } from "../app/services/logService"
import { getPrinters } from "../app/services/printerService";
import { findCodes } from "../app/services/excelService";
import { findCodePath } from "../app/services/pathService";
import { pdfJoin } from "../app/services/pdfService";
import * as path from "path";

export class Application {
    private readonly prod: boolean;
    private data: Data;
    private window: Window;
    private running: boolean = false;

    constructor(prod: boolean) {
        this.prod = prod
        this.data = {
            path: '',
            fileName: '',
            printers: [],
            codes: [],
            temporaryFile: 'src/resources/temp/result.pdf'
        };

        if(this.prod) {
            this.data.temporaryFile = path.join(__dirname, '../resources/temp/result.pdf');
        }

        let options: Array<string> = ['app/minimize','app/close','action/showDialog','action/getCodes','app/start']
        options.forEach((option: string): void => {
            this.actionFromBackend(option);
        })

        this.hideMenu();
    }

    public init(): void {
        app.whenReady()
            .then(async (): Promise<void> => {
                this.window = new Window();
                await this.window.loadIndex();

                getPrinters()
                    .then(printers => {
                        this.data.printers = printers;
                        const NameOfPrinters = this.data.printers.map(printer => ' ' + printer.name)
                        log(`Impressoras encontradas:${NameOfPrinters}`);

                        let printerNames: Array<string> = [];
                        this.data.printers.forEach((printer: Printable) => {
                            printerNames.push(printer.name);
                        })

                        this.actionToBackend('set/printers', printerNames)
                    }).catch(error => {
                        log(error);
                        this.actionToBackend('message/error', error);
                });
            })
    }

    public actionFromBackend(route: string) {
        switch(route) {
            case 'app/minimize': {
                ipcMain.on("app/minimize", () => {
                    this.window.mainWindow.minimize();
                });
                break
            }
            case 'app/close': {
                ipcMain.on("app/close", () => {
                    app.quit();
                });
                break
            }
            case 'action/showDialog': {
                ipcMain.on("action/showDialog", () => {
                    this.getPath()
                        .then((arr: Array<string>): void => {
                            this.data.path = arr[0];
                            this.data.fileName = arr[1];
                            this.actionToBackend('set/fileName', this.data.fileName)
                        }).catch(error => {
                        log(error);
                    });
                });
                break
            }
            case 'action/getCodes': {
                ipcMain.on("action/getCodes", () => {
                    this.data.codes = [];
                    this.running = false;

                    findCodes(this.data.path)
                        .then((codes: Array<string>): void => {
                            this.data.codes = codes;
                            log(`Códigos encontrados: ${this.data.codes}`);
                            this.actionToBackend('message/success', `Códigos encontrados: ${this.data.codes.length}`);
                        }).catch((error: string): void => {
                            log(error);
                            this.actionToBackend('message/error', error)
                    });
                });
                break
            }
            case 'app/start': {
                ipcMain.on("app/start", (_event, printer: string): void => {
                    this.startApplication(printer).then().catch(() => {
                        log('Aplicação ainda não foi finalizada');
                    });
                });
                break
            }
        }
    }

    public actionToBackend(route: string, message?: string | Array<string>): void {
        if(message) {
            this.window.mainWindow.webContents.send(route, message);
            return
        }

        this.window.mainWindow.webContents.send(route);
    }

    public hideMenu() {
        const menuTemplate: any = [];
        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);
    }

    public async getPath(): Promise<Array<string>> {
        return new Promise(async (resolve, reject) => {
            let dialogPath = await dialog.showOpenDialog({
                defaultPath: app.getPath("desktop"),
                title: 'Selecione o arquivo:',
                buttonLabel: 'Selecionar',
                filters: [
                    { name: 'Excel', extensions: ['xlsx', 'xls'] }
                ],
            });

            if (dialogPath.canceled) {
                this.actionToBackend('action/closeDialog')
                reject('Operação cancelada');
            }

            const folderPath = String(dialogPath.filePaths).replace("\\\\", "\\");
            const arrayFolder = folderPath.split("\\");
            const fileName = arrayFolder[arrayFolder.length - 1];
            let filePath: string;

            if (arrayFolder[1] === "metaro-server") {
                filePath = "\\" + folderPath;
            } else {
                filePath = folderPath;
            }

            this.actionToBackend('action/closeDialog')
            resolve([filePath, fileName]);
        })
    }

    private startApplication(printer: string): Promise<void> {
        return new Promise((_resolve, reject) => {
            if(this.running) {
                reject('Aplicação ainda não foi finalizada!');
                return
            }
            this.running = true;

            findCodePath(this.data.path, this.data.codes)
                .then((codePath: Array<string>): void => {
                    this.actionToBackend('message/notice','Processando arquivos')
                    log(`Diretórios encontrados: ${codePath}`);
                    pdfJoin(codePath, this.data.temporaryFile)
                        .then(() => {
                            let index: number = this.data.printers.findIndex((data) => data.name == printer)
                            this.data.printers[index].print(this.data.temporaryFile)
                                .then(() => {
                                    log('Arquivo impresso via: Adobe');
                                    this.actionToBackend('message/success', 'Arquivo impresso via Adobe')
                                    this.running = false;
                                }).catch(error => {
                                    log(error);
                                });
                        }).catch(error => {
                        log(error);
                        this.actionToBackend('message/error', error)
                    })

                }).catch((error: string): void => {
                log('Não é possível buscar diretórios sem os códigos')
                this.actionToBackend('message/simpleError', error)
            })
        })
    }
}
