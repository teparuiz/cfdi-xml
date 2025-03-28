"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Pago_xml, _Pago_pagos;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pago = void 0;
const xmldom_1 = require("@xmldom/xmldom");
class Pago {
    constructor(xml) {
        _Pago_xml.set(this, void 0);
        _Pago_pagos.set(this, void 0);
        __classPrivateFieldSet(this, _Pago_xml, xml, "f");
        __classPrivateFieldSet(this, _Pago_pagos, [], "f");
    }
    agregarPago(pagos) {
        __classPrivateFieldSet(this, _Pago_pagos, pagos, "f");
    }
    generarPago() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, _Pago_xml, "f")) {
                throw new Error("No hay XML base para generar el complemento de pago");
            }
            const parser = new xmldom_1.DOMParser();
            const xmlDoc = parser.parseFromString(__classPrivateFieldGet(this, _Pago_xml, "f"), "application/xml");
            const xmlTimbrado = xmlDoc.getElementsByTagName("tfd:TimbreFiscalDigital");
            // Verificar si ya tiene timbre fiscal
            if (xmlTimbrado.length !== 0) {
                throw new Error("El XML ya tiene timbre fiscal");
            }
            const nodeBase = xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];
            // Agregar namespaces necesarios
            nodeBase.setAttribute("xmlns:pago20", "http://www.sat.gob.mx/Pagos20");
            const currentSchemaLocation = nodeBase.getAttribute("xsi:schemaLocation") || "";
            nodeBase.setAttribute("xsi:schemaLocation", `${currentSchemaLocation} http://www.sat.gob.mx/Pagos20 http://www.sat.gob.mx/sitio_internet/cfd/Pagos/Pagos20.xsd`);
            const complementoNode = xmlDoc.createElement("cfdi:Complemento");
            nodeBase.appendChild(complementoNode);
            const pagosNode = xmlDoc.createElement("pago20:Pagos");
            pagosNode.setAttribute("Version", "2.0");
            complementoNode.appendChild(pagosNode);
            let TotalTrasladosImpuestoIVA16 = 0;
            let TotalTrasladosBaseIVA16 = 0;
            let MontoTotalPagos = 0;
            let TotalRetencionesIVA = 0;
            let TotalRetencionesIEPS = 0;
            let TotalRetencionesISR = 0;
            // totales
            const totalesNode = xmlDoc.createElement("pago20:Totales");
            pagosNode.appendChild(totalesNode);
            // pagos
            __classPrivateFieldGet(this, _Pago_pagos, "f").forEach((item) => {
                MontoTotalPagos += Number(item.Monto);
                totalesNode.setAttribute("MontoTotalPagos", MontoTotalPagos.toFixed(2).toString());
                const pagos_ele = xmlDoc.createElement("pago20:Pago");
                pagos_ele.setAttribute("FechaPago", item.FechaPago);
                pagos_ele.setAttribute("FormaDePagoP", item.FormaPagoP.toString());
                pagos_ele.setAttribute("MonedaP", item.MonedaP);
                pagos_ele.setAttribute("TipoCambioP", item.TipoCambioP.toString());
                pagos_ele.setAttribute("Monto", item.Monto.toFixed(2).toString());
                pagosNode.appendChild(pagos_ele);
                // documentos relacionados
                item.doctoRelacionado.forEach((item) => {
                    const doctoNode = xmlDoc.createElement("pago20:DoctoRelacionado");
                    doctoNode.setAttribute("IdDocumento", item.IdDocumento);
                    doctoNode.setAttribute("MonedaDR", item.MonedaDR.toString());
                    doctoNode.setAttribute("EquivalenciaDR", item.EquivalenciaDR.toString());
                    doctoNode.setAttribute("NumParcialidad", item.NumParcialidad.toString());
                    doctoNode.setAttribute("ObjetoImpDR", item.ObjetoImpDR.toString());
                    doctoNode.setAttribute("ImpSaldoAnt", item.ImpSaldoAnt.toFixed(2).toString());
                    doctoNode.setAttribute("ImpPagado", item.ImpPagado.toFixed(2).toString());
                    doctoNode.setAttribute("ImpSaldoInsoluto", item.ImpSaldoInsoluto.toFixed(2).toString());
                    if (item.Folio) {
                        doctoNode.setAttribute("Folio", item.Folio.toString());
                    }
                    if (item.Serie) {
                        doctoNode.setAttribute("Serie", item.MonedaDR.toString());
                    }
                    pagos_ele.appendChild(doctoNode);
                    const impuestoDR = xmlDoc.createElement("pago20:ImpuestosDR");
                    doctoNode.appendChild(impuestoDR);
                    const traslados_dr = xmlDoc.createElement("pago20:TrasladosDR");
                    const retenciones_dr = xmlDoc.createElement("pago20:RetencionesDR");
                    item.ImpuestosDR.forEach((item) => {
                        if (item.Tipo === "traslado") {
                            impuestoDR.appendChild(traslados_dr);
                            const traslado_dr = xmlDoc.createElement("pago20:TrasladoDR");
                            traslado_dr.setAttribute("BaseDR", item.BaseDR.toFixed(2).toString());
                            traslado_dr.setAttribute("ImpuestoDR", item.ImpuestoDR.toString());
                            traslado_dr.setAttribute("TipoFactorDR", item.TipoFactorDR.toString());
                            traslado_dr.setAttribute("TasaOCuotaDR", item.TasaOCuotaDR.toFixed(6).toString());
                            traslado_dr.setAttribute("ImporteDR", item.ImporteDR.toFixed(2).toString());
                            traslados_dr.appendChild(traslado_dr);
                        }
                        if (item.Tipo === "retencion") {
                            impuestoDR.appendChild(retenciones_dr);
                            const retencion_dr = xmlDoc.createElement("pago20:RetencionDR");
                            retencion_dr.setAttribute("BaseDR", item.BaseDR.toFixed(2).toString());
                            retencion_dr.setAttribute("ImpuestoDR", item.ImporteDR.toFixed(2).toString());
                            retencion_dr.setAttribute("TipoFactorDR", item.TipoFactorDR.toString());
                            retencion_dr.setAttribute("TasaOCuotaDR", item.TasaOCuotaDR.toFixed(6).toString());
                            retencion_dr.setAttribute("ImporteDR", item.ImporteDR.toFixed(2).toString());
                            retenciones_dr.appendChild(retencion_dr);
                        }
                    });
                });
                // impuestos del pago
                const impuestosPago = xmlDoc.createElement("pago20:ImpuestosP");
                pagos_ele.appendChild(impuestosPago);
                const traslados_p = xmlDoc.createElement("pago20:TrasladosP");
                const retenciones_p = xmlDoc.createElement("pago20:RetencionesP");
                item.doctoRelacionado.forEach((item) => {
                    item.ImpuestosDR.forEach((item) => {
                        if (item.Tipo === "traslado") {
                            impuestosPago.appendChild(traslados_p);
                            if (item.ImpuestoDR === "002") {
                                TotalTrasladosBaseIVA16 += Number(item.BaseDR);
                                TotalTrasladosImpuestoIVA16 += Number(item.ImporteDR);
                                totalesNode.setAttribute("TotalTrasladosBaseIVA16", TotalTrasladosBaseIVA16.toFixed(2).toString());
                                totalesNode.setAttribute("TotalTrasladosImpuestoIVA16", TotalTrasladosImpuestoIVA16.toFixed(2).toString());
                                const traslado_p = xmlDoc.createElement("pago20:TrasladoP");
                                traslado_p.setAttribute("ImpuestoP", item.ImpuestoDR.toString());
                                traslado_p.setAttribute("ImporteP", item.ImporteDR.toFixed(6).toString());
                                traslado_p.setAttribute("TipoFactorP", item.TipoFactorDR.toString());
                                traslado_p.setAttribute("TasaOCuotaP", item.TasaOCuotaDR.toFixed(6).toString());
                                traslado_p.setAttribute("BaseP", item.BaseDR.toFixed(2).toString());
                                traslados_p.appendChild(traslado_p);
                            }
                        }
                        if (item.Tipo === "retencion") {
                            impuestosPago.appendChild(retenciones_p);
                            TotalRetencionesIVA += Number(item.ImporteDR);
                            TotalRetencionesISR += Number(item.ImporteDR);
                            TotalRetencionesIEPS += Number(item.ImporteDR);
                            totalesNode.setAttribute("TotalRetencionesIVA", TotalRetencionesIVA.toString());
                            totalesNode.setAttribute("TotalRetencionesIEPS", TotalRetencionesIEPS.toString());
                            totalesNode.setAttribute("TotalRetencionesISR", TotalRetencionesISR.toString());
                            const retencion_p = xmlDoc.createElement("pago20:RetencionP");
                            retencion_p.setAttribute("ImpuestoP", item.ImpuestoDR.toString());
                            retencion_p.setAttribute("ImporteP", item.ImporteDR.toFixed(2).toString());
                            retenciones_p.appendChild(retencion_p);
                        }
                    });
                });
            });
            const serializer = new xmldom_1.XMLSerializer();
            __classPrivateFieldSet(this, _Pago_xml, serializer.serializeToString(xmlDoc), "f");
            return __classPrivateFieldGet(this, _Pago_xml, "f");
        });
    }
}
exports.Pago = Pago;
_Pago_xml = new WeakMap(), _Pago_pagos = new WeakMap();
