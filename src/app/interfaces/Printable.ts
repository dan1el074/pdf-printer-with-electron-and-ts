interface Printable {
    name: string;
    print(temporaryFilePath: string): Promise<void>;
}