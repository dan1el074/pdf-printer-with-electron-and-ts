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
            .then((): Promise<void> => {
                return this.createResultPath()
                    .then((): Promise<void> => {
                        return app.whenReady()
                            .then(async (): Promise<void> => {
                                this.window = new Window(this.configData.dev);
                                await this.window.loadIndex();

                                this.actionFromBackend("app/setTitle", this.configData.version);

                                return getPrinters(this.window.mainWindow.webContents)
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
                                        this.actionFromBackend('message/error', 'Não foi possível consultar as impressoras disponíveis.');
                                    });
                            })
                    })
            })
            .catch(erro => {
                console.error('Erro ao iniciar a aplicação:', erro);
                app.quit();
            });
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
            throw error;
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
                    void this.runOperation(async () => {
                        try {
                            const result = await this.getPath();
                            if (result) {
                                this.data.path = result[0];
                                this.data.fileName = result[1];
                                this.data.codes = [];
                                this.actionFromBackend('set/fileName', this.data.fileName);
                            }
                        } finally {
                            this.actionFromBackend('action/closeDialog');
                        }
                    });
                });
                break;
            }
            case 'action/setDET': {
                ipcMain.on(route, (_event, fileDET: string) => {
                    if (this.running || fileDET !== this.codeWithDET) return;
                    this.actionFromBackend('action/showDetPage', fileDET);
                });
                break;
            }
            case 'action/saveDETs': {
                ipcMain.on(route, (_event, userInput: Array<string | number>): void => {
                    void this.runOperation(async () => {
                        const count = Number(userInput[0]);
                        if (!this.codeWithDET || !Number.isInteger(count) || count <= 0) {
                            throw new Error('Informe um número de detalhamentos válido.');
                        }
                        log('Número de DETs: ' + count);
                        await insertDETs(this.data.codes, this.data.codePath, count, this.codeWithDET);
                        this.codeWithDET = undefined;
                        this.actionFromBackend('action/restart');
                        await this.joinAll(userInput[1] as string);
                    });
                });
                break;
            }
            case 'action/getCodes': {
                ipcMain.on(route, (_event, data: string) => {
                    void this.runOperation(async () => {
                        this.data.codes = [];
                        this.codeWithDET = undefined;
                        this.data.order = data;
                        this.data.codes = await findCodes(this.data.path);
                        log('Códigos encontrados: ' + JSON.stringify(this.data.codes));
                        this.actionFromBackend('message/success', 'Códigos encontrados: ' + this.data.codes.length);
                    });
                });
                break;
            }
            case 'app/start': {
                ipcMain.on(route, (_event, printer: string): void => {
                    void this.startApplication(printer);
                });
                break;
            }
        }
    }

    private actionFromBackend(route: string, message?: string | Array<string> | boolean): void {
        if (message !== undefined) {
            this.window.mainWindow.webContents.send(route, message);
            return;
        }
        this.window.mainWindow.webContents.send(route);
    }

    private async runOperation(operation: () => Promise<void>): Promise<void> {
        // Uma única operação pode alterar os dados ou o PDF temporário por vez.
        if (this.running) return;
        this.running = true;
        this.actionFromBackend('app/setBusy', true);
        try {
            await operation();
        } catch (error) {
            log(String(error));
            if (Array.isArray(error) && typeof error[1] === 'string') {
                this.checkDET(error);
            } else {
                const message = error instanceof Error ? error.message : String(Array.isArray(error) ? error[0] : error);
                this.actionFromBackend('message/simpleError', message);
            }
        } finally {
            this.running = false;
            this.actionFromBackend('app/setBusy', false);
        }
    }

    private hideMenu() {
        const menuTemplate: any = [];
        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);
    }

    private async getPath(): Promise<Array<string> | undefined> {
        const result = await dialog.showOpenDialog({
            defaultPath: app.getPath("desktop"),
            title: 'Selecione o arquivo:',
            buttonLabel: 'Selecionar',
            filters: [{ name: 'Excel', extensions: ['xlsx', 'xls'] }]
        });
        if (result.canceled || !result.filePaths.length) return;
        const filePath = result.filePaths[0];
        return [filePath, path.basename(filePath)];
    }

    private checkDET(error: Array<string>): void {
        this.codeWithDET = path.basename(error[1]);
        this.actionFromBackend('message/error', error[0]);
        if (!this.codeWithDET.includes('DET')) {
            this.actionFromBackend('message/options', this.codeWithDET);
        }
    }

    private async saveToPdf(): Promise<void> {
        const result = await dialog.showSaveDialog({
            title: 'Salvar arquivo',
            defaultPath: app.getPath("desktop"),
            filters: [{ name: 'PDF', extensions: ['pdf'] }]
        });
        if (result.canceled || !result.filePath) {
            log('Diálogo de salvar cancelado');
            return;
        }
        await fs.copyFile(this.data.temporaryFile, result.filePath);
        this.actionFromBackend('message/success', 'Arquivo salvo com sucesso!');
        const openError = await shell.openPath(result.filePath);
        if (openError) {
            this.actionFromBackend('message/simpleError', 'Arquivo salvo, mas não foi possível abri-lo: ' + openError);
        }
    }

    private async joinAll(printer: string): Promise<void> {
        const selectedPrinter = this.data.printers.find(item => item.name === printer);
        if (!selectedPrinter) throw new Error('Selecione uma impressora válida.');

        this.data.repeatMapper = await pdfJoin(this.data.codePath, this.data.temporaryFile);
        await addWaterMarker(this.data.order, this.data.codes, this.data.temporaryFile, this.data.repeatMapper);
        if (selectedPrinter.name === "Salvar como PDF") {
            await this.saveToPdf();
            return;
        }
        const result = await selectedPrinter.print(this.data.temporaryFile);
        log(result);
        this.actionFromBackend('message/success', result);
    }

    private async startApplication(printer: string): Promise<void> {
        await this.runOperation(async () => {
            if (!this.data.printers.some(item => item.name === printer)) {
                throw new Error('Selecione uma impressora válida.');
            }
            this.codeWithDET = undefined;
            // Releia os códigos para não acumular alterações de sufixos da impressão anterior.
            this.data.codes = await findCodes(this.data.path);
            this.data.sufixMapper = await checkSuffix(this.data.codes, this.configData.projectPath, this.data.temporaryFile);
            log('Mapeamento de sufixos: ' + JSON.stringify(this.data.sufixMapper));
            this.data.codePath = await findCodePath(this.data.codes, this.configData.projectPath, this.data.sufixMapper, this.data.temporaryFile);
            log('Diretórios encontrados: ' + JSON.stringify(this.data.codePath));
            await this.joinAll(printer);
        });
    }
}
