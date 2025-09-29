import { FacturaCFDI } from "../src/index";
import fs from "fs";
import path from "path";

// Constantes para paths y valores fijos
const KEY_PATH = path.join("test", "CSD_Sucursal_1_EKU9003173C9_20230517_223850.key");
const CER_PATH = path.join("test", "CSD_Sucursal_1_EKU9003173C9_20230517_223850.cer");
const PASSWORD = "12345678a";

// Función de utilidad para normalizar XML
const normalizeXml = (xml: string): string => {
  return xml
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
};

// Datos de prueba reutilizables
const TEST_ATTRIBUTES = {
  Serie: "I",
  Folio: "234234",
  Fecha: "2024-04-29T00:00:00",
  TipoComprobante: "I",
  LugarExpedicion: "75700",
  Subtotal: "0",
  Total: "0",
  Moneda: "MXN",
  Exportacion: "01",
};

const EMISOR_DATA = {
  rfc: "EKU9003173C9",
  nombre: "ESCUELA KEMPER URGATE",
  regimenFiscal: "601"
};

const RECEPTOR_DATA = {
  rfc: "XAXX010101000",
  nombre: "PUBLICO GENERAL",
  usoCFDI: "616",
  codigoPostal: "75700",
  clavePais: "CP01"
};

const CONCEPTOS_DATA = [{
  ClaveProdServ: "84111506",
  Cantidad: "1",
  ClaveUnidad: "ACT",
  Descripcion: "Pago",
  ValorUnitario: "0",
  Importe: "0",
  ObjetoImp: "01",
}];

describe("CFDI Factura con Complemento de Pago", () => {
  let factura: FacturaCFDI;
  let keyStream: Buffer;
  let cerStream: Buffer;
  let expectedXml: string;

  // Setup antes de todas las pruebas
  beforeAll(() => {
    keyStream = fs.readFileSync(KEY_PATH);
    cerStream = fs.readFileSync(CER_PATH);
  });

  // Setup antes de cada prueba
  beforeEach(() => {
    factura = new FacturaCFDI();
  });

  it("debería generar XML correctamente sin certificados y firmas", async () => {
    // Configuración de la factura
    factura.crearEmisor(EMISOR_DATA.rfc, EMISOR_DATA.nombre, EMISOR_DATA.regimenFiscal);
    factura.crearReceptor(
      RECEPTOR_DATA.rfc,
      RECEPTOR_DATA.nombre,
      RECEPTOR_DATA.usoCFDI,
      RECEPTOR_DATA.codigoPostal,
      RECEPTOR_DATA.clavePais
    );
    factura.crearConceptos(CONCEPTOS_DATA);
    factura.certificado(cerStream);
    factura.crearSello(keyStream, PASSWORD);

    // Generación del XML
    const generatedXml = await factura.generarXmlSellado(TEST_ATTRIBUTES);

    // Verificación

    console.log(generatedXml)
    return generatedXml

  });
});