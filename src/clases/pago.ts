import {
  pagoInterface,
  impuestosDRInterface,
  doctoRelacionadoInterface,
} from "./../interfaces/facturaInterfaces";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
export class Pago {
  #xml: string;
  #pagos: Array<pagoInterface>;
  constructor(xml: string) {
    this.#xml = xml;  
    this.#pagos = [];
  }

  agregarPago(pagos: pagoInterface[]) {
    this.#pagos = pagos;
  }

  async generarPago(): Promise<string> {
    if (!this.#xml) {
      throw new Error("No hay XML base para generar el complemento de pago");
    }

    const { xmlDoc, pagosNode } = this.inicializarDocumentoXML();
    const totales = this.procesarPagos(xmlDoc, pagosNode);
    this.actualizarTotales(xmlDoc, pagosNode, totales);

    const serializer = new XMLSerializer();
    this.#xml = serializer.serializeToString(xmlDoc);
    return this.#xml;
  }

  private inicializarDocumentoXML() {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(this.#xml, "application/xml");
    const xmlTimbrado = xmlDoc.getElementsByTagName("tfd:TimbreFiscalDigital");

    if (xmlTimbrado.length !== 0) {
      throw new Error("El XML ya tiene timbre fiscal");
    }

    const nodeBase = xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];
    nodeBase.setAttribute("xmlns:pago20", "http://www.sat.gob.mx/Pagos20");

    const currentSchemaLocation =
      nodeBase.getAttribute("xsi:schemaLocation") || "";
    nodeBase.setAttribute(
      "xsi:schemaLocation",
      `${currentSchemaLocation} http://www.sat.gob.mx/Pagos20 http://www.sat.gob.mx/sitio_internet/cfd/Pagos/Pagos20.xsd`
    );

    const complementoNode = xmlDoc.createElement("cfdi:Complemento");
    nodeBase.appendChild(complementoNode);

    const pagosNode = xmlDoc.createElement("pago20:Pagos");
    pagosNode.setAttribute("Version", "2.0");
    complementoNode.appendChild(pagosNode);

    return { xmlDoc, pagosNode };
  }

  private procesarPagos(xmlDoc: Document, pagosNode: Element) {
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

    this.#pagos.forEach(pago => {
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

  private crearNodoPago(xmlDoc: Document, pago: pagoInterface): Element {
    const pagoElement = xmlDoc.createElement("pago20:Pago");
    pagoElement.setAttribute("FechaPago", pago.FechaPago);
    pagoElement.setAttribute("FormaDePagoP", pago.FormaPagoP.toString());
    pagoElement.setAttribute("MonedaP", pago.MonedaP);
    pagoElement.setAttribute("TipoCambioP", pago.TipoCambioP.toString());
    pagoElement.setAttribute("Monto", pago.Monto.toFixed(2));
    return pagoElement;
  }

  private crearNodoDoctoRelacionado(
    xmlDoc: Document,
    docto: doctoRelacionadoInterface
  ): Element {
    const doctoNode = xmlDoc.createElement("pago20:DoctoRelacionado");
    doctoNode.setAttribute("IdDocumento", docto.IdDocumento);
    doctoNode.setAttribute("MonedaDR", docto.MonedaDR.toString());
    doctoNode.setAttribute("EquivalenciaDR", docto.EquivalenciaDR.toString());
    doctoNode.setAttribute("NumParcialidad", docto.NumParcialidad.toString());
    doctoNode.setAttribute("ObjetoImpDR", docto.ObjetoImpDR.toString());
    doctoNode.setAttribute("ImpSaldoAnt", docto.ImpSaldoAnt.toFixed(2));
    doctoNode.setAttribute("ImpPagado", docto.ImpPagado.toFixed(2));
    doctoNode.setAttribute(
      "ImpSaldoInsoluto",
      docto.ImpSaldoInsoluto.toFixed(2)
    );

    if (docto.Folio) doctoNode.setAttribute("Folio", docto.Folio.toString());
    if (docto.Serie) doctoNode.setAttribute("Serie", docto.Serie.toString());

    return doctoNode;
  }

  private agregarImpuestosDR(xmlDoc: Document, doctoNode: Element, impuestosDR: impuestosDRInterface[], totales: any) {
    const impuestoDR = xmlDoc.createElement("pago20:ImpuestosDR");
    doctoNode.appendChild(impuestoDR);

    const trasladosDR = xmlDoc.createElement("pago20:TrasladosDR");
    const retencionesDR = xmlDoc.createElement("pago20:RetencionesDR");

    impuestosDR.forEach(impuesto => {
        if (impuesto.Tipo === "traslado") {
            const trasladoDR = this.crearNodoTrasladoDR(xmlDoc, impuesto);
            trasladosDR.appendChild(trasladoDR);
            this.actualizarTotalesTraslados(impuesto, totales);
        } else if (impuesto.Tipo === "retencion") {
            const retencionDR = this.crearNodoRetencionDR(xmlDoc, impuesto);
            retencionesDR.appendChild(retencionDR);
            this.actualizarTotalesRetenciones(impuesto, totales);
        }
    });

    if (trasladosDR.hasChildNodes()) impuestoDR.appendChild(trasladosDR);
    if (retencionesDR.hasChildNodes()) impuestoDR.appendChild(retencionesDR);
}

private crearNodoTrasladoDR(xmlDoc: Document, impuesto: impuestosDRInterface): Element {
  const trasladoDR = xmlDoc.createElement("pago20:TrasladoDR");
  trasladoDR.setAttribute("BaseDR", impuesto.BaseDR?.toFixed(2) || "0.000000");
  trasladoDR.setAttribute("ImpuestoDR", impuesto.ImpuestoDR?.toString() || "");
  trasladoDR.setAttribute("TipoFactorDR", impuesto.TipoFactorDR?.toString() || "");
  
  if (impuesto.TipoFactorDR !== "Exento") {
      trasladoDR.setAttribute("TasaOCuotaDR", impuesto.TasaOCuotaDR?.toFixed(6) || "0.000000");
      trasladoDR.setAttribute("ImporteDR", impuesto.ImporteDR?.toFixed(2) || "0.000000");
  }
  
  return trasladoDR;
}

private crearNodoRetencionDR(xmlDoc: Document, impuesto: impuestosDRInterface): Element {
  const retencionDR = xmlDoc.createElement("pago20:RetencionDR");
  retencionDR.setAttribute("BaseDR", impuesto.BaseDR?.toFixed(2) || "0.000000");
  retencionDR.setAttribute("ImpuestoDR", impuesto.ImpuestoDR?.toString() || "");
  retencionDR.setAttribute("TipoFactorDR", impuesto.TipoFactorDR?.toString() || "");
  
  if (impuesto.TipoFactorDR !== "Exento") {
      retencionDR.setAttribute("TasaOCuotaDR", impuesto.TasaOCuotaDR?.toFixed(6) || "0.000000");
      retencionDR.setAttribute("ImporteDR", impuesto.ImporteDR?.toFixed(2) || "0.000000");
  }
  
  return retencionDR;
}

private actualizarTotalesTraslados(impuesto: impuestosDRInterface, totales: any) {
  if (impuesto.ImpuestoDR === "002") {
      if (impuesto.TipoFactorDR === "Exento") {
          totales.TotalTrasladosBaseIVAExento += impuesto.BaseDR || 0;
      } else {
          totales.TotalTrasladosBaseIVA16 += impuesto.BaseDR || 0;
          totales.TotalTrasladosImpuestoIVA16 += impuesto.ImporteDR || 0;
      }
  }
}

private actualizarTotalesRetenciones(impuesto: impuestosDRInterface, totales: any) {
  const importe = impuesto.ImporteDR || 0;
  switch (impuesto.ImpuestoDR) {
      case "001": totales.TotalRetencionesISR += importe; break;
      case "002": totales.TotalRetencionesIVA += importe; break;
      case "003": totales.TotalRetencionesIEPS += importe; break;
  }
}

private agregarImpuestosPago(xmlDoc: Document, pagoElement: Element, totales: any, doctosRelacionados: doctoRelacionadoInterface[]) {
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
                      const trasladoP = xmlDoc.createElement("pago20:TrasladoP");
                      trasladoP.setAttribute("BaseP", impuesto.BaseDR?.toFixed(2) || "0.00");
                      trasladoP.setAttribute("ImpuestoP", impuesto.ImpuestoDR?.toString() || "");
                      trasladoP.setAttribute("TipoFactorP", impuesto.TipoFactorDR?.toString() || "");
                      
                      if (impuesto.TipoFactorDR !== "Exento") {
                          trasladoP.setAttribute("TasaOCuotaP", impuesto.TasaOCuotaDR?.toFixed(6) || "0.000000");
                          trasladoP.setAttribute("ImporteP", impuesto.ImporteDR?.toFixed(2) || "0.00");
                      }
                      
                      trasladosP.appendChild(trasladoP);
                  });
          }
      } else {
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

private actualizarTotales(xmlDoc: Document, pagosNode: Element, totales: any) {
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
