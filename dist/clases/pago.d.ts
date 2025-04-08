import { pagoInterface } from "./../interfaces/facturaInterfaces";
export declare class Pago {
    #private;
    constructor(xml: string);
    agregarPago(pagos: pagoInterface[]): void;
    generarPago(): Promise<string>;
    private inicializarDocumentoXML;
    private procesarPagos;
    private crearNodoPago;
    private crearNodoDoctoRelacionado;
    private agregarImpuestosDR;
    private crearNodoTrasladoDR;
    private crearNodoRetencionDR;
    private actualizarTotalesTraslados;
    private actualizarTotalesRetenciones;
    private agregarImpuestosPago;
    private actualizarTotales;
}
