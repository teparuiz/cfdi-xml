import { atributosInterface, atributosConceptoInterface, PDFInterface, catalogoResult, atributosCartaPorteInterface, ubicacionOrigenInterface, ubicacionDestinoInterface, mercanciasInterface, itemMercanciaInterface, documentacionAduaneraInterface, cantidadTransportaInterface, autotransporteInterface, identificacionVehicularInterface, segurosInterface, remolquesInterface, tipoFiguraInterface, partesTransporteInterface, domicilioInterface, pagoInterface } from "./interfaces/facturaInterfaces";
export declare class FacturaCFDI {
    #private;
    constructor();
    certificado(cerStream: Buffer): void;
    esGlobal(periocidad: string | number, meses: string | number, anio: string | number): void;
    crearSello(keyStream: Buffer, password: string): void;
    crearEmisor(rfc: string, nombre: string, regimenFiscal: string | number): void;
    crearReceptor(rfc: string, nombre: string, regimenFiscal: string | number, codigoPostal: string | number, usoCfdi: string): void;
    crearConceptos(conceptos: atributosConceptoInterface[]): void;
    generarXml(atributos: atributosInterface): string;
    generarXmlSellado(atributos: atributosInterface): Promise<string>;
    generarPDF(params: PDFInterface): Promise<Uint8Array>;
}
export declare class CatalogosSAT {
    constructor();
    obtenerCatalogo(nombreCatalogo: string): catalogoResult;
    buscarEnCatalogo(valor: string, clave: string, nombreCatalogo: string): catalogoResult | undefined;
}
export declare class CartaPorte {
    #private;
    constructor(xml: string);
    crearRegimenesAduaneros(array: string[]): void;
    crearUbicacionOrigen(data: ubicacionOrigenInterface): void;
    crearUbicacionDestino(data: ubicacionDestinoInterface): void;
    crearMercancias(data: mercanciasInterface): void;
    crearMercancia(data: itemMercanciaInterface): this;
    crearDocumentacionAduanera(data: documentacionAduaneraInterface): this;
    crearCantidadTransporta(data: cantidadTransportaInterface): void;
    crearAutotransporte(data: autotransporteInterface): this;
    crearIdentificacionVehicular(data: identificacionVehicularInterface): this;
    crearSeguros(data: segurosInterface): this;
    crearRemolques(data: remolquesInterface): this;
    crearTipoFigura(data: tipoFiguraInterface): this;
    crearPartesTransporte(data: partesTransporteInterface): this;
    crearDomicilioTipoFigura(data: domicilioInterface): this;
    crearSello(keyStream: Buffer, password: string): void;
    generarCartaPorte(atributos: atributosCartaPorteInterface): Promise<string | {
        status: boolean;
        data: null;
        message: string;
    }>;
}
export declare class ComplementoPago {
    #private;
    constructor(xml: string, pagosData: Array<pagoInterface>);
    crearSello(keyStream: Buffer, password: string): void;
    generarXmlSellado(): Promise<string>;
}
