import { PDFInterface, cfdiJsonInterface } from "../interfaces/facturaInterfaces";
import { PDFDocument } from "pdf-lib";
interface JsonObject {
    [key: string]: any;
}
export default class PDF implements PDFInterface {
    Xml: string;
    CadenaOriginal: string;
    Path?: string | undefined;
    Observaciones?: string | undefined;
    Logo?: string | undefined;
    constructor(params: PDFInterface);
    getTemplate(type: string): string;
    convertXMlToJson(xml: string): cfdiJsonInterface | null;
    nodeToJson(node: Node): JsonObject | string;
    createIngresoPDF(): Promise<Uint8Array>;
    addPageNumbers(pdfDoc: PDFDocument): Promise<Uint8Array>;
    createViewCadenaOriginal(data: string): string;
    createViewQRCodeSellos(uuid: string, rfcEmisor: string, rfcReceptor: string, total: string, selloDEmisor: string, selloDSAT: string): Promise<string>;
    createQRCode(uuid: string, rfcEmisor: string, rfcReceptor: string, total: string, selloDEmisor: string): Promise<string>;
    createTableCFDIIngreso(data: any): string;
    setCfdiRelacionados(data: any): string;
}
export {};
