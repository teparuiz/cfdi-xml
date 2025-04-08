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
            const { xmlDoc, pagosNode } = this.inicializarDocumentoXML();
            const totales = this.procesarPagos(xmlDoc, pagosNode);
            this.actualizarTotales(xmlDoc, pagosNode, totales);
            const serializer = new xmldom_1.XMLSerializer();
            __classPrivateFieldSet(this, _Pago_xml, serializer.serializeToString(xmlDoc), "f");
            return __classPrivateFieldGet(this, _Pago_xml, "f");
        });
    }
    inicializarDocumentoXML() {
        const parser = new xmldom_1.DOMParser();
        const xmlDoc = parser.parseFromString(__classPrivateFieldGet(this, _Pago_xml, "f"), "application/xml");
        const xmlTimbrado = xmlDoc.getElementsByTagName("tfd:TimbreFiscalDigital");
        if (xmlTimbrado.length !== 0) {
            throw new Error("El XML ya tiene timbre fiscal");
        }
        const nodeBase = xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];
        nodeBase.setAttribute("xmlns:pago20", "http://www.sat.gob.mx/Pagos20");
        const currentSchemaLocation = nodeBase.getAttribute("xsi:schemaLocation") || "";
        nodeBase.setAttribute("xsi:schemaLocation", `${currentSchemaLocation} http://www.sat.gob.mx/Pagos20 http://www.sat.gob.mx/sitio_internet/cfd/Pagos/Pagos20.xsd`);
        const complementoNode = xmlDoc.createElement("cfdi:Complemento");
        nodeBase.appendChild(complementoNode);
        const pagosNode = xmlDoc.createElement("pago20:Pagos");
        pagosNode.setAttribute("Version", "2.0");
        complementoNode.appendChild(pagosNode);
        return { xmlDoc, pagosNode };
    }
    procesarPagos(xmlDoc, pagosNode) {
        const totalesNode = xmlDoc.createElement("pago20:Totales");
        pagosNode.appendChild(totalesNode);
        const totales = {
            MontoTotalPagos: 0,
            TotalTrasladosBaseIVA16: 0,
            TotalTrasladosImpuestoIVA16: 0,
            TotalTrasladosBaseIVAExento: 0,
            TotalRetencionesIVA: 0,
            TotalRetencionesIEPS: 0,
            TotalRetencionesISR: 0
        };
        __classPrivateFieldGet(this, _Pago_pagos, "f").forEach(pago => {
            totales.MontoTotalPagos += Number(pago.Monto);
            const pagoElement = this.crearNodoPago(xmlDoc, pago);
            pagosNode.appendChild(pagoElement);
            pago.doctoRelacionado.forEach(docto => {
                const doctoNode = this.crearNodoDoctoRelacionado(xmlDoc, docto);
                pagoElement.appendChild(doctoNode);
                if (docto.ObjetoImpDR === '02' && docto.ImpuestosDR) {
                    this.agregarImpuestosDR(xmlDoc, doctoNode, docto.ImpuestosDR, totales);
                }
            });
            this.agregarImpuestosPago(xmlDoc, pagoElement, totales, pago.doctoRelacionado);
        });
        return totales;
    }
    crearNodoPago(xmlDoc, pago) {
        const pagoElement = xmlDoc.createElement("pago20:Pago");
        pagoElement.setAttribute("FechaPago", pago.FechaPago);
        pagoElement.setAttribute("FormaDePagoP", pago.FormaPagoP.toString());
        pagoElement.setAttribute("MonedaP", pago.MonedaP);
        pagoElement.setAttribute("TipoCambioP", pago.TipoCambioP.toString());
        pagoElement.setAttribute("Monto", pago.Monto.toFixed(2));
        return pagoElement;
    }
    crearNodoDoctoRelacionado(xmlDoc, docto) {
        const doctoNode = xmlDoc.createElement("pago20:DoctoRelacionado");
        doctoNode.setAttribute("IdDocumento", docto.IdDocumento);
        doctoNode.setAttribute("MonedaDR", docto.MonedaDR.toString());
        doctoNode.setAttribute("EquivalenciaDR", docto.EquivalenciaDR.toString());
        doctoNode.setAttribute("NumParcialidad", docto.NumParcialidad.toString());
        doctoNode.setAttribute("ObjetoImpDR", docto.ObjetoImpDR.toString());
        doctoNode.setAttribute("ImpSaldoAnt", docto.ImpSaldoAnt.toFixed(2));
        doctoNode.setAttribute("ImpPagado", docto.ImpPagado.toFixed(2));
        doctoNode.setAttribute("ImpSaldoInsoluto", docto.ImpSaldoInsoluto.toFixed(2));
        if (docto.Folio)
            doctoNode.setAttribute("Folio", docto.Folio.toString());
        if (docto.Serie)
            doctoNode.setAttribute("Serie", docto.Serie.toString());
        return doctoNode;
    }
    agregarImpuestosDR(xmlDoc, doctoNode, impuestosDR, totales) {
        const impuestoDR = xmlDoc.createElement("pago20:ImpuestosDR");
        doctoNode.appendChild(impuestoDR);
        const trasladosDR = xmlDoc.createElement("pago20:TrasladosDR");
        const retencionesDR = xmlDoc.createElement("pago20:RetencionesDR");
        impuestosDR.forEach(impuesto => {
            if (impuesto.Tipo === "traslado") {
                const trasladoDR = this.crearNodoTrasladoDR(xmlDoc, impuesto);
                trasladosDR.appendChild(trasladoDR);
                this.actualizarTotalesTraslados(impuesto, totales);
            }
            else if (impuesto.Tipo === "retencion") {
                const retencionDR = this.crearNodoRetencionDR(xmlDoc, impuesto);
                retencionesDR.appendChild(retencionDR);
                this.actualizarTotalesRetenciones(impuesto, totales);
            }
        });
        if (trasladosDR.hasChildNodes())
            impuestoDR.appendChild(trasladosDR);
        if (retencionesDR.hasChildNodes())
            impuestoDR.appendChild(retencionesDR);
    }
    crearNodoTrasladoDR(xmlDoc, impuesto) {
        var _a, _b, _c, _d, _e;
        const trasladoDR = xmlDoc.createElement("pago20:TrasladoDR");
        trasladoDR.setAttribute("BaseDR", ((_a = impuesto.BaseDR) === null || _a === void 0 ? void 0 : _a.toFixed(2)) || "0.000000");
        trasladoDR.setAttribute("ImpuestoDR", ((_b = impuesto.ImpuestoDR) === null || _b === void 0 ? void 0 : _b.toString()) || "");
        trasladoDR.setAttribute("TipoFactorDR", ((_c = impuesto.TipoFactorDR) === null || _c === void 0 ? void 0 : _c.toString()) || "");
        if (impuesto.TipoFactorDR !== "Exento") {
            trasladoDR.setAttribute("TasaOCuotaDR", ((_d = impuesto.TasaOCuotaDR) === null || _d === void 0 ? void 0 : _d.toFixed(6)) || "0.000000");
            trasladoDR.setAttribute("ImporteDR", ((_e = impuesto.ImporteDR) === null || _e === void 0 ? void 0 : _e.toFixed(2)) || "0.000000");
        }
        return trasladoDR;
    }
    crearNodoRetencionDR(xmlDoc, impuesto) {
        var _a, _b, _c, _d, _e;
        const retencionDR = xmlDoc.createElement("pago20:RetencionDR");
        retencionDR.setAttribute("BaseDR", ((_a = impuesto.BaseDR) === null || _a === void 0 ? void 0 : _a.toFixed(2)) || "0.000000");
        retencionDR.setAttribute("ImpuestoDR", ((_b = impuesto.ImpuestoDR) === null || _b === void 0 ? void 0 : _b.toString()) || "");
        retencionDR.setAttribute("TipoFactorDR", ((_c = impuesto.TipoFactorDR) === null || _c === void 0 ? void 0 : _c.toString()) || "");
        if (impuesto.TipoFactorDR !== "Exento") {
            retencionDR.setAttribute("TasaOCuotaDR", ((_d = impuesto.TasaOCuotaDR) === null || _d === void 0 ? void 0 : _d.toFixed(6)) || "0.000000");
            retencionDR.setAttribute("ImporteDR", ((_e = impuesto.ImporteDR) === null || _e === void 0 ? void 0 : _e.toFixed(2)) || "0.000000");
        }
        return retencionDR;
    }
    actualizarTotalesTraslados(impuesto, totales) {
        if (impuesto.ImpuestoDR === "002") {
            if (impuesto.TipoFactorDR === "Exento") {
                totales.TotalTrasladosBaseIVAExento += impuesto.BaseDR || 0;
            }
            else {
                totales.TotalTrasladosBaseIVA16 += impuesto.BaseDR || 0;
                totales.TotalTrasladosImpuestoIVA16 += impuesto.ImporteDR || 0;
            }
        }
    }
    actualizarTotalesRetenciones(impuesto, totales) {
        const importe = impuesto.ImporteDR || 0;
        switch (impuesto.ImpuestoDR) {
            case "001":
                totales.TotalRetencionesISR += importe;
                break;
            case "002":
                totales.TotalRetencionesIVA += importe;
                break;
            case "003":
                totales.TotalRetencionesIEPS += importe;
                break;
        }
    }
    agregarImpuestosPago(xmlDoc, pagoElement, totales, doctosRelacionados) {
        const impuestosPago = xmlDoc.createElement("pago20:ImpuestosP");
        pagoElement.appendChild(impuestosPago);
        // Determinar si debemos mostrar detalles individuales o sumarizados
        const mostrarDetallesIndividuales = doctosRelacionados.length === 1;
        // Procesar traslados
        if (totales.TotalTrasladosBaseIVA16 > 0 || totales.TotalTrasladosBaseIVAExento > 0) {
            const trasladosP = xmlDoc.createElement("pago20:TrasladosP");
            impuestosPago.appendChild(trasladosP);
            if (mostrarDetallesIndividuales) {
                // Mostrar todos los traslados individualmente para un solo documento
                const docto = doctosRelacionados[0];
                if (docto.ImpuestosDR) {
                    docto.ImpuestosDR
                        .filter(imp => imp.Tipo === "traslado")
                        .forEach(impuesto => {
                        var _a, _b, _c, _d, _e;
                        const trasladoP = xmlDoc.createElement("pago20:TrasladoP");
                        trasladoP.setAttribute("BaseP", ((_a = impuesto.BaseDR) === null || _a === void 0 ? void 0 : _a.toFixed(2)) || "0.00");
                        trasladoP.setAttribute("ImpuestoP", ((_b = impuesto.ImpuestoDR) === null || _b === void 0 ? void 0 : _b.toString()) || "");
                        trasladoP.setAttribute("TipoFactorP", ((_c = impuesto.TipoFactorDR) === null || _c === void 0 ? void 0 : _c.toString()) || "");
                        if (impuesto.TipoFactorDR !== "Exento") {
                            trasladoP.setAttribute("TasaOCuotaP", ((_d = impuesto.TasaOCuotaDR) === null || _d === void 0 ? void 0 : _d.toFixed(6)) || "0.000000");
                            trasladoP.setAttribute("ImporteP", ((_e = impuesto.ImporteDR) === null || _e === void 0 ? void 0 : _e.toFixed(2)) || "0.00");
                        }
                        trasladosP.appendChild(trasladoP);
                    });
                }
            }
            else {
                // Sumarizar traslados para múltiples documentos
                if (totales.TotalTrasladosBaseIVAExento > 0) {
                    const trasladoP = xmlDoc.createElement("pago20:TrasladoP");
                    trasladoP.setAttribute("BaseP", totales.TotalTrasladosBaseIVAExento.toFixed(2));
                    trasladoP.setAttribute("ImpuestoP", "002");
                    trasladoP.setAttribute("TipoFactorP", "Exento");
                    trasladosP.appendChild(trasladoP);
                }
                if (totales.TotalTrasladosBaseIVA16 > 0) {
                    const trasladoP = xmlDoc.createElement("pago20:TrasladoP");
                    trasladoP.setAttribute("BaseP", totales.TotalTrasladosBaseIVA16.toFixed(2));
                    trasladoP.setAttribute("ImpuestoP", "002");
                    trasladoP.setAttribute("TipoFactorP", "Tasa");
                    trasladoP.setAttribute("TasaOCuotaP", "0.160000");
                    trasladoP.setAttribute("ImporteP", totales.TotalTrasladosImpuestoIVA16.toFixed(2));
                    trasladosP.appendChild(trasladoP);
                }
            }
        }
        // Procesar retenciones (siempre sumarizadas)
        if (totales.TotalRetencionesISR > 0 || totales.TotalRetencionesIVA > 0 || totales.TotalRetencionesIEPS > 0) {
            const retencionesP = xmlDoc.createElement("pago20:RetencionesP");
            impuestosPago.appendChild(retencionesP);
            if (totales.TotalRetencionesISR > 0) {
                const retencionP = xmlDoc.createElement("pago20:RetencionP");
                retencionP.setAttribute("ImpuestoP", "001");
                retencionP.setAttribute("ImporteP", totales.TotalRetencionesISR.toFixed(2));
                retencionesP.appendChild(retencionP);
            }
            if (totales.TotalRetencionesIVA > 0) {
                const retencionP = xmlDoc.createElement("pago20:RetencionP");
                retencionP.setAttribute("ImpuestoP", "002");
                retencionP.setAttribute("ImporteP", totales.TotalRetencionesIVA.toFixed(2));
                retencionesP.appendChild(retencionP);
            }
            if (totales.TotalRetencionesIEPS > 0) {
                const retencionP = xmlDoc.createElement("pago20:RetencionP");
                retencionP.setAttribute("ImpuestoP", "003");
                retencionP.setAttribute("ImporteP", totales.TotalRetencionesIEPS.toFixed(2));
                retencionesP.appendChild(retencionP);
            }
        }
    }
    actualizarTotales(xmlDoc, pagosNode, totales) {
        const totalesNode = pagosNode.getElementsByTagName("pago20:Totales")[0];
        totalesNode.setAttribute("MontoTotalPagos", totales.MontoTotalPagos.toFixed(2));
        if (totales.TotalTrasladosBaseIVA16 > 0) {
            totalesNode.setAttribute("TotalTrasladosBaseIVA16", totales.TotalTrasladosBaseIVA16.toFixed(2));
            totalesNode.setAttribute("TotalTrasladosImpuestoIVA16", totales.TotalTrasladosImpuestoIVA16.toFixed(2));
        }
        if (totales.TotalTrasladosBaseIVAExento > 0) {
            totalesNode.setAttribute("TotalTrasladosBaseIVAExento", totales.TotalTrasladosBaseIVAExento.toFixed(2));
        }
        if (totales.TotalRetencionesISR > 0) {
            totalesNode.setAttribute("TotalRetencionesISR", totales.TotalRetencionesISR.toFixed(2));
        }
        if (totales.TotalRetencionesIVA > 0) {
            totalesNode.setAttribute("TotalRetencionesIVA", totales.TotalRetencionesIVA.toFixed(2));
        }
        if (totales.TotalRetencionesIEPS > 0) {
            totalesNode.setAttribute("TotalRetencionesIEPS", totales.TotalRetencionesIEPS.toFixed(2));
        }
    }
}
exports.Pago = Pago;
_Pago_xml = new WeakMap(), _Pago_pagos = new WeakMap();
