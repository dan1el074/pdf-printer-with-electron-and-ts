import { exec } from "child_process";

export class Printer implements Printable {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    public print(temporaryFilePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const command: string = `"C:\\Program Files\\Adobe\\Acrobat DC\\Acrobat\\Acrobat.exe" /n /s /h /t "${temporaryFilePath}" "${this.name}"`;
            exec(command, (error: Error, stdout: string, _stderr: string) => {
                if(error) {
                    reject(error);
                    exec('taskkill /IM acrobat.exe /T /F')
                    return
                }
            });

            if(!this.name.includes('Microsoft Print')) {
                setTimeout(() => {
                    exec('taskkill /IM acrobat.exe /T /F')
                    resolve();
                }, 5000)
                resolve();
                return;
            }
        })
    }
}
