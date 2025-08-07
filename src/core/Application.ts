import { app, Menu, ipcMain, dialog, shell } from "electron";
import { Window} from "../app/models/Window";
import { log } from "../app/services/logService"
import { getPrinters } from "../app/services/printerService";
import { findCodes, insertDETs } from "../app/services/excelService";
import { findCodePath, checkSuffix } from "../app/services/pathService";
import { pdfJoin, addWaterMarker } from "../app/services/pdfService";
import { exec } from "child_process";
import * as path from "path";
import fs = require("fs/promises");

export class Application {
    private data: Data;
    private configData: ConfigData;
    private window: Window;
    private running: boolean = false;
    private codeWithDET: string;
    private span: string = "\r\n            ";

    constructor() {
        this.data = {
            path: '',
            fileName: '',
            printers: [],
            codes: [],
            codePath: [],
            order: "",
            repeatMapper: [],
            temporaryFile: path.join(__dirname, '../resources/temp/result.pdf'),
            sufixMapper: [],
        };

        let options: Array<string> = [
            'app/minimize',
            'app/close',
            'action/showDialog',
            'action/setDET',
            'action/saveDETs',
            'action/getCodes',
            'app/start'
        ]
        options.forEach((option: string): void => {
            this.actionFromFrontend(option);
        })

        this.hideMenu();
    }

    public init(): void {
        this.readConfigFile()
            .then((): void => {
                this.createResultPath()
                    .then((): void => {
                        app.whenReady()
                            .then(async (): Promise<void> => {
                                this.window = new Window(this.configData.dev);
                                await this.window.loadIndex();

                                this.actionFromBackend("app/setTitle", this.configData.version);

                                getPrinters()
                                    .then(printers => {
                                        this.data.printers = printers;
                                        const NameOfPrinters = this.data.printers.map(printer => ' ' + printer.name)
                                        log(`Impressoras encontradas:${NameOfPrinters}`);

                                        let printerNames: Array<string> = [];
                                        this.data.printers.forEach((printer: Printable): void => {
                                            printerNames.push(printer.name);
                                        })

                                        this.actionFromBackend('set/printers', printerNames)
                                    })
                                    .catch(error => {
                                        log(error);
                                        this.actionFromBackend('message/error', error);
                                    });
                            })
                    })
            })
            .catch(erro => log(erro));
    }

    private async copyFileIfNotExists(source: string, destination: string) {
        try {
            const command1: string = 'mkdir "%APPDATA%\\ImprimePDF\\temp"';
            exec(command1);
            const command2: string = 'mkdir "%APPDATA%\\ImprimePDF\\logs"';
            exec(command2);
        } catch(error) {
            log(error);
        }
    }

    private async createResultPath() {
        const appDataPath = process.env.APPDATA;
        let dirPath = path.join(appDataPath, 'ImprimePDF');
        dirPath = path.join(dirPath, 'temp');
        const filePath = path.join(dirPath, 'result.pdf');

        if (this.configData.tmpFile) {
            this.data.temporaryFile = this.configData.tmpFile;
            return;
        }

        try {
            await this.copyFileIfNotExists(this.data.temporaryFile, filePath);
            this.data.temporaryFile = filePath;
        } catch (err) {
            log(`Erro ao criar o caminho do resultado: ${err.message}`);
        }
    }

    private async readConfigFile(): Promise<void> {
        try {
            const configPath = path.join(__dirname, '../config.json');
            const data = await fs.readFile(configPath, 'utf8');
            const configData = JSON.parse(data);
            this.configData = {
                dev: configData.dev,
                version: configData.version,
                projectPath: configData.projectPath,
                tmpFile: configData.tmpFile
            }

            let message = `Arquivo de configuração: {${this.span}    dev: ${configData.dev},${this.span}    version: ${configData.version},${this.span}    projectPath: ${configData.projectPath},${this.span}}`;
            log(message);
        } catch (error) {
            console.error('Erro ao ler o arquivo de configuração:', error);
        }
    }

    private actionFromFrontend(route: string) {
        switch (route) {
            case 'app/minimize': {
                ipcMain.on(route, () => {
                    this.window.mainWindow.minimize();
                });
                break;
            }
            case 'app/close': {
                ipcMain.on(route, () => {
                    app.quit();
                });
                break;
            }
            case 'action/showDialog': {
                ipcMain.on(route, () => {
                    this.getPath()
                        .then((arr: Array<string>): void => {
                            this.data.path = arr[0];
                            this.data.fileName = arr[1];
                            this.actionFromBackend('set/fileName', this.data.fileName)
                        }).catch(error => {
                        log(error);
                    });
                });
                break;
            }
            case 'action/setDET': {
                ipcMain.on(route, (_event, fileDET: string) => {
                    this.actionFromBackend('action/showDetPage', fileDET)
                });
                break;
            }
            case 'action/saveDETs': {
                ipcMain.on(route, (_event, userInput: Array<string | number>): void => {
                    log(`Número de DETs: ${userInput[0]}`);
                    insertDETs(this.data.codes, this.data.codePath, userInput[0] as number, this.codeWithDET)
                        .then(() => {
                            let message: string = `${this.span}[ \r\n`;
                            this.data.codes.forEach(code => {
                                message += `                [${code[0]}, ${code[1]}, ${code[2]}, ${code[3]}, ${code[4]}], \r\n`;
                            })
                            message += "            ]"
                            log(`Novos códigos: ${message}`);

                            message = ""
                            this.data.codePath.forEach(path => {
                                message += `${this.span}${path}`;
                            })
                            log(`Novos diretórios: ${message}`);

                            this.restart(userInput[1] as string);
                        }).catch(error => log(error));
                });
                break;
            }
            case 'action/getCodes': {
                ipcMain.on(route, (_event, data: string) => {
                    this.data.codes = [];
                    this.running = false;
                    this.data.order = data;

                    let message = `Imputs: ${this.span}Arquivo com os códigos: ${this.data.path}${this.span}Número do pedido: ${this.data.order}`;
                    log(message);

                    findCodes(this.data.path)
                        .then((codes: Array<Array<string>>): void => {
                            this.data.codes = codes;

                            let message: string = `${this.span}[ \r\n`;
                            this.data.codes.forEach(code => {
                                message += `                [${code[0]}, ${code[1]}, ${code[2]}, ${code[3]}, ${code[4]}], \r\n`;
                            })
                            message += "            ]"
                            log(`Códigos encontrados: ${message}`);

                            this.actionFromBackend(
                                'message/success',
                                `Códigos encontrados: ${this.data.codes.length}`
                            );
                        }).catch((error: string): void => {
                        log(error);
                        this.actionFromBackend('message/error', error)
                    });
                });
                break;
            }
            case 'app/start': {
                ipcMain.on(route, (_event, printer: string): void => {
                    this.startApplication(printer)
                        .then(() => {
                            this.running = false;
                        }).catch(error => {
                        log(error);
                    });
                });
                break;
            }
        }
    }

    private actionFromBackend(route: string, message?: string | Array<string>): void {
        if (message) {
            this.window.mainWindow.webContents.send(route, message);
            return
        }

        this.window.mainWindow.webContents.send(route);
    }

    private hideMenu() {
        const menuTemplate: any = [];
        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);
    }

    private async getPath(): Promise<Array<string>> {
        return new Promise(async (resolve, reject) => {
            let dialogPath = await dialog.showOpenDialog({
                defaultPath: app.getPath("desktop"),
                title: 'Selecione o arquivo:',
                buttonLabel: 'Selecionar',
                filters: [
                    {
                        name: 'Excel',
                        extensions: ['xlsx', 'xls']
                    }
                ],
            });

            if (dialogPath.canceled) {
                this.actionFromBackend('action/closeDialog')
                reject('Operação cancelada');
            }

            const folderPath = String(dialogPath.filePaths).replace("\\\\", "\\");
            const arrayFolder = folderPath.split("\\");
            const fileName = arrayFolder[arrayFolder.length - 1];
            let filePath: string;
            filePath = folderPath;

            if (arrayFolder[1] === "metaro-server") {
                filePath = "\\" + folderPath;
            }

            this.actionFromBackend('action/closeDialog')
            resolve([filePath, fileName]);
        })
    }

    private checkDET(error: Array<string>): void {
        let filePath = error[1];
        let arrayFilePath = filePath.split('\\');
        this.codeWithDET = arrayFilePath[arrayFilePath.length - 1];

        this.actionFromBackend('message/error', error[0]);
        if (!this.codeWithDET.includes('DET')) {
            setTimeout(() => {
                this.actionFromBackend('message/options', this.codeWithDET);
            }, 500)
        }
    }

    private restart(printer: string) {
        this.actionFromBackend('action/restart');
        setTimeout(() => {
            this.joinAll(printer)
        }, 500)
    }

    private async saveToPdf(): Promise<void> {
        setTimeout((): void => {
            this.actionFromBackend('message/success', 'Processando arquivos')
        }, 500)

        await dialog.showSaveDialog({
            title: 'Salvar arquivo',
            defaultPath: app.getPath("desktop"),
            filters: [
                {name: 'Text Files', extensions: ['pdf']}
            ]
        }).then(async result => {
            if (!result.canceled) {
                let currentFilePath: string = result.filePath;
                log(`Caminho para salvar arquivo: ${currentFilePath}`);

                try {
                    await fs.copyFile(this.data.temporaryFile, currentFilePath);
                    await shell.openPath(currentFilePath);
                    log('Arquivo copiado com sucesso!');
                    setTimeout((): void => {
                        this.actionFromBackend('message/success', 'Arquivo salvo com sucesso!')

                    }, 500)
                    return
                } catch (error) {
                    log(`Erro ao copiar o arquivo: ${error}`);
                    setTimeout((): void => {
                        this.actionFromBackend('message/simpleError', 'Erro ao copiar o arquivo!')
                    }, 500)
                    return;
                }
            } else {
                log('Diálogo de salvar cancelado');
            }
        })
    }

    private async joinAll(printer: string): Promise<void> {
        return new Promise((resolve, reject) => {
            pdfJoin(this.data.codePath, this.data.temporaryFile)
                .then(repeatMapper => {
                    this.data.repeatMapper = repeatMapper;

                    addWaterMarker(this.data.order, this.data.codes, this.data.temporaryFile, this.data.repeatMapper)
                        .then(() => {
                            let index: number = this.data.printers.findIndex((data): boolean => {
                                return data.name == printer
                            })

                            if (this.data.printers[index].name == "Salvar como PDF") {
                                log('Impressora selecionada: "Salvar como PDF"');
                                this.saveToPdf();
                                resolve();
                                return;
                            }

                            this.data.printers[index].print(this.data.temporaryFile)
                                .then((result) => {
                                    log(result);
                                    setTimeout(() => {
                                        this.actionFromBackend('message/success', result);
                                    }, 500)
                                    resolve();
                                })
                                .catch(error => {
                                    log(error);
                                    reject(error);
                                });
                        })
                })
                .catch(error => {
                    log(error[0]);
                    this.checkDET(error);
                })
        });
    }

    private startApplication(printer: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.running) {
                reject('Aplicação ainda não foi finalizada!');
                return
            }
            this.running = true;

            checkSuffix(this.data.codes, this.configData.projectPath, this.data.temporaryFile)
                .then((sufix: Array<Array<string>>) => {
                    this.data.sufixMapper = sufix

                    let msg = ""
                    sufix.forEach(currentSufix => {
                        msg += `${this.span}${currentSufix}`;
                    })
                    log(`Mapeamento de sufixos: ${msg}`);

                    findCodePath(this.data.codes, this.configData.projectPath, this.data.sufixMapper, this.data.temporaryFile)
                        .then((codePath: Array<string>): void => {
                            this.data.codePath = codePath;

                            let message = ""
                            this.data.codePath.forEach(path => {
                                message += `${this.span}${path}`;
                            })
                            log(`Diretórios encontrados: ${message}`);

                            this.joinAll(printer);
                        })
                        .catch((error: string): void => {
                            log('Não é possível buscar diretórios sem os códigos')
                            this.actionFromBackend('message/simpleError', error)
                            reject(error);
                        })
                })
        })
    }
}
