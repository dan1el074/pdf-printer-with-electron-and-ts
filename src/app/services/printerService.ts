import { WebContents } from "electron";
import { Printer } from "../models/Printer";

export async function getPrinters(webContents: WebContents): Promise<Printable[]> {
    const printers = await webContents.getPrintersAsync();
    const listPrinters: Printable[] = [new Printer("Salvar como PDF")];

    printers.forEach((printer): void => {
        // Use o nome reconhecido pelo Windows também no envio da impressão.
        listPrinters.push(new Printer(printer.name));
    });

    return listPrinters;
}
