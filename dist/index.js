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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _FacturaCFDI_instances, _FacturaCFDI_noCertificado, _FacturaCFDI_certificadoPem, _FacturaCFDI_llavePrivadaPem, _FacturaCFDI_emisor, _FacturaCFDI_receptor, _FacturaCFDI_isGlobal, _FacturaCFDI_relacionados, _FacturaCFDI_conceptos, _FacturaCFDI_generarCadenaOrigen, _FacturaCFDI_resolveInclusions, _CartaPorte_instances, _CartaPorte_xml, _CartaPorte_regimenesAduaneros, _CartaPorte_ubicacionOrigen, _CartaPorte_ubicacionDestino, _CartaPorte_mercancias, _CartaPorte_conceptosMercancias, _CartaPorte_esAutotransporte, _CartaPorte_autotransporte, _CartaPorte_identificacionVehicular, _CartaPorte_seguros, _CartaPorte_remolques, _CartaPorte_tipoFigura, _CartaPorte_llavePrivadaPem, _CartaPorte_generarIdCCP, _CartaPorte_resolveInclusions, _CartaPorte_generarCadenaOrigen, _ComplementoPago_instances, _ComplementoPago_xml, _ComplementoPago_pago, _ComplementoPago_llavePrivadaPem, _ComplementoPago_resolveInclusions, _ComplementoPago_generarCadenaOrigen;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplementoPago = exports.CartaPorte = exports.CatalogosSAT = exports.FacturaCFDI = void 0;
const fs_1 = __importDefault(require("fs"));
const forge = require("node-forge");
const path = require("path");
const ingreso_1 = require("./clases/ingreso");
const crypto_1 = __importDefault(require("crypto"));
const PDF_1 = __importDefault(require("./clases/PDF"));
const uuid_1 = require("uuid");
const pretty_data_1 = require("pretty-data");
const xmldom_1 = require("@xmldom/xmldom");
const pago_1 = require("./clases/pago");
const xpath = require("xpath");
const SaxonJS = require("saxon-js");
const basePath = path.resolve(__dirname, "resources", "catalogos");
class FacturaCFDI {
    constructor() {
        _FacturaCFDI_instances.add(this);
        _FacturaCFDI_noCertificado.set(this, void 0);
        _FacturaCFDI_certificadoPem.set(this, void 0);
        _FacturaCFDI_llavePrivadaPem.set(this, void 0);
        _FacturaCFDI_emisor.set(this, void 0);
        _FacturaCFDI_receptor.set(this, void 0);
        _FacturaCFDI_isGlobal.set(this, void 0);
        _FacturaCFDI_relacionados.set(this, void 0);
        _FacturaCFDI_conceptos.set(this, void 0);
        __classPrivateFieldSet(this, _FacturaCFDI_noCertificado, "", "f");
        __classPrivateFieldSet(this, _FacturaCFDI_certificadoPem, "", "f");
        __classPrivateFieldSet(this, _FacturaCFDI_llavePrivadaPem, "", "f");
        __classPrivateFieldSet(this, _FacturaCFDI_emisor, { Rfc: "", Nombre: "", RegimenFiscal: "" }, "f");
        __classPrivateFieldSet(this, _FacturaCFDI_receptor, {
            Rfc: "",
            Nombre: "",
            RegimenFiscal: "",
            DomicilioFiscalReceptor: "",
            RegimenFiscalReceptor: "",
            UsoCFDI: "",
        }, "f");
        __classPrivateFieldSet(this, _FacturaCFDI_isGlobal, {
            periocidad: "",
            meses: "",
            anio: "",
        }, "f");
        __classPrivateFieldSet(this, _FacturaCFDI_relacionados, {
            TipoRelacion: "",
            doctoRelacionados: [],
        }, "f");
        __classPrivateFieldSet(this, _FacturaCFDI_conceptos, [
            {
                ClaveProdServ: "",
                Cantidad: 0,
                ClaveUnidad: "",
                Unidad: "",
                Descripcion: "",
                ValorUnitario: 0,
                Importe: 0,
                ObjetoImp: "02",
                Descuento: null,
                Impuesto: { Impuesto: "", TipoFactor: "", TasaOCuota: 0 },
                NoIdentificacion: "",
            },
        ], "f");
    }
    certificado(cerStream) {
        try {
            // Convertir el certificado DER a formato PEM
            const certAsn1 = forge.asn1.fromDer(cerStream.toString("binary"));
            const cert = forge.pki.certificateFromAsn1(certAsn1);
            // Obtener el numero de serie del certificado
            __classPrivateFieldSet(this, _FacturaCFDI_noCertificado, cert.serialNumber
                .match(/.{1,2}/g)
                .map(function (v) {
                return String.fromCharCode(parseInt(v, 16));
            })
                .join(""), "f");
            const pem = forge.pki.certificateToPem(cert);
            __classPrivateFieldSet(this, _FacturaCFDI_certificadoPem, pem, "f");
        }
        catch (error) {
            throw error;
        }
    }
    esGlobal(periocidad, meses, anio) {
        __classPrivateFieldGet(this, _FacturaCFDI_isGlobal, "f").periocidad = periocidad;
        __classPrivateFieldGet(this, _FacturaCFDI_isGlobal, "f").meses = meses;
        __classPrivateFieldGet(this, _FacturaCFDI_isGlobal, "f").anio = anio;
    }
    crearRelacionados(tipoRelacion, doctosRelacionados) {
        __classPrivateFieldGet(this, _FacturaCFDI_relacionados, "f").TipoRelacion = tipoRelacion;
        __classPrivateFieldGet(this, _FacturaCFDI_relacionados, "f").doctoRelacionados = doctosRelacionados;
    }
    crearSello(keyStream, password) {
        // Convertir la llave privada DER a PEM
        try {
            const pem = crypto_1.default.createPrivateKey({
                key: keyStream,
                format: "der",
                type: "pkcs8",
                passphrase: password,
            });
            const pemString = pem.export({ format: "pem", type: "pkcs8" });
            __classPrivateFieldSet(this, _FacturaCFDI_llavePrivadaPem, pemString, "f");
        }
        catch (error) {
            throw error;
        }
    }
    crearEmisor(rfc, nombre, regimenFiscal) {
        __classPrivateFieldGet(this, _FacturaCFDI_emisor, "f").Rfc = rfc;
        __classPrivateFieldGet(this, _FacturaCFDI_emisor, "f").Nombre = nombre;
        __classPrivateFieldGet(this, _FacturaCFDI_emisor, "f").RegimenFiscal = regimenFiscal;
    }
    crearReceptor(rfc, nombre, regimenFiscal, codigoPostal, usoCfdi) {
        __classPrivateFieldGet(this, _FacturaCFDI_receptor, "f").Rfc = rfc;
        __classPrivateFieldGet(this, _FacturaCFDI_receptor, "f").Nombre = nombre;
        __classPrivateFieldGet(this, _FacturaCFDI_receptor, "f").DomicilioFiscalReceptor = codigoPostal;
        __classPrivateFieldGet(this, _FacturaCFDI_receptor, "f").RegimenFiscalReceptor = regimenFiscal;
        __classPrivateFieldGet(this, _FacturaCFDI_receptor, "f").UsoCFDI = usoCfdi;
    }
    crearConceptos(conceptos) {
        __classPrivateFieldSet(this, _FacturaCFDI_conceptos, conceptos, "f");
    }
    generarXml(atributos) {
        const certificado = __classPrivateFieldGet(this, _FacturaCFDI_certificadoPem, "f")
            .replace("-----BEGIN CERTIFICATE-----", "")
            .replace("-----END CERTIFICATE-----", "")
            .replace(/(\r\n|\n|\r)/gm, "");
        const xml = new ingreso_1.CFDIIngreso(atributos, Object.assign({}, __classPrivateFieldGet(this, _FacturaCFDI_emisor, "f")), Object.assign({}, __classPrivateFieldGet(this, _FacturaCFDI_receptor, "f")), Object.assign({}, __classPrivateFieldGet(this, _FacturaCFDI_isGlobal, "f")), certificado, __classPrivateFieldGet(this, _FacturaCFDI_noCertificado, "f"), __classPrivateFieldGet(this, _FacturaCFDI_conceptos, "f"), __classPrivateFieldGet(this, _FacturaCFDI_relacionados, "f"));
        return xml.crearXMl();
    }
    generarXmlSellado(atributos) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (__classPrivateFieldGet(this, _FacturaCFDI_llavePrivadaPem, "f") !== "") {
                    const certificado = __classPrivateFieldGet(this, _FacturaCFDI_certificadoPem, "f")
                        .replace("-----BEGIN CERTIFICATE-----", "")
                        .replace("-----END CERTIFICATE-----", "")
                        .replace(/(\r\n|\n|\r)/gm, "");
                    const xml = new ingreso_1.CFDIIngreso(atributos, Object.assign({}, __classPrivateFieldGet(this, _FacturaCFDI_emisor, "f")), Object.assign({}, __classPrivateFieldGet(this, _FacturaCFDI_receptor, "f")), Object.assign({}, __classPrivateFieldGet(this, _FacturaCFDI_isGlobal, "f")), certificado, __classPrivateFieldGet(this, _FacturaCFDI_noCertificado, "f"), __classPrivateFieldGet(this, _FacturaCFDI_conceptos, "f"), __classPrivateFieldGet(this, _FacturaCFDI_relacionados, "f"));
                    const xmlSinSellar = xml.crearXMl();
                    let xmlSellado = xmlSinSellar;
                    if (__classPrivateFieldGet(this, _FacturaCFDI_llavePrivadaPem, "f") !== "") {
                        const selloCadenaOriginal = yield __classPrivateFieldGet(this, _FacturaCFDI_instances, "m", _FacturaCFDI_generarCadenaOrigen).call(this, xmlSinSellar);
                        const parser = new xmldom_1.DOMParser();
                        const xmlDoc = parser.parseFromString(xmlSinSellar, "application/xml");
                        // Encontrar el elemento cfdi:Comprobante y agregar el atributo sello
                        const comprobanteElement = xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];
                        if (comprobanteElement) {
                            comprobanteElement.setAttribute("Sello", selloCadenaOriginal);
                        }
                        const serializer = new xmldom_1.XMLSerializer();
                        xmlSellado = serializer.serializeToString(xmlDoc);
                    }
                    return xmlSellado;
                }
                else {
                    throw new Error("La llave privada no ha sido proporcionada.");
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    generarPDF(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pdf = new PDF_1.default(params);
                const file = yield pdf.createIngresoPDF();
                return file;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.FacturaCFDI = FacturaCFDI;
_FacturaCFDI_noCertificado = new WeakMap(), _FacturaCFDI_certificadoPem = new WeakMap(), _FacturaCFDI_llavePrivadaPem = new WeakMap(), _FacturaCFDI_emisor = new WeakMap(), _FacturaCFDI_receptor = new WeakMap(), _FacturaCFDI_isGlobal = new WeakMap(), _FacturaCFDI_relacionados = new WeakMap(), _FacturaCFDI_conceptos = new WeakMap(), _FacturaCFDI_instances = new WeakSet(), _FacturaCFDI_generarCadenaOrigen = function _FacturaCFDI_generarCadenaOrigen(xml) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cadenaOriginalXslt = __classPrivateFieldGet(this, _FacturaCFDI_instances, "m", _FacturaCFDI_resolveInclusions).call(this);
            let result = SaxonJS.XPath.evaluate(`transform(
        map {
          'source-node' : parse-xml-fragment($xml),
          'stylesheet-text' : $xslt,
          'delivery-format' : 'serialized'
          }
      )?output`, [], {
                params: {
                    xml: xml,
                    xslt: cadenaOriginalXslt,
                },
            });
            const sign = crypto_1.default.createSign("SHA256");
            sign.update(result);
            sign.end();
            const signature = sign.sign(__classPrivateFieldGet(this, _FacturaCFDI_llavePrivadaPem, "f"), "base64");
            return signature;
        }
        catch (error) {
            throw error;
        }
    });
}, _FacturaCFDI_resolveInclusions = function _FacturaCFDI_resolveInclusions() {
    const basePath = path.resolve(__dirname, "resources", "xslt");
    const xsltFile = path.resolve(basePath, "./cadenaoriginal_4_0.xslt");
    const xsltContent = fs_1.default.readFileSync(xsltFile, "utf8");
    const doc = new xmldom_1.DOMParser().parseFromString(xsltContent, "text/xml");
    const selectNameSpace = xpath.useNamespaces({
        xsl: "http://www.w3.org/1999/XSL/Transform",
        cfdi: "http://www.sat.gob.mx/cfd/4",
        xs: "http://www.w3.org/2001/XMLSchema",
        fn: "http://www.w3.org/2005/xpath-functions",
        cce11: "http://www.sat.gob.mx/ComercioExterior11",
        donat: "http://www.sat.gob.mx/donat",
        divisas: "http://www.sat.gob.mx/divisas",
        implocal: "http://www.sat.gob.mx/implocal",
        leyendasFisc: "http://www.sat.gob.mx/leyendasFiscales",
        pfic: "http://www.sat.gob.mx/pfic",
        tpe: "http://www.sat.gob.mx/TuristaPasajeroExtranjero",
        nomina12: "http://www.sat.gob.mx/nomina12",
        registrofiscal: "http://www.sat.gob.mx/registrofiscal",
        pagoenespecie: "http://www.sat.gob.mx/pagoenespecie",
        aerolineas: "http://www.sat.gob.mx/aerolineas",
        valesdedespensa: "http://www.sat.gob.mx/valesdedespensa",
        consumodecombustibles: "http://www.sat.gob.mx/consumodecombustibles",
        notariospublicos: "http://www.sat.gob.mx/notariospublicos",
        vehiculousado: "http://www.sat.gob.mx/vehiculousado",
        servicioparcial: "http://www.sat.gob.mx/servicioparcialconstruccion",
        decreto: "http://www.sat.gob.mx/renovacionysustitucionvehiculos",
        destruccion: "http://www.sat.gob.mx/certificadodestruccion",
        obrasarte: "http://www.sat.gob.mx/arteantiguedades",
        ine: "http://www.sat.gob.mx/ine",
        iedu: "http://www.sat.gob.mx/iedu",
        ventavehiculos: "http://www.sat.gob.mx/ventavehiculos",
        terceros: "http://www.sat.gob.mx/terceros",
        pago20: "http://www.sat.gob.mx/Pagos",
        detallista: "http://www.sat.gob.mx/detallista",
        ecc12: "http://www.sat.gob.mx/EstadoDeCuentaCombustible12",
        consumodecombustibles11: "http://www.sat.gob.mx/ConsumoDeCombustibles11",
        gceh: "http://www.sat.gob.mx/GastosHidrocarburos10",
        ieeh: "http://www.sat.gob.mx/IngresosHidrocarburos10",
        cartaporte20: "http://www.sat.gob.mx/CartaPorte20",
        cartaporte30: "http://www.sat.gob.mx/CartaPorte30",
        cartaporte31: "http://www.sat.gob.mx/CartaPorte31",
    });
    const includeNodes = selectNameSpace("//xsl:include", doc);
    includeNodes.forEach((node) => {
        const href = node.getAttribute("href");
        if (href) {
            const includePath = path.resolve(basePath, href);
            const includeContent = fs_1.default.readFileSync(includePath, "utf8");
            const includeDoc = new xmldom_1.DOMParser().parseFromString(includeContent, "application/xml");
            // Clonar y añadir los hijos del includeDoc en lugar de reemplazar el nodo
            while (includeDoc.documentElement.childNodes.length > 0) {
                const importedNode = includeDoc.documentElement.childNodes[0];
                node.parentNode.insertBefore(importedNode, node);
            }
            // Eliminar el nodo de inclusión original
            node.parentNode.removeChild(node);
        }
    });
    const result = new xmldom_1.XMLSerializer().serializeToString(doc);
    return result;
};
class CatalogosSAT {
    constructor() { }
    obtenerCatalogo(nombreCatalogo) {
        try {
            const snake_case = nombreCatalogo
                .replace(/([A-Z])/g, "_$1")
                .toLowerCase()
                .replace(/^_/, "");
            const json_file = path.join(basePath, `cat_${snake_case}.json`);
            if (fs_1.default.existsSync(json_file)) {
                const data = fs_1.default.readFileSync(json_file, "utf8");
                return {
                    status: true,
                    data: JSON.parse(data),
                };
            }
            else {
                return {
                    status: false,
                    data: null,
                    message: `El catálogo "${nombreCatalogo}" no existe.`,
                };
            }
        }
        catch (error) {
            throw new Error(`Error al importar el catalogo "${nombreCatalogo}"`);
        }
    }
    buscarEnCatalogo(valor, clave, nombreCatalogo) {
        try {
            const catalogo = this.obtenerCatalogo(nombreCatalogo);
            if (catalogo.status) {
                const filter = catalogo.data.filter((item) => item[clave] === valor);
                if (filter.length > 0) {
                    return {
                        status: true,
                        data: filter,
                    };
                }
                else {
                    return {
                        status: false,
                        data: null,
                        message: `Clave "${valor}" no encontrada en el catálogo "${nombreCatalogo}"`,
                    };
                }
            }
            else {
                return {
                    status: false,
                    message: `El catálogo "${nombreCatalogo}" no existe.`,
                };
            }
        }
        catch (error) {
            return {
                status: false,
                message: `Error al buscar en el catálogo.`,
            };
        }
    }
}
exports.CatalogosSAT = CatalogosSAT;
class CartaPorte {
    constructor(xml) {
        _CartaPorte_instances.add(this);
        _CartaPorte_xml.set(this, void 0);
        _CartaPorte_regimenesAduaneros.set(this, void 0);
        _CartaPorte_ubicacionOrigen.set(this, void 0);
        _CartaPorte_ubicacionDestino.set(this, void 0);
        _CartaPorte_mercancias.set(this, void 0);
        _CartaPorte_conceptosMercancias.set(this, void 0);
        _CartaPorte_esAutotransporte.set(this, void 0);
        _CartaPorte_autotransporte.set(this, void 0);
        _CartaPorte_identificacionVehicular.set(this, void 0);
        _CartaPorte_seguros.set(this, void 0);
        _CartaPorte_remolques.set(this, void 0);
        _CartaPorte_tipoFigura.set(this, void 0);
        _CartaPorte_llavePrivadaPem.set(this, void 0);
        __classPrivateFieldSet(this, _CartaPorte_xml, xml, "f");
        __classPrivateFieldSet(this, _CartaPorte_llavePrivadaPem, "", "f");
        __classPrivateFieldSet(this, _CartaPorte_regimenesAduaneros, [], "f");
        __classPrivateFieldSet(this, _CartaPorte_ubicacionOrigen, [], "f");
        __classPrivateFieldSet(this, _CartaPorte_ubicacionDestino, [], "f");
        __classPrivateFieldSet(this, _CartaPorte_mercancias, {
            PesoBrutoTotal: "",
            UnidadPeso: "",
            NumTotalMercancias: "",
        }, "f");
        __classPrivateFieldSet(this, _CartaPorte_conceptosMercancias, [], "f");
        __classPrivateFieldSet(this, _CartaPorte_esAutotransporte, false, "f");
        __classPrivateFieldSet(this, _CartaPorte_autotransporte, {
            PermSCT: "",
            NumPermisoSCT: "",
        }, "f");
        __classPrivateFieldSet(this, _CartaPorte_identificacionVehicular, {
            ConfigVehicular: "",
            PesoBrutoVehicular: "",
            PlacaVM: "",
            AnioModeloVM: "",
        }, "f");
        __classPrivateFieldSet(this, _CartaPorte_seguros, [], "f");
        __classPrivateFieldSet(this, _CartaPorte_remolques, [], "f");
        __classPrivateFieldSet(this, _CartaPorte_tipoFigura, [], "f");
    }
    crearRegimenesAduaneros(array) {
        __classPrivateFieldSet(this, _CartaPorte_regimenesAduaneros, array, "f");
    }
    crearUbicacionOrigen(data) {
        __classPrivateFieldGet(this, _CartaPorte_ubicacionOrigen, "f").push(Object.assign({}, data));
    }
    crearUbicacionDestino(data) {
        __classPrivateFieldGet(this, _CartaPorte_ubicacionDestino, "f").push(Object.assign({}, data));
    }
    crearMercancias(data) {
        __classPrivateFieldSet(this, _CartaPorte_mercancias, data, "f");
    }
    crearMercancia(data) {
        __classPrivateFieldGet(this, _CartaPorte_conceptosMercancias, "f").push({ mercancia: data });
        return this;
    }
    crearDocumentacionAduanera(data) {
        const lastIndex = __classPrivateFieldGet(this, _CartaPorte_conceptosMercancias, "f").length - 1;
        if (lastIndex >= 0) {
            const lastItem = __classPrivateFieldGet(this, _CartaPorte_conceptosMercancias, "f")[lastIndex];
            lastItem.documentacionAduanera = data;
        }
        return this;
    }
    crearCantidadTransporta(data) {
        var _a;
        const lastIndex = __classPrivateFieldGet(this, _CartaPorte_conceptosMercancias, "f").length - 1;
        if (lastIndex >= 0) {
            const lastItem = __classPrivateFieldGet(this, _CartaPorte_conceptosMercancias, "f")[lastIndex];
            if (!("cantidadTransporta" in lastItem)) {
                lastItem.cantidadTransporta = [];
            }
            (_a = lastItem.cantidadTransporta) === null || _a === void 0 ? void 0 : _a.push(Object.assign({}, data));
        }
    }
    // METODOS PARA AUTOTRANSPORTE
    crearAutotransporte(data) {
        __classPrivateFieldSet(this, _CartaPorte_autotransporte, data, "f");
        __classPrivateFieldSet(this, _CartaPorte_esAutotransporte, true, "f");
        return this;
    }
    crearIdentificacionVehicular(data) {
        __classPrivateFieldSet(this, _CartaPorte_identificacionVehicular, data, "f");
        return this;
    }
    crearSeguros(data) {
        __classPrivateFieldGet(this, _CartaPorte_seguros, "f").push(Object.assign({}, data));
        return this;
    }
    crearRemolques(data) {
        __classPrivateFieldGet(this, _CartaPorte_remolques, "f").push(Object.assign({}, data));
        return this;
    }
    crearTipoFigura(data) {
        __classPrivateFieldGet(this, _CartaPorte_tipoFigura, "f").push(Object.assign({}, data));
        return this;
    }
    crearPartesTransporte(data) {
        var _a;
        const lastIndex = __classPrivateFieldGet(this, _CartaPorte_tipoFigura, "f").length - 1;
        if (lastIndex >= 0) {
            const lastItem = __classPrivateFieldGet(this, _CartaPorte_tipoFigura, "f")[lastIndex];
            if (!("PartesTransporte" in lastItem)) {
                lastItem.PartesTransporte = [];
            }
            (_a = lastItem.PartesTransporte) === null || _a === void 0 ? void 0 : _a.push(Object.assign({}, data));
        }
        return this;
    }
    crearDomicilioTipoFigura(data) {
        const lastIndex = __classPrivateFieldGet(this, _CartaPorte_tipoFigura, "f").length - 1;
        if (lastIndex >= 0) {
            const lastItem = __classPrivateFieldGet(this, _CartaPorte_tipoFigura, "f")[lastIndex];
            lastItem.Domicilio = data;
        }
        return this;
    }
    crearSello(keyStream, password) {
        try {
            const pem = crypto_1.default.createPrivateKey({
                key: keyStream,
                format: "der",
                type: "pkcs8",
                passphrase: password,
            });
            const pemString = pem.export({ format: "pem", type: "pkcs8" });
            __classPrivateFieldSet(this, _CartaPorte_llavePrivadaPem, pemString, "f");
        }
        catch (error) {
            throw error;
        }
    }
    generarCartaPorte(atributos) {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _CartaPorte_xml, "f")) {
                const parser = new xmldom_1.DOMParser();
                const xmlDoc = parser.parseFromString(__classPrivateFieldGet(this, _CartaPorte_xml, "f"), "application/xml");
                const xmlTimbrado = xmlDoc.getElementsByTagName("tfd:TimbreFiscalDigital");
                if (xmlTimbrado.length === 0) {
                    const node_base = xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];
                    node_base.setAttribute("xmlns:cartaporte31", "http://www.sat.gob.mx/CartaPorte31");
                    node_base.setAttribute("xsi:schemaLocation", "http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/CartaPorte31 http://www.sat.gob.mx/sitio_internet/cfd/CartaPorte/CartaPorte31.xsd");
                    const complementoNode = node_base.appendChild(xmlDoc.createElement("cfdi:Complemento"));
                    const cp_node = complementoNode.appendChild(xmlDoc.createElement("cartaporte31:CartaPorte"));
                    cp_node.setAttribute("Version", "3.1");
                    cp_node.setAttribute("IdCCP", __classPrivateFieldGet(this, _CartaPorte_instances, "m", _CartaPorte_generarIdCCP).call(this));
                    // AGREGAR ATRIBUTOS AL NODO CartaPorte
                    // Verificar si existe EntradaSalidaMerc en el parámetro atributos
                    if (atributos.EntradaSalidaMerc && atributos.EntradaSalidaMerc !== "")
                        cp_node.setAttribute("EntradaSalidaMerc", atributos.EntradaSalidaMerc);
                    // Verificar si existe TranspInternac en el parámetro atributos
                    if ("TranspInternac" in atributos &&
                        typeof atributos.TranspInternac === "boolean") {
                        cp_node.setAttribute("TranspInternac", atributos.TranspInternac ? "Sí" : "No");
                        if (atributos.TranspInternac) {
                            const regimenesAduaneros_node = cp_node.appendChild(xmlDoc.createElement("cartaporte31:RegimenesAduaneros"));
                            __classPrivateFieldGet(this, _CartaPorte_regimenesAduaneros, "f").forEach((item) => {
                                if (item !== "") {
                                    const regimenAduaneroCCP = regimenesAduaneros_node.appendChild(xmlDoc.createElement("cartaporte31:RegimenAduaneroCCP"));
                                    regimenAduaneroCCP.setAttribute("RegimenAduanero", item);
                                }
                            });
                        }
                    }
                    // Verificar si existe PaisOrigenDestino en el parámetro atributos
                    if (atributos.PaisOrigenDestino &&
                        atributos.PaisOrigenDestino.trim() !== "")
                        cp_node.setAttribute("PaisOrigenDestino", atributos.PaisOrigenDestino);
                    // Verificar si existe ViaEntradaSalida en el parámetro atributos
                    if (atributos.ViaEntradaSalida && atributos.ViaEntradaSalida !== "")
                        cp_node.setAttribute("ViaEntradaSalida", atributos.ViaEntradaSalida.toString());
                    // Verificar si existe TotalDistRec en el parámetro atributos
                    if (atributos.TotalDistRec && atributos.TotalDistRec !== "")
                        cp_node.setAttribute("TotalDistRec", atributos.TotalDistRec.toString());
                    // En caso de aplicar Istmo
                    if ("RegistroISTMO" in atributos &&
                        typeof atributos.RegistroISTMO === "boolean") {
                        cp_node.setAttribute("RegistroISTMO", atributos.RegistroISTMO ? "Sí" : "No");
                        if (atributos.RegistroISTMO) {
                            // Verificar si existe UbicacionPoloOrigen en el parámetro atributos
                            if (atributos.UbicacionPoloOrigen &&
                                atributos.UbicacionPoloOrigen !== "")
                                cp_node.setAttribute("UbicacionPoloOrigen", atributos.UbicacionPoloOrigen.toString());
                            // Verificar si existe UbicacionPoloDestino en el parámetro atributos
                            if (atributos.UbicacionPoloDestino &&
                                atributos.UbicacionPoloDestino !== "")
                                cp_node.setAttribute("UbicacionPoloDestino", atributos.UbicacionPoloDestino.toString());
                        }
                    }
                    const ubicaciones_node = cp_node.appendChild(xmlDoc.createElement("cartaporte31:Ubicaciones"));
                    const keyAddress = [
                        "Calle",
                        "NumeroExterior",
                        "NumeroInterior",
                        "Colonia",
                        "Localidad",
                        "Referencia",
                        "Municipio",
                        "Estado",
                        "Pais",
                        "CodigoPostal",
                    ];
                    // UBICACION ORIGEN
                    const ubicacion_origen_node = ubicaciones_node.appendChild(xmlDoc.createElement("Ubicacion"));
                    ubicacion_origen_node.setAttribute("TipoUbicacion", "Origen");
                    const domicilio_origen_node = ubicacion_origen_node.appendChild(xmlDoc.createElement("Domicilio"));
                    __classPrivateFieldGet(this, _CartaPorte_ubicacionOrigen, "f").forEach((item) => {
                        Object.keys(item).forEach((key) => {
                            const typedKey = key;
                            const value = item[typedKey];
                            if (value !== undefined) {
                                if (!keyAddress.includes(typedKey)) {
                                    ubicacion_origen_node.setAttribute(key, value.toString());
                                }
                                else {
                                    domicilio_origen_node.setAttribute(key, value.toString());
                                }
                            }
                        });
                    });
                    // UBICACION DESTINO
                    const ubicacion_destino_node = ubicaciones_node.appendChild(xmlDoc.createElement("cartaporte31:Ubicacion"));
                    ubicacion_destino_node.setAttribute("TipoUbicacion", "Destino");
                    const domicilio_destino_node = ubicacion_destino_node.appendChild(xmlDoc.createElement("cartaporte31:Domicilio"));
                    __classPrivateFieldGet(this, _CartaPorte_ubicacionDestino, "f").forEach((item) => {
                        Object.keys(item).forEach((key) => {
                            const typedKey = key;
                            const value = item[typedKey];
                            if (value !== undefined) {
                                if (!keyAddress.includes(typedKey)) {
                                    ubicacion_destino_node.setAttribute(key, value.toString());
                                }
                                else {
                                    domicilio_destino_node.setAttribute(key, value.toString());
                                }
                            }
                        });
                    });
                    const mercancias_node = cp_node.appendChild(xmlDoc.createElement("cartaporte31:Mercancias"));
                    Object.keys(__classPrivateFieldGet(this, _CartaPorte_mercancias, "f")).forEach((key) => {
                        const typedKey = key;
                        const value = __classPrivateFieldGet(this, _CartaPorte_mercancias, "f")[typedKey];
                        if (value !== undefined) {
                            if (key == "LogisticaInversaRecoleccionDevolucion") {
                                mercancias_node.setAttribute(key, value === true ? "Sí" : "No");
                            }
                            else {
                                mercancias_node.setAttribute(key, value.toString());
                            }
                        }
                    });
                    __classPrivateFieldGet(this, _CartaPorte_conceptosMercancias, "f").forEach((item) => {
                        var _a;
                        const mercancia_node = mercancias_node.appendChild(xmlDoc.createElement("cartaporte31:Mercancia"));
                        Object.keys(item.mercancia).forEach((key) => {
                            const typedKey = key;
                            const value = item.mercancia[typedKey];
                            if (value !== undefined) {
                                mercancia_node.setAttribute(key, value.toString());
                            }
                        });
                        if ("documentacionAduanera" in item) {
                            const docAduanera_node = mercancia_node.appendChild(xmlDoc.createElement("cartaporte31:DocumentacionAduanera"));
                            Object.keys(item.documentacionAduanera).forEach((key) => {
                                const typedKey = key;
                                const value = item.documentacionAduanera[typedKey];
                                if (value !== undefined) {
                                    docAduanera_node.setAttribute(key, value.toString());
                                }
                            });
                        }
                        if ("cantidadTransporta" in item) {
                            (_a = item.cantidadTransporta) === null || _a === void 0 ? void 0 : _a.forEach((canTranporta) => {
                                const cantTransporta_node = mercancia_node.appendChild(xmlDoc.createElement("cartaporte31:CantidadTransporta"));
                                Object.keys(canTranporta).forEach((key) => {
                                    const typedKey = key;
                                    const value = canTranporta[typedKey];
                                    if (value !== undefined) {
                                        cantTransporta_node.setAttribute(key, value.toString());
                                    }
                                });
                            });
                        }
                    });
                    // CONDICIONES PARA COLOCAR SOLO LOS ELEMENTOS NECESARIOS PARA CADA TIPO DE TRANSPORTE
                    if (__classPrivateFieldGet(this, _CartaPorte_esAutotransporte, "f")) {
                        const autotransporte_node = mercancias_node.appendChild(xmlDoc.createElement("cartaporte31:Autotransporte"));
                        Object.keys(__classPrivateFieldGet(this, _CartaPorte_autotransporte, "f")).forEach((key) => {
                            const typedKey = key;
                            const value = __classPrivateFieldGet(this, _CartaPorte_autotransporte, "f")[typedKey];
                            if (value !== undefined) {
                                autotransporte_node.setAttribute(key, value.toString());
                            }
                        });
                        const inden_vehicular_node = autotransporte_node.appendChild(xmlDoc.createElement("cartaporte31:IdentificacionVehicular"));
                        Object.keys(__classPrivateFieldGet(this, _CartaPorte_identificacionVehicular, "f")).forEach((key) => {
                            const typedKey = key;
                            const value = __classPrivateFieldGet(this, _CartaPorte_identificacionVehicular, "f")[typedKey];
                            if (value !== undefined) {
                                inden_vehicular_node.setAttribute(key, value.toString());
                            }
                        });
                        __classPrivateFieldGet(this, _CartaPorte_seguros, "f").forEach((item) => {
                            const seguro_node = autotransporte_node.appendChild(xmlDoc.createElement("cartaporte31:Seguros"));
                            Object.keys(item).forEach((key) => {
                                const typedKey = key;
                                const value = item[typedKey];
                                if (value !== undefined) {
                                    seguro_node.setAttribute(key, value.toString());
                                }
                            });
                        });
                        const remolques_node = autotransporte_node.appendChild(xmlDoc.createElement("cartaporte31:Remolques"));
                        __classPrivateFieldGet(this, _CartaPorte_remolques, "f").forEach((item) => {
                            const remolque_node = remolques_node.appendChild(xmlDoc.createElement("cartaporte31:Remolque"));
                            Object.keys(item).forEach((key) => {
                                const typedKey = key;
                                const value = item[typedKey];
                                if (value !== undefined) {
                                    remolque_node.setAttribute(key, value.toString());
                                }
                            });
                        });
                    }
                    const figTransporte_node = cp_node.appendChild(xmlDoc.createElement("cartaporte31:FiguraTransporte"));
                    __classPrivateFieldGet(this, _CartaPorte_tipoFigura, "f").forEach((item) => {
                        var _a;
                        const tipoFigura_node = figTransporte_node.appendChild(xmlDoc.createElement("cartaporte31:TiposFigura"));
                        Object.keys(item).forEach((key) => {
                            const typedKey = key;
                            const value = item[typedKey];
                            if (value !== undefined) {
                                if (key !== "Domicilio" && key !== "PartesTransporte") {
                                    tipoFigura_node.setAttribute(key, value.toString());
                                }
                            }
                        });
                        (_a = item.PartesTransporte) === null || _a === void 0 ? void 0 : _a.forEach((pt) => {
                            const partesTransporte_node = tipoFigura_node.appendChild(xmlDoc.createElement("cartaporte31:PartesTransporte"));
                            partesTransporte_node.setAttribute("ParteTransporte", pt.ParteTransporte);
                        });
                        if (item.Domicilio) {
                            const domTipoFigura = tipoFigura_node.appendChild(xmlDoc.createElement("cartaporte31:Domicilio"));
                            Object.keys(item.Domicilio).forEach((key) => {
                                const typedKey = key;
                                const value = item.Domicilio[typedKey];
                                if (value !== undefined) {
                                    domTipoFigura.setAttribute(key, value.toString());
                                }
                            });
                        }
                    });
                    const serializer = new xmldom_1.XMLSerializer();
                    const xmlCartaPorte = pretty_data_1.pd.xml(serializer.serializeToString(xmlDoc));
                    const selloCadenaOriginal = yield __classPrivateFieldGet(this, _CartaPorte_instances, "m", _CartaPorte_generarCadenaOrigen).call(this, xmlCartaPorte);
                    // Encontrar el elemento cfdi:Comprobante y agregar el atributo sello
                    const comprobanteElement = xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];
                    if (comprobanteElement) {
                        comprobanteElement.setAttribute("Sello", selloCadenaOriginal);
                    }
                    return serializer.serializeToString(xmlDoc);
                }
                else {
                    return {
                        status: false,
                        data: null,
                        message: "Este XML ya ha sido timbrado.",
                    };
                }
            }
            else {
                return {
                    status: false,
                    data: null,
                    message: "No ha proporcionado el XML",
                };
            }
        });
    }
}
exports.CartaPorte = CartaPorte;
_CartaPorte_xml = new WeakMap(), _CartaPorte_regimenesAduaneros = new WeakMap(), _CartaPorte_ubicacionOrigen = new WeakMap(), _CartaPorte_ubicacionDestino = new WeakMap(), _CartaPorte_mercancias = new WeakMap(), _CartaPorte_conceptosMercancias = new WeakMap(), _CartaPorte_esAutotransporte = new WeakMap(), _CartaPorte_autotransporte = new WeakMap(), _CartaPorte_identificacionVehicular = new WeakMap(), _CartaPorte_seguros = new WeakMap(), _CartaPorte_remolques = new WeakMap(), _CartaPorte_tipoFigura = new WeakMap(), _CartaPorte_llavePrivadaPem = new WeakMap(), _CartaPorte_instances = new WeakSet(), _CartaPorte_generarIdCCP = function _CartaPorte_generarIdCCP() {
    const id = (0, uuid_1.v4)();
    return `CCC${id.slice(3)}`;
}, _CartaPorte_resolveInclusions = function _CartaPorte_resolveInclusions() {
    const basePath = path.resolve(__dirname, "resources", "xslt");
    const xsltFile = path.resolve(basePath, "./cadenaoriginal_4_0.xslt");
    const xsltContent = fs_1.default.readFileSync(xsltFile, "utf8");
    const doc = new xmldom_1.DOMParser().parseFromString(xsltContent, "text/xml");
    const selectNameSpace = xpath.useNamespaces({
        xsl: "http://www.w3.org/1999/XSL/Transform",
        cfdi: "http://www.sat.gob.mx/cfd/4",
        xs: "http://www.w3.org/2001/XMLSchema",
        fn: "http://www.w3.org/2005/xpath-functions",
        cce11: "http://www.sat.gob.mx/ComercioExterior11",
        donat: "http://www.sat.gob.mx/donat",
        divisas: "http://www.sat.gob.mx/divisas",
        implocal: "http://www.sat.gob.mx/implocal",
        leyendasFisc: "http://www.sat.gob.mx/leyendasFiscales",
        pfic: "http://www.sat.gob.mx/pfic",
        tpe: "http://www.sat.gob.mx/TuristaPasajeroExtranjero",
        nomina12: "http://www.sat.gob.mx/nomina12",
        registrofiscal: "http://www.sat.gob.mx/registrofiscal",
        pagoenespecie: "http://www.sat.gob.mx/pagoenespecie",
        aerolineas: "http://www.sat.gob.mx/aerolineas",
        valesdedespensa: "http://www.sat.gob.mx/valesdedespensa",
        consumodecombustibles: "http://www.sat.gob.mx/consumodecombustibles",
        notariospublicos: "http://www.sat.gob.mx/notariospublicos",
        vehiculousado: "http://www.sat.gob.mx/vehiculousado",
        servicioparcial: "http://www.sat.gob.mx/servicioparcialconstruccion",
        decreto: "http://www.sat.gob.mx/renovacionysustitucionvehiculos",
        destruccion: "http://www.sat.gob.mx/certificadodestruccion",
        obrasarte: "http://www.sat.gob.mx/arteantiguedades",
        ine: "http://www.sat.gob.mx/ine",
        iedu: "http://www.sat.gob.mx/iedu",
        ventavehiculos: "http://www.sat.gob.mx/ventavehiculos",
        terceros: "http://www.sat.gob.mx/terceros",
        pago20: "http://www.sat.gob.mx/Pagos",
        detallista: "http://www.sat.gob.mx/detallista",
        ecc12: "http://www.sat.gob.mx/EstadoDeCuentaCombustible12",
        consumodecombustibles11: "http://www.sat.gob.mx/ConsumoDeCombustibles11",
        gceh: "http://www.sat.gob.mx/GastosHidrocarburos10",
        ieeh: "http://www.sat.gob.mx/IngresosHidrocarburos10",
        cartaporte20: "http://www.sat.gob.mx/CartaPorte20",
        cartaporte30: "http://www.sat.gob.mx/CartaPorte30",
        cartaporte31: "http://www.sat.gob.mx/CartaPorte31",
    });
    const includeNodes = selectNameSpace("//xsl:include", doc);
    includeNodes.forEach((node) => {
        const href = node.getAttribute("href");
        if (href) {
            const includePath = path.resolve(basePath, href);
            const includeContent = fs_1.default.readFileSync(includePath, "utf8");
            const includeDoc = new xmldom_1.DOMParser().parseFromString(includeContent, "application/xml");
            // Clonar y añadir los hijos del includeDoc en lugar de reemplazar el nodo
            while (includeDoc.documentElement.childNodes.length > 0) {
                const importedNode = includeDoc.documentElement.childNodes[0];
                node.parentNode.insertBefore(importedNode, node);
            }
            // Eliminar el nodo de inclusión original
            node.parentNode.removeChild(node);
        }
    });
    const result = new xmldom_1.XMLSerializer().serializeToString(doc);
    return result;
}, _CartaPorte_generarCadenaOrigen = function _CartaPorte_generarCadenaOrigen(xml) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cadenaOriginalXslt = __classPrivateFieldGet(this, _CartaPorte_instances, "m", _CartaPorte_resolveInclusions).call(this);
            let result = SaxonJS.XPath.evaluate(`transform(
        map {
          'source-node' : parse-xml-fragment($xml),
          'stylesheet-text' : $xslt,
          'delivery-format' : 'serialized'
          }
      )?output`, [], {
                params: {
                    xml: xml,
                    xslt: cadenaOriginalXslt,
                },
            });
            const sign = crypto_1.default.createSign("SHA256");
            sign.update(result);
            sign.end();
            const signature = sign.sign(__classPrivateFieldGet(this, _CartaPorte_llavePrivadaPem, "f"), "base64");
            return signature;
        }
        catch (error) {
            throw error;
        }
    });
};
class ComplementoPago {
    constructor(xml, pagosData) {
        _ComplementoPago_instances.add(this);
        _ComplementoPago_xml.set(this, void 0);
        _ComplementoPago_pago.set(this, void 0);
        _ComplementoPago_llavePrivadaPem.set(this, void 0);
        __classPrivateFieldSet(this, _ComplementoPago_xml, xml, "f");
        __classPrivateFieldSet(this, _ComplementoPago_llavePrivadaPem, "", "f");
        __classPrivateFieldSet(this, _ComplementoPago_pago, new pago_1.Pago(xml), "f");
        __classPrivateFieldGet(this, _ComplementoPago_pago, "f").agregarPago(pagosData);
    }
    crearSello(keyStream, password) {
        try {
            const pem = crypto_1.default.createPrivateKey({
                key: keyStream,
                format: "der",
                type: "pkcs8",
                passphrase: password,
            });
            const pemString = pem.export({ format: "pem", type: "pkcs8" });
            __classPrivateFieldSet(this, _ComplementoPago_llavePrivadaPem, pemString, "f");
        }
        catch (error) {
            throw error;
        }
    }
    generarXmlSellado() {
        return __awaiter(this, void 0, void 0, function* () {
            const xmlString = yield __classPrivateFieldGet(this, _ComplementoPago_pago, "f").generarPago();
            const parser = new xmldom_1.DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");
            const stringXml = pretty_data_1.pd.xml(xmlString);
            const sello = yield __classPrivateFieldGet(this, _ComplementoPago_instances, "m", _ComplementoPago_generarCadenaOrigen).call(this, stringXml);
            const comprobanteElement = xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];
            if (comprobanteElement) {
                comprobanteElement.setAttribute("Sello", sello);
            }
            const serializer = new xmldom_1.XMLSerializer();
            console.log(serializer.serializeToString(xmlDoc));
            return serializer.serializeToString(xmlDoc);
        });
    }
}
exports.ComplementoPago = ComplementoPago;
_ComplementoPago_xml = new WeakMap(), _ComplementoPago_pago = new WeakMap(), _ComplementoPago_llavePrivadaPem = new WeakMap(), _ComplementoPago_instances = new WeakSet(), _ComplementoPago_resolveInclusions = function _ComplementoPago_resolveInclusions() {
    const basePath = path.resolve(__dirname, "resources", "xslt");
    const xsltFile = path.resolve(basePath, "./cadenaoriginal_4_0.xslt");
    const xsltContent = fs_1.default.readFileSync(xsltFile, "utf8");
    const doc = new xmldom_1.DOMParser().parseFromString(xsltContent, "text/xml");
    const selectNameSpace = xpath.useNamespaces({
        xsl: "http://www.w3.org/1999/XSL/Transform",
        cfdi: "http://www.sat.gob.mx/cfd/4",
        xs: "http://www.w3.org/2001/XMLSchema",
        fn: "http://www.w3.org/2005/xpath-functions",
        cce11: "http://www.sat.gob.mx/ComercioExterior11",
        donat: "http://www.sat.gob.mx/donat",
        divisas: "http://www.sat.gob.mx/divisas",
        implocal: "http://www.sat.gob.mx/implocal",
        leyendasFisc: "http://www.sat.gob.mx/leyendasFiscales",
        pfic: "http://www.sat.gob.mx/pfic",
        tpe: "http://www.sat.gob.mx/TuristaPasajeroExtranjero",
        nomina12: "http://www.sat.gob.mx/nomina12",
        registrofiscal: "http://www.sat.gob.mx/registrofiscal",
        pagoenespecie: "http://www.sat.gob.mx/pagoenespecie",
        aerolineas: "http://www.sat.gob.mx/aerolineas",
        valesdedespensa: "http://www.sat.gob.mx/valesdedespensa",
        consumodecombustibles: "http://www.sat.gob.mx/consumodecombustibles",
        notariospublicos: "http://www.sat.gob.mx/notariospublicos",
        vehiculousado: "http://www.sat.gob.mx/vehiculousado",
        servicioparcial: "http://www.sat.gob.mx/servicioparcialconstruccion",
        decreto: "http://www.sat.gob.mx/renovacionysustitucionvehiculos",
        destruccion: "http://www.sat.gob.mx/certificadodestruccion",
        obrasarte: "http://www.sat.gob.mx/arteantiguedades",
        ine: "http://www.sat.gob.mx/ine",
        iedu: "http://www.sat.gob.mx/iedu",
        ventavehiculos: "http://www.sat.gob.mx/ventavehiculos",
        terceros: "http://www.sat.gob.mx/terceros",
        pago20: "http://www.sat.gob.mx/Pagos",
        detallista: "http://www.sat.gob.mx/detallista",
        ecc12: "http://www.sat.gob.mx/EstadoDeCuentaCombustible12",
        consumodecombustibles11: "http://www.sat.gob.mx/ConsumoDeCombustibles11",
        gceh: "http://www.sat.gob.mx/GastosHidrocarburos10",
        ieeh: "http://www.sat.gob.mx/IngresosHidrocarburos10",
        cartaporte20: "http://www.sat.gob.mx/CartaPorte20",
        cartaporte30: "http://www.sat.gob.mx/CartaPorte30",
        cartaporte31: "http://www.sat.gob.mx/CartaPorte31",
    });
    const includeNodes = selectNameSpace("//xsl:include", doc);
    includeNodes.forEach((node) => {
        const href = node.getAttribute("href");
        if (href) {
            const includePath = path.resolve(basePath, href);
            const includeContent = fs_1.default.readFileSync(includePath, "utf8");
            const includeDoc = new xmldom_1.DOMParser().parseFromString(includeContent, "application/xml");
            // Clonar y añadir los hijos del includeDoc en lugar de reemplazar el nodo
            while (includeDoc.documentElement.childNodes.length > 0) {
                const importedNode = includeDoc.documentElement.childNodes[0];
                node.parentNode.insertBefore(importedNode, node);
            }
            // Eliminar el nodo de inclusión original
            node.parentNode.removeChild(node);
        }
    });
    const result = new xmldom_1.XMLSerializer().serializeToString(doc);
    return result;
}, _ComplementoPago_generarCadenaOrigen = function _ComplementoPago_generarCadenaOrigen(xml) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cadenaOriginalXslt = __classPrivateFieldGet(this, _ComplementoPago_instances, "m", _ComplementoPago_resolveInclusions).call(this);
            let result = SaxonJS.XPath.evaluate(`transform(
        map {
          'source-node' : parse-xml-fragment($xml),
          'stylesheet-text' : $xslt,
          'delivery-format' : 'serialized'
          }
      )?output`, [], {
                params: {
                    xml: xml,
                    xslt: cadenaOriginalXslt,
                },
            });
            const sign = crypto_1.default.createSign("SHA256");
            sign.update(result);
            sign.end();
            const signature = sign.sign(__classPrivateFieldGet(this, _ComplementoPago_llavePrivadaPem, "f"), "base64");
            return signature;
        }
        catch (error) {
            throw error;
        }
    });
};
