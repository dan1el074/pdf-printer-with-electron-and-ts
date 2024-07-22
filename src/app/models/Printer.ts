import { exec } from "child_process";

export class Printer implements Printable {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    public print(temporaryFilePath: string): Promise<void> {
        return new Promise((resolve, reject): void => {
            const command: string = `"C:\\Program Files\\Adobe\\Acrobat DC\\Acrobat\\Acrobat.exe" /n /s /h /t "${temporaryFilePath}" "${this.name}"`;
            exec(command, (error: Error, _stdout: string, _stderr: string): void => {
                if(error) {
                    reject(error);
                }
            });
            resolve()
        })
    }
}
