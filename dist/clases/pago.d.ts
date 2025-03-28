import { pagoInterface } from "./../interfaces/facturaInterfaces";
export declare class Pago {
    #private;
    constructor(xml: string);
    agregarPago(pagos: pagoInterface[]): void;
    generarPago(): Promise<any>;
}
