import { atributosInterface, ReceptorInterface, EmisorInterface, atributosConceptoInterface, InvoiceGlobalInterface, relacionadosInterface } from "../interfaces/facturaInterfaces";
export declare class CFDIIngreso {
    atributos: atributosInterface;
    noCertificado: string;
    certificado: string;
    emisor: {
        Rfc: string;
        Nombre: string;
        RegimenFiscal: string | number;
    };
    receptor: {
        Rfc: string;
        Nombre: string;
        RegimenFiscal: string;
        DomicilioFiscalReceptor: string | number;
        RegimenFiscalReceptor: string | number;
        UsoCFDI: string;
    };
    isGlobal: {
        periocidad: string | number;
        meses: string | number;
        anio: string | number;
    };
    relacionados: relacionadosInterface;
    conceptos: atributosConceptoInterface[];
    constructor(atributos: atributosInterface, emisor: EmisorInterface, receptor: ReceptorInterface, isGlobal: InvoiceGlobalInterface, certificado: string, noCertificado: string, conceptos: atributosConceptoInterface[], relacionados: relacionadosInterface);
    crearXMl(): string;
}
