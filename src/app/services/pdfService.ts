import {degrees, PDFDocument, StandardFonts, rgb} from "pdf-lib";
import fs = require("fs/promises");
import {log} from "./logService";

export async function pdfJoin(arrayCodePath: Array<string>, temporaryFile: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const newPDF = await PDFDocument.create();

            for (const filePath of arrayCodePath) {
                const PDFFile = await fs.readFile(filePath);
                const pdf = await PDFDocument.load(PDFFile);
                const pages = await newPDF.copyPages(pdf, pdf.getPageIndices());
                pages.forEach((page) => newPDF.addPage(page));
            }

            const newPDFBytes = await newPDF.save();
            await fs.writeFile(temporaryFile, newPDFBytes);
            await organizePDF(temporaryFile);
            resolve();
        } catch (error) {
            reject([`Erro! Arquivo não encontrado: ${error.path}`, error.path])
        }
    })
}

async function organizePDF(inputPath: string) {
    try {
        const inputBytes = await fs.readFile(inputPath);
        const pdfDoc = await PDFDocument.load(inputBytes);
        const numPages = pdfDoc.getPageCount();

        for (let i = 0; i < numPages; i++) {
            const page = pdfDoc.getPage(i);
            const isRetrato = page.getSize().width > page.getSize().height;

            if (isRetrato) {
                page.setRotation(degrees(90));
            }

            if (page.getWidth() > 1190 && page.getWidth() < 1193) {
                page.scale(0.706,0.706);
            }
        }

        const modifiedBytes = await pdfDoc.save();
        await fs.writeFile(inputPath, modifiedBytes);
    } catch (error) {
        log(`Erro ao organizar o PDF: ${error}`);
    }
}

export async function addWaterMarker(order: string, codes: Array<Array<String>>, inputPath: string) {
    const existingPdfBytes = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const HelveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for(let i: number = 0; i < codes.length; i++) {
        if(codes[i][2] == "undefined" || codes[i][3] == "undefined" || codes[i][4] == "undefined") {
            continue;
        }

        const watermarkText: string = `Pedido: ${order} \r\nQuantidade: ${codes[i][3]}${codes[i][2]} \r\nRoteiro: ${codes[i][4]}`;
        let fontSize = 12;
        let lineHeight = 6.8;
        let positionX = 27;

        if(pages[i].getSize().width > 600) {
            fontSize = 11;
            lineHeight = 6.8;
            positionX = 15;
        }

        pages[i].drawText(watermarkText, {
            font: HelveticaFont,
            x: positionX,
            y: 30,
            size: fontSize,
            color: rgb(0, 0, 0),
            lineHeight: lineHeight,
            rotate: degrees(90)
        });
    };

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(inputPath, pdfBytes);
}

//TODO: ARRUMAR QUANTIDADES NOS ARQUIVOS COM MAIS DE UM PDF!!
//TODO: criar um mapa com 2 parâmetros, o primeiro sendo o indice que repetirá, e o segundo com quantas vezes repetirá
