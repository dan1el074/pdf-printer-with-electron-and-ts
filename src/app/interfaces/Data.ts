interface Data {
    path: string;
    fileName: string;
    printers: Array<Printable>;
    codes: Array<Array<string>>;
    order: number;
    temporaryFile: string;
}