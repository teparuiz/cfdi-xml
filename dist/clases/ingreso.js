"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CFDIIngreso = void 0;
const xmlbuilder2_1 = require("xmlbuilder2");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
class CFDIIngreso {
    constructor(atributos, emisor, receptor, isGlobal, certificado, noCertificado, conceptos, relacionados) {
        this.atributos = atributos;
        this.receptor = receptor;
        this.emisor = emisor;
        this.isGlobal = isGlobal;
        this.certificado = certificado;
        this.noCertificado = noCertificado;
        this.conceptos = conceptos;
        this.relacionados = relacionados;
    }
    crearXMl() {
        const date = this.atributos.Fecha ||
            (0, moment_timezone_1.default)().tz("America/Mexico_City").format("YYYY-MM-DDTHH:mm:ss");
        const serie_cfdi = this.atributos.Serie || "F";
        const tipoComprobante_cfdi = this.atributos.TipoComprobante || "I";
        const condicionesPago_cfdi = this.atributos.CondicionesDePago || null;
        const moneda_cfdi = this.atributos.Moneda || "MXN";
        const descuento = this.atributos.Descuento || null;
        const exportacion_cfdi = this.atributos.Exportacion || "01";
        const xml = (0, xmlbuilder2_1.create)({ version: "1.0", encoding: "UTF-8" }).ele("cfdi:Comprobante", {
            "xsi:schemaLocation": "http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd",
            "xmlns:cfdi": "http://www.sat.gob.mx/cfd/4",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            Version: "4.0",
            Serie: serie_cfdi,
            Folio: this.atributos.Folio,
            Fecha: date,
            SubTotal: this.atributos.Subtotal,
            Moneda: moneda_cfdi,
            Total: this.atributos.Total,
            TipoDeComprobante: tipoComprobante_cfdi,
            MetodoPago: this.atributos.MetodoPago,
            FormaPago: this.atributos.FormaPago,
            LugarExpedicion: this.atributos.LugarExpedicion,
            NoCertificado: this.noCertificado,
            Certificado: this.certificado,
            Exportacion: exportacion_cfdi,
            Descuento: descuento
        });
        if (this.relacionados.TipoRelacion !== "") {
            const relacionados = xml.ele("cfdi:CfdiRelacionados", { TipoRelacion: this.relacionados.TipoRelacion });
            this.relacionados.doctoRelacionados.forEach((item) => {
                relacionados.ele("cfdi:CfdiRelacionado", {
                    UUID: item.UUID,
                });
            });
        }
        if (condicionesPago_cfdi) {
            xml.att("CondicionesDePago", condicionesPago_cfdi);
        }
        if (this.isGlobal.periocidad !== "") {
            xml.ele("cfdi:InformacionGlobal", {
                Periodicidad: this.isGlobal.periocidad,
                Meses: this.isGlobal.meses,
                Año: this.isGlobal.anio,
            });
        }
        xml.ele("cfdi:Emisor", {
            Rfc: this.emisor.Rfc,
            Nombre: this.emisor.Nombre,
            RegimenFiscal: this.emisor.RegimenFiscal,
        });
        xml.ele("cfdi:Receptor", {
            Rfc: this.receptor.Rfc,
            Nombre: this.receptor.Nombre,
            DomicilioFiscalReceptor: this.receptor.DomicilioFiscalReceptor,
            RegimenFiscalReceptor: this.receptor.RegimenFiscalReceptor,
            UsoCFDI: this.receptor.UsoCFDI,
        });
        const conceptos_ele = xml.ele("cfdi:Conceptos");
        let totalImpuestosTrasladados = 0;
        let totalImpuestosRetenidos = 0;
        this.conceptos.forEach((item) => {
            const concepto_ele = conceptos_ele.ele("cfdi:Concepto", {
                ClaveProdServ: item.ClaveProdServ,
                Cantidad: item.Cantidad,
                ClaveUnidad: item.ClaveUnidad,
                Unidad: item.Unidad,
                Descripcion: item.Descripcion,
                ValorUnitario: tipoComprobante_cfdi === "P" ? 0 : parseFloat(item.ValorUnitario.toString()).toFixed(2),
                Importe: tipoComprobante_cfdi === "P" ? 0 : parseFloat(item.Importe.toString()).toFixed(2),
                ObjetoImp: item.ObjetoImp,
            });
            if (item.NoIdentificacion) {
                concepto_ele.att("NoIdentificacion", item.NoIdentificacion);
            }
            if (item.Descuento) {
                concepto_ele.att("Descuento", parseFloat(item.Descuento.toString()).toFixed(2));
            }
            if (!item.Impuesto)
                return;
            if (item.ObjetoImp.toString() === "02") {
                const impuestos_ele = concepto_ele.ele("cfdi:Impuestos");
                if (item.Impuesto.Impuesto.toString() === "002") {
                    const traslados_ele = impuestos_ele.ele("cfdi:Traslados");
                    const base_imp_total = item.Descuento
                        ? parseFloat(item.Importe.toString()) -
                            parseFloat(item.Descuento.toString())
                        : parseFloat(item.Importe.toString());
                    const TasaOCuota = parseFloat(item.Impuesto.TasaOCuota.toString());
                    const importe = (base_imp_total * TasaOCuota).toFixed(2);
                    if (item.Impuesto.TipoFactor !== "Exento") {
                        totalImpuestosTrasladados += parseFloat(importe);
                    }
                    const traslado_ele = traslados_ele.ele("cfdi:Traslado", {
                        Base: base_imp_total.toFixed(2),
                        Impuesto: item.Impuesto.Impuesto,
                        TipoFactor: item.Impuesto.TipoFactor,
                    });
                    if (item.Impuesto.TipoFactor !== "Exento") {
                        traslado_ele.att("TasaOCuota", TasaOCuota.toFixed(6));
                        traslado_ele.att("Importe", importe);
                    }
                }
                if (item.Retenciones) {
                    const retenciones_ele = impuestos_ele.ele("cfdi:Retenciones");
                    item.Retenciones.forEach((retencion) => {
                        let descuento = 0;
                        if (item.Descuento) {
                            descuento = item.Descuento;
                        }
                        const base = retencion.TipoFactor === "Cuota"
                            ? item.Cantidad.toString()
                            : (parseFloat(item.Importe.toString()) - descuento).toFixed(2);
                        const impuesto = retencion.Impuesto;
                        const tipoFactor = retencion.TipoFactor;
                        const tasaocuota = parseFloat(retencion.TasaOCuota.toString());
                        const importe = (parseFloat(base) * tasaocuota).toFixed(2);
                        retenciones_ele.ele("cfdi:Retencion", {
                            Base: base,
                            Impuesto: impuesto,
                            TipoFactor: tipoFactor,
                            TasaOCuota: tasaocuota.toFixed(6),
                            Importe: importe,
                        });
                        totalImpuestosRetenidos += parseFloat(importe);
                    });
                }
            }
        });
        const createNodeImpuestos = this.conceptos.filter((item) => item.ObjetoImp.toString() === "02");
        if (createNodeImpuestos.length > 0) {
            const impuestos_ele = xml.ele("cfdi:Impuestos");
            const createAttImpTrasladados = this.conceptos.filter((item) => item.Impuesto && item.Impuesto.TipoFactor !== "Exento");
            if (createAttImpTrasladados.length > 0) {
                impuestos_ele.att("TotalImpuestosTrasladados", totalImpuestosTrasladados.toFixed(2));
            }
            const createAttImpRetenidos = this.conceptos.filter((item) => item.Retenciones && item.Retenciones.length > 0);
            if (createAttImpRetenidos.length > 0) {
                impuestos_ele.att("TotalImpuestosRetenidos", totalImpuestosRetenidos.toFixed(2));
            }
            const createNodeRetenciones = this.conceptos.filter((item) => item.Retenciones &&
                item.Retenciones.length > 0 &&
                item.ObjetoImp.toString() === "02");
            if (createNodeRetenciones.length > 0) {
                const retenciones_ele = impuestos_ele.ele("cfdi:Retenciones");
                const array_retenciones = [];
                this.conceptos.forEach((item) => {
                    if (item.ObjetoImp.toString() === "02") {
                        if (item.Retenciones) {
                            item.Retenciones.forEach((retencion) => {
                                const impuesto = retencion.Impuesto;
                                let descuento = item.Descuento || 0;
                                let base;
                                if (impuesto === "003") {
                                    base = parseFloat(item.Cantidad.toString());
                                }
                                else {
                                    base = (parseFloat(item.Importe.toString()) - descuento).toFixed(2);
                                }
                                const tasaocuota = parseFloat(retencion.TasaOCuota.toString());
                                const importe = (parseFloat(base) * tasaocuota).toFixed(2);
                                const existingRetencion = array_retenciones.find((r) => r.Impuesto === impuesto && r.TasaOCuota === tasaocuota);
                                if (existingRetencion) {
                                    existingRetencion.Importe += parseFloat(importe);
                                }
                                else {
                                    array_retenciones.push({
                                        Impuesto: impuesto,
                                        TasaOCuota: tasaocuota,
                                        Importe: parseFloat(importe),
                                    });
                                }
                            });
                        }
                    }
                });
                if (array_retenciones.length > 0) {
                    array_retenciones.forEach((object) => {
                        retenciones_ele.ele("cfdi:Retencion", {
                            Impuesto: object.Impuesto === "003_f" ? "003" : object.Impuesto,
                            Importe: object.Importe.toFixed(2),
                        });
                    });
                }
            }
            // TRASLADOS
            const traslados_ele = impuestos_ele.ele("cfdi:Traslados");
            const array_traslados = [];
            this.conceptos.forEach((item) => {
                if (item.Impuesto &&
                    item.Impuesto.Impuesto === "002" &&
                    item.ObjetoImp.toString() === "02") {
                    const impuesto = item.Impuesto.Impuesto;
                    let descuento = item.Descuento || 0;
                    const base = (parseFloat(item.Importe.toString()) - descuento).toFixed(2);
                    const tasaocuota = parseFloat(item.Impuesto.TasaOCuota.toString());
                    const importe = (parseFloat(base) * tasaocuota).toFixed(2);
                    const existingRetencion = array_traslados.find((r) => r.Impuesto === impuesto && r.TasaOCuota === tasaocuota.toFixed(6));
                    if (existingRetencion) {
                        existingRetencion.Base = (parseFloat(existingRetencion.Base) + parseFloat(base)).toFixed(2);
                        existingRetencion.Importe = (parseFloat(existingRetencion.Importe) + parseFloat(importe)).toFixed(2);
                    }
                    else {
                        array_traslados.push({
                            Base: parseFloat(base).toFixed(2),
                            Importe: parseFloat(importe).toFixed(2),
                            Impuesto: impuesto,
                            TasaOCuota: tasaocuota.toFixed(6),
                            TipoFactor: item.Impuesto.TipoFactor,
                        });
                    }
                }
            });
            if (array_traslados.length > 0) {
                array_traslados.forEach((object) => {
                    const traslado_ele = traslados_ele.ele("cfdi:Traslado", {
                        Base: object.Base,
                        Impuesto: object.Impuesto,
                        TipoFactor: object.TipoFactor,
                    });
                    if (object.TipoFactor !== "Exento") {
                        traslado_ele.att("TasaOCuota", object.TasaOCuota);
                        traslado_ele.att("Importe", object.Importe);
                    }
                });
            }
        }
        return xml.end({ prettyPrint: true });
    }
}
exports.CFDIIngreso = CFDIIngreso;
