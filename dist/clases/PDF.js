"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_lib_1 = require("pdf-lib");
const puppeteer_1 = __importDefault(require("puppeteer"));
const xmldom_1 = require("@xmldom/xmldom");
const xpath = __importStar(require("xpath"));
const utils_1 = require("../utilerias/utils");
const qrcode_1 = __importDefault(require("qrcode"));
const buscadorClaves_1 = require("../utilerias/buscadorClaves");
class PDF {
    constructor(params) {
        this.Xml = params.Xml;
        this.CadenaOriginal = params.CadenaOriginal;
        this.Path = params.Path;
        this.Observaciones = params.Observaciones;
        this.Logo = params.Logo;
    }
    getTemplate(type) {
        try {
            const basePath = path_1.default.resolve(__dirname, "..", "resources", "templates");
            let template = path_1.default.join(basePath, `${type}_Pdf.html`);
            if (this.Path) {
                if (!fs_1.default.existsSync(this.Path)) {
                    throw new Error("La plantilla PDF no existe o no fue encontrada en la ruta dada.");
                }
                template = this.Path;
            }
            return fs_1.default.readFileSync(template, "utf-8");
        }
        catch (error) {
            throw error;
        }
    }
    convertXMlToJson(xml) {
        const doc = new xmldom_1.DOMParser().parseFromString(xml, "text/xml");
        const nodes = xpath.select("/*", doc);
        if (nodes.length > 0) {
            return JSON.stringify(this.nodeToJson(nodes[0]));
        }
        return null;
    }
    nodeToJson(node) {
        var _a;
        const obj = {};
        if (node.nodeType === 1) {
            const element = node;
            if (element.attributes.length > 0) {
                obj["@attributes"] = {};
                for (let j = 0; j < element.attributes.length; j++) {
                    const attribute = element.attributes.item(j);
                    if (attribute) {
                        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                    }
                }
            }
        }
        else if (node.nodeType === 3) {
            const value = (_a = node.nodeValue) === null || _a === void 0 ? void 0 : _a.trim();
            if (value) {
                return value;
            }
        }
        // Recorre los hijos del nodo
        if (node.hasChildNodes()) {
            for (let i = 0; i < node.childNodes.length; i++) {
                const child = node.childNodes.item(i);
                if (child) {
                    const nodeName = child.nodeName;
                    if (typeof obj[nodeName] === "undefined") {
                        obj[nodeName] = this.nodeToJson(child);
                    }
                    else {
                        if (!Array.isArray(obj[nodeName])) {
                            const old = obj[nodeName];
                            obj[nodeName] = [];
                            obj[nodeName].push(old);
                        }
                        obj[nodeName].push(this.nodeToJson(child));
                    }
                }
            }
        }
        return obj;
    }
    createIngresoPDF() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const getTemplate = this.getTemplate("Ingreso");
                let json_data = this.convertXMlToJson(this.Xml);
                if (json_data) {
                    json_data = JSON.parse(json_data.toString());
                }
                const data_fiscal = json_data["@attributes"];
                const emisor = json_data["cfdi:Emisor"]["@attributes"];
                const receptor = json_data["cfdi:Receptor"]["@attributes"];
                const detailsCrudo = json_data["cfdi:Conceptos"]["cfdi:Concepto"];
                const details = [].concat(detailsCrudo);
                const impuestos = ((_a = json_data["cfdi:Impuestos"]) === null || _a === void 0 ? void 0 : _a["@attributes"]) || {};
                const complemento = json_data["cfdi:Complemento"]["tfd:TimbreFiscalDigital"]["@attributes"];
                const cfdiR = json_data["cfdi:CfdiRelacionados"];
                const cfdiRelacionados = cfdiR
                    ? [].concat(cfdiR)
                    : [];
                let heightCFDIRelacionados = 0;
                if (cfdiRelacionados.length > 0) {
                    cfdiRelacionados.forEach((item) => {
                        const relaciones = [].concat(item["cfdi:CfdiRelacionado"]);
                        heightCFDIRelacionados += relaciones.length * 10;
                    });
                }
                const facturaGlobal = json_data["cfdi:InformacionGlobal"];
                let varFacturaGlobal = "";
                if (facturaGlobal) {
                    const periocidad = (0, buscadorClaves_1.buscarPeriodicidad)(facturaGlobal["@attributes"].Periodicidad);
                    const meses = (0, buscadorClaves_1.buscarMeses)(facturaGlobal["@attributes"].Meses);
                    varFacturaGlobal = `${facturaGlobal["@attributes"].Periodicidad} ${periocidad === null || periocidad === void 0 ? void 0 : periocidad.descripcion} | ${facturaGlobal["@attributes"].Meses} ${meses === null || meses === void 0 ? void 0 : meses.descripcion} | ${facturaGlobal["@attributes"].Año}`;
                }
                const browser = yield puppeteer_1.default.launch();
                const page = yield browser.newPage();
                const pdfBuffers = [];
                const maxHeightHeaders = 240; // Altura maxima de encabezados
                const maxHeightTotals = 158; // Altura maxima de los totales
                const maxHeight = parseFloat("633.6"); // Altura máxima de la tabla en px
                const maxHeightPage = 960; // Altura maxima de la pagina
                const baseItemHeight = parseFloat("17.28"); // Altura base de cada item en px
                let remainingDetails = [...details]; // Altura máxima en px por página
                const usoCfdiReceptor = (0, buscadorClaves_1.buscarUsoCFDI)(receptor.UsoCFDI);
                const regimenFReceptor = (0, buscadorClaves_1.buscarRegimenFiscal)(receptor.RegimenFiscalReceptor);
                const regimentFEmisor = (0, buscadorClaves_1.buscarRegimenFiscal)(emisor.RegimenFiscal);
                const formaPago = (0, buscadorClaves_1.buscarFormaPago)(data_fiscal.FormaPago);
                const metodoPago = (0, buscadorClaves_1.buscarMetodoPago)(data_fiscal.MetodoPago);
                while (remainingDetails.length > 0) {
                    let currentPageData = [];
                    let currentHeight = 0;
                    // Determinar cuántos items caben en la página actual
                    while (remainingDetails.length > 0) {
                        const item = remainingDetails[0];
                        let itemHeight = parseFloat("17.28");
                        if (item["cfdi:Impuestos"]) {
                            if (item["cfdi:Impuestos"]["cfdi:Traslados"]) {
                                const traslados = item["cfdi:Impuestos"]["cfdi:Traslados"]["cfdi:Traslado"];
                                const trasladoArray = [].concat(traslados);
                                itemHeight += trasladoArray.length * baseItemHeight;
                            }
                            if (item["cfdi:Impuestos"]["cfdi:Retenciones"]) {
                                const retenciones = item["cfdi:Impuestos"]["cfdi:Retenciones"]["cfdi:Retencion"];
                                const retencionesArray = [].concat(retenciones);
                                itemHeight += retencionesArray.length * baseItemHeight;
                            }
                        }
                        if (currentHeight + itemHeight > maxHeight) {
                            break; // La altura máxima se ha alcanzado, salir del bucle
                        }
                        const subtractHeight = maxHeightPage -
                            (currentHeight +
                                itemHeight +
                                maxHeightHeaders +
                                maxHeightTotals +
                                heightCFDIRelacionados);
                        if (remainingDetails.length <= 1 && 190 > subtractHeight) {
                            break;
                        }
                        // Agregar el item a la página actual
                        currentPageData.push(remainingDetails.shift());
                        currentHeight += itemHeight;
                    }
                    const getDiscount = data_fiscal.Descuento
                        ? data_fiscal.Descuento
                        : "0";
                    const getImpuestos = impuestos.TotalImpuestosTrasladados
                        ? impuestos.TotalImpuestosTrasladados
                        : "0";
                    const getRetenciones = impuestos.TotalImpuestosRetenidos
                        ? impuestos.TotalImpuestosRetenidos
                        : "0";
                    const condicionesPago = data_fiscal.CondicionesPago
                        ? data_fiscal.CondicionesPago
                        : "";
                    const total = parseFloat(data_fiscal.SubTotal) -
                        parseFloat(getDiscount) -
                        parseFloat(getRetenciones) +
                        parseFloat(getImpuestos);
                    const decimalValue = (total - Math.floor(total)) * 100;
                    let currentPageHtml = getTemplate
                        .replace("__logo__", `data:image/png;base64,${this.Logo}`)
                        .replace(/__NombreEmisor__/g, emisor.Nombre)
                        .replace("__RFCEmisor__", emisor.Rfc)
                        .replace("__RegimenFiscalEmisor__", `${emisor.RegimenFiscal} - ${regimentFEmisor === null || regimentFEmisor === void 0 ? void 0 : regimentFEmisor.descripcion}`)
                        .replace("__SerieComprobante__", data_fiscal.Serie)
                        .replace("__FolioComprobante__", data_fiscal.Folio)
                        .replace("__FechaComprobante__", data_fiscal.Fecha)
                        .replace("__LugarExpedicionComprobante__", data_fiscal.LugarExpedicion)
                        .replace("__UUIDComprobante__", complemento.UUID)
                        .replace("__NoCertificadoEmisor__", data_fiscal.NoCertificado)
                        .replace(/__NombreReceptor__/g, receptor.Nombre)
                        .replace("__RFCReceptor__", receptor.Rfc)
                        .replace("__DomicilioFiscalReceptor__", receptor.DomicilioFiscalReceptor)
                        .replace("__RegimenFiscalReceptor__", `${receptor.RegimenFiscalReceptor} - ${regimenFReceptor === null || regimenFReceptor === void 0 ? void 0 : regimenFReceptor.descripcion}`)
                        .replace("__UsoCFDIReceptor__", `${receptor.UsoCFDI} - ${usoCfdiReceptor === null || usoCfdiReceptor === void 0 ? void 0 : usoCfdiReceptor.descripcion}`)
                        .replace("__TablaConceptos__", this.createTableCFDIIngreso(currentPageData))
                        .replace("__SubtotalComprobante__", parseFloat(data_fiscal.SubTotal).toFixed(2))
                        .replace("__DescuentoComprobante__", parseFloat(getDiscount).toFixed(2))
                        .replace("__ImpuestosComprobante__", getImpuestos)
                        .replace("__TotalComprobante__", total.toFixed(2));
                    // Solo agregar el sello en la última página
                    if (remainingDetails.length === 0) {
                        currentPageHtml = currentPageHtml
                            .replace("__CadenaOriginalComprobante__", this.createViewCadenaOriginal(this.CadenaOriginal))
                            .replace("__QRCodeSellosComprobante__", yield this.createViewQRCodeSellos(complemento.UUID, emisor.Rfc, receptor.Rfc, data_fiscal.Total, complemento.SelloCFD, complemento.SelloSAT))
                            .replace("__CFDIRelacionadosComprobante__", ` <span style="font-weight: 600">CFDI Relacionados: </span> <span>${this.setCfdiRelacionados(cfdiRelacionados)}</span>`)
                            .replace("__FormaPagoComprobante__", `<span style="font-weight: 600">Forma de pago: </span><span>${data_fiscal.FormaPago} - ${formaPago === null || formaPago === void 0 ? void 0 : formaPago.descripcion}</span>`)
                            .replace("__MetodoPagoComprobante__", `<span style="font-weight: 600">Método de pago: </span><span>${data_fiscal.MetodoPago} - ${metodoPago === null || metodoPago === void 0 ? void 0 : metodoPago.descripcion}</span>`)
                            .replace("__CondicionesPagoComprobante__", `<span style="font-weight: 600">Condiciones de pago: </span><span>${condicionesPago}</span>`)
                            .replace("__NoCertificadoSAT__", `<span style="font-weight: 600">No. Certificado SAT: </span><span>${complemento.NoCertificadoSAT}</span>`)
                            .replace("__FechaTimbradoComprobante__", `<span style="font-weight: 600">Fecha de certificación: </span><span>${complemento.FechaTimbrado}</span>`)
                            .replace("__FacturaGlobalComprobante__", `<span style="font-weight: 600">Factura global: </span><span>${varFacturaGlobal}</span>`)
                            .replace("__TotalLetraComprobante__", `<span style="font-weight: 600">Total con letra: </span><span>${(0, utils_1.numberToWords)(total.toFixed(2))} PESOS ${parseInt(decimalValue.toString())}/100 M.N</span>`);
                    }
                    else {
                        currentPageHtml = currentPageHtml
                            .replace("__CadenaOriginalComprobante__", "")
                            .replace("__QRCodeSellosComprobante__", "")
                            .replace("__CFDIRelacionadosComprobante__", "")
                            .replace("__FormaPagoComprobante__", "")
                            .replace("__MetodoPagoComprobante__", "")
                            .replace("__CondicionesPagoComprobante__", "")
                            .replace("__NoCertificadoSAT__", "")
                            .replace("__FechaTimbradoComprobante__", "")
                            .replace("__FacturaGlobalComprobante__", "")
                            .replace("__TotalLetraComprobante__", "");
                    }
                    yield page.setContent(currentPageHtml);
                    // Generar el PDF de la página actual y almacenarlo en el array de buffers
                    const pdfBuffer = yield page.pdf({ format: "letter" });
                    pdfBuffers.push(pdfBuffer);
                }
                // Cerrar el navegador
                yield browser.close();
                // Unir los pdf's en uno solo
                const mergedPdf = yield pdf_lib_1.PDFDocument.create();
                for (const pdfBuffer of pdfBuffers) {
                    const pdfDoc = yield pdf_lib_1.PDFDocument.load(pdfBuffer);
                    const copiedPages = yield mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                }
                const pdf = yield mergedPdf.save();
                const pdfWithPageNumbers = yield this.addPageNumbers(mergedPdf);
                return pdfWithPageNumbers;
            }
            catch (error) {
                throw error;
            }
        });
    }
    addPageNumbers(pdfDoc) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalPages = pdfDoc.getPageCount();
            const font = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            for (let i = 0; i < totalPages; i++) {
                const page = pdfDoc.getPage(i);
                const { width, height } = page.getSize();
                const fontSize = 9;
                const text = `Página ${i + 1} de ${totalPages}`;
                const textWidth = font.widthOfTextAtSize(text, fontSize);
                page.drawText(text, {
                    x: width - textWidth - 40,
                    y: 25,
                    size: fontSize,
                    font,
                    color: (0, pdf_lib_1.rgb)(0, 0, 0),
                });
            }
            return yield pdfDoc.save();
        });
    }
    createViewCadenaOriginal(data) {
        let seccionHTML = `
        <div  style="position: relative;left: 0.5in; width: 7.42in;" >
            <div style="border: 2px solid #bdbdbd; border-radius: 10px;">
                <div style="font-size: 12px;background-color:#bdbdbd;padding:2px;">Cadena Original del Complemento de Certificación Digital del SAT</div>
                <div style="word-break: break-all;font-size:10px">${data}</div>
            </div>
        </div>
    `;
        return seccionHTML;
    }
    createViewQRCodeSellos(uuid, rfcEmisor, rfcReceptor, total, selloDEmisor, selloDSAT) {
        return __awaiter(this, void 0, void 0, function* () {
            const qrCode = yield this.createQRCode(uuid, rfcEmisor, rfcReceptor, total, selloDEmisor);
            const seccionHTML = `
        <div  style="position: relative;left: 0.5in; width: 7.42in;display:flex;margin-top:10px;items-align:center">
                <div>
                    <img src="${qrCode}" alt="QR Code" style="width:1.55in;height:1.55in">
                </div>
                <div style="margin-left:0.05in;width:5.87in;">
                    <div style="border: 2px solid #bdbdbd; border-radius: 10px;width:5.80">
                        <div style="font-size: 12px;background-color:#bdbdbd;padding:2px">Sello digital del CFDI</div>
                        <div style="word-break: break-all;font-size:10px">${selloDEmisor}</div>
                    </div>
                    <div style="border: 2px solid #bdbdbd; border-radius: 10px;width:5.80;margin-top:10px">
                        <div style="font-size: 12px;background-color:#bdbdbd;padding:2px;">Sello digital del SAT</div>
                        <div style="word-break: break-all;font-size:10px">${selloDSAT}</div>
                    </div>
                </div>
        </div>
        `;
            return seccionHTML;
        });
    }
    createQRCode(uuid, rfcEmisor, rfcReceptor, total, selloDEmisor) {
        return __awaiter(this, void 0, void 0, function* () {
            const ochoDigitos = selloDEmisor.slice(-8);
            const link = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${uuid}&re=${rfcEmisor}&rr=${rfcReceptor}&tt=${total}&fe=${ochoDigitos}`;
            const qrCode = yield qrcode_1.default.toDataURL(link);
            return qrCode;
        });
    }
    createTableCFDIIngreso(data) {
        let tableHTML = "";
        // Encabezado de la tabla
        tableHTML += `
        <div style="width: 100%;">
            <div style="background-color: #bdbdbd;  display: grid;grid-template-columns: repeat(20, minmax(0, 1fr));">
                <div style="grid-column: span 3 / span 3;font-size: 12px !important;align-items: center;text-align: center;padding-top:2px;padding-bottom:2px;">Código</div>
                <div style="grid-column: span 2 / span 2;font-size: 12px !important;align-items: center;text-align: center;padding-top:2px;padding-bottom:2px;">Clave ud.</div>
                <div style="grid-column: span 2 / span 2;font-size: 12px !important;align-items: center;text-align: center;padding-top:2px;padding-bottom:2px;">Clave Prod/Serv</div>
                <div style="grid-column: span 5 / span 5;font-size: 12px !important;align-items: center;text-align: center;padding-top:2px;padding-bottom:2px;">Descripción</div>
                <div style="grid-column: span 2 / span 2;font-size: 12px !important;align-items: center;text-align: center;padding-top:2px;padding-bottom:2px;">Cant.</div>
                <div style="grid-column: span 2 / span 2;font-size: 12px !important;align-items: center;text-align: center;padding-top:2px;padding-bottom:2px;">Precio</div>
                <div style="grid-column: span 2 / span 2;font-size: 12px !important;align-items: center;text-align: center;padding-top:2px;padding-bottom:2px;">Desc.</div>
                <div style="grid-column: span 2 / span 2;font-size: 12px !important;align-items: center;text-align: center;padding-top:2px;padding-bottom:2px;">Importe</div>
            </div>
    `;
        data.forEach((item, index) => {
            tableHTML += `
            <div id="registerID${index}" style="display: grid;grid-template-columns: repeat(20, minmax(0, 1fr));">
                <div style="grid-column: span 3 / span 3;font-size: 12px !important;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                    ${item["@attributes"].NoIdentificacion
                ? item["@attributes"].NoIdentificacion
                : ""}
                </div>
                <div style="grid-column: span 2 / span 2;font-size: 12px !important;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                    ${item["@attributes"].ClaveUnidad}
                </div>
                <div style="grid-column: span 2 / span 2;font-size: 12px !important;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                    ${item["@attributes"].ClaveProdServ}
                </div>
                <div style="grid-column: span 5 / span 5;font-size: 12px !important;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                    ${item["@attributes"].Descripcion}
                </div>
                <div style="grid-column: span 2 / span 2;font-size: 12px !important;align-items: center;padding:2px;text-align: right;white-space: nowrap;overflow:hidden;">
                    ${parseFloat(item["@attributes"].Cantidad)
                .toFixed(2)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
                <div style="grid-column: span 2 / span 2;font-size: 12px !important;align-items: center;padding:2px;text-align: right;white-space: nowrap;overflow:hidden;">
                    ${parseFloat(item["@attributes"].ValorUnitario)
                .toFixed(2)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
                <div style="grid-column: span 2 / span 2;font-size: 12px !important;align-items: center;padding:2px;text-align: right;white-space: nowrap;overflow:hidden;">
                    ${item["@attributes"].Descuento
                ? parseFloat(item["@attributes"].Descuento)
                    .toFixed(2)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                : "0.00"}
                </div>
                <div style="grid-column: span 2 / span 2;font-size: 12px !important;align-items: center;padding:2px;text-align: right;white-space: nowrap;overflow:hidden;">
                    ${parseFloat(item["@attributes"].Importe)
                .toFixed(2)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
            </div>
        `;
            if (item["cfdi:Impuestos"]) {
                if (item["cfdi:Impuestos"]["cfdi:Traslados"]) {
                    const traslados = item["cfdi:Impuestos"]["cfdi:Traslados"]["cfdi:Traslado"];
                    const trasladoArray = [].concat(traslados);
                    trasladoArray.forEach((impuesto) => {
                        tableHTML += `
                      <div style="font-size: 9px !important;align-items: center;white-space: nowrap;overflow:hidden;display: grid;grid-template-columns: repeat(16, minmax(0, 1fr));">
                      <div style="grid-column: span 1 / span 1;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                              
                          </div>
                        <div style="grid-column: span 2 / span 2;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                              Traslado
                          </div>
                          <div style="grid-column: span 2 / span 2;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                              Imp: ${impuesto["@attributes"].Impuesto}
                          </div>
                          <div style="grid-column: span 2 / span 2;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                              Base: ${parseFloat(impuesto["@attributes"].Base)
                            .toFixed(2)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          </div>
                          <div style="grid-column: span 3 / span 3;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                              Tipo Factor: ${impuesto["@attributes"].TipoFactor}
                          </div>
                          <div style="grid-column: span 3 / span 3;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                              ${impuesto["@attributes"].TipoFactor}: ${impuesto["@attributes"].TipoFactor === "Exento"
                            ? ""
                            : impuesto["@attributes"].TasaOCuota}
                                                ${impuesto["@attributes"]
                            .TipoFactor === "Tasa"
                            ? "%"
                            : "$"}
                          </div>
                          <div style="grid-column: span 3 / span 3;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                                ${impuesto["@attributes"].TipoFactor ===
                            "Exento"
                            ? ""
                            : "Importe: "}${impuesto["@attributes"].TipoFactor === "Exento"
                            ? ""
                            : parseFloat(impuesto["@attributes"].Importe)
                                .toFixed(2)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          </div>
                      </div>       
                  `;
                    });
                }
                if (item["cfdi:Impuestos"]["cfdi:Retenciones"]) {
                    const retenciones = item["cfdi:Impuestos"]["cfdi:Retenciones"]["cfdi:Retencion"];
                    const retencionesArray = [].concat(retenciones);
                    retencionesArray.forEach((retencion) => {
                        tableHTML += `
                <div style="font-size: 9px !important;align-items: center;white-space: nowrap;overflow:hidden;display: grid;grid-template-columns: repeat(16, minmax(0, 1fr));">
                    <div style="grid-column: span 1 / span 1;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;"></div>
                    <div style="grid-column: span 2 / span 2;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                        Retención
                    </div>
                    <div style="grid-column: span 2 / span 2;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                        Imp: ${retencion["@attributes"].Impuesto}
                    </div>
                    <div style="grid-column: span 2 / span 2;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                        Base: ${parseFloat(retencion["@attributes"].Base)
                            .toFixed(2)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </div>
                    <div style="grid-column: span 3 / span 3;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                              Tipo Factor: ${retencion["@attributes"].TipoFactor}
                          </div>
                          <div style="grid-column: span 3 / span 3;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                              ${retencion["@attributes"].TipoFactor}: ${retencion["@attributes"].TipoFactor === "Exento"
                            ? ""
                            : retencion["@attributes"].TasaOCuota}
                                ${retencion["@attributes"].TipoFactor === "Tasa"
                            ? "%"
                            : "$"}
                          </div>
                          <div style="grid-column: span 3 / span 3;align-items: center;padding:2px;white-space: nowrap;overflow:hidden;">
                                ${retencion["@attributes"].TipoFactor ===
                            "Exento"
                            ? ""
                            : "Importe: "}${retencion["@attributes"].TipoFactor === "Exento"
                            ? ""
                            : parseFloat(retencion["@attributes"].Importe)
                                .toFixed(2)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          </div>
                </div>
            `;
                    });
                }
            }
        });
        tableHTML += "</div>";
        return tableHTML;
    }
    setCfdiRelacionados(data) {
        let seccionHTML = "";
        data.forEach((item) => {
            const TipoRelacionText = (0, buscadorClaves_1.buscarTipoRelacion)(item["@attributes"].TipoRelacion);
            const relaciones = [].concat(item["cfdi:CfdiRelacionado"]);
            relaciones.forEach((r) => {
                seccionHTML += `<div><span>${item["@attributes"].TipoRelacion} ${TipoRelacionText === null || TipoRelacionText === void 0 ? void 0 : TipoRelacionText.descripcion} - </span><span>${r["@attributes"].UUID}</span></div>`;
            });
        });
        return seccionHTML;
    }
}
exports.default = PDF;
