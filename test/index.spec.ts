import { FacturaCFDI, ComplementoPago } from "../src/index";
import fs from "fs";
import { Pago } from '../src/clases/pago';
const factura = new FacturaCFDI();

const keyStream = fs.readFileSync("test/CSD_Sucursal_1_EKU9003173C9_20230517_223850.key");
const password = "12345678a";

const cerStream = fs.readFileSync("test/CSD_Sucursal_1_EKU9003173C9_20230517_223850.cer");


describe("Pago", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<cfdi:Comprobante xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/Pagos20 http://www.sat.gob.mx/sitio_internet/cfd/Pagos/Pagos20.xsd"
    xmlns:pago20="http://www.sat.gob.mx/Pagos20" Version="4.0" Folio="123" Fecha="2024-04-29T00:00:00" NoCertificado="30001000000500003416" SubTotal="0" Moneda="XXX" Total="0" TipoDeComprobante="P" Exportacion="01" LugarExpedicion="31607"
    xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Certificado="MIIFsDCCA5igAwIBAgIUMzAwMDEwMDAwMDA1MDAwMDM0MTYwDQYJKoZIhvcNAQELBQAwggErMQ8wDQYDVQQDDAZBQyBVQVQxLjAsBgNVBAoMJVNFUlZJQ0lPIERFIEFETUlOSVNUUkFDSU9OIFRSSUJVVEFSSUExGjAYBgNVBAsMEVNBVC1JRVMgQXV0aG9yaXR5MSgwJgYJKoZIhvcNAQkBFhlvc2Nhci5tYXJ0aW5lekBzYXQuZ29iLm14MR0wGwYDVQQJDBQzcmEgY2VycmFkYSBkZSBjYWxpejEOMAwGA1UEEQwFMDYzNzAxCzAJBgNVBAYTAk1YMRkwFwYDVQQIDBBDSVVEQUQgREUgTUVYSUNPMREwDwYDVQQHDAhDT1lPQUNBTjERMA8GA1UELRMIMi41LjQuNDUxJTAjBgkqhkiG9w0BCQITFnJlc3BvbnNhYmxlOiBBQ0RNQS1TQVQwHhcNMjMwNTE4MTE0MzUxWhcNMjcwNTE4MTE0MzUxWjCB1zEnMCUGA1UEAxMeRVNDVUVMQSBLRU1QRVIgVVJHQVRFIFNBIERFIENWMScwJQYDVQQpEx5FU0NVRUxBIEtFTVBFUiBVUkdBVEUgU0EgREUgQ1YxJzAlBgNVBAoTHkVTQ1VFTEEgS0VNUEVSIFVSR0FURSBTQSBERSBDVjElMCMGA1UELRMcRUtVOTAwMzE3M0M5IC8gVkFEQTgwMDkyN0RKMzEeMBwGA1UEBRMVIC8gVkFEQTgwMDkyN0hTUlNSTDA1MRMwEQYDVQQLEwpTdWN1cnNhbCAxMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtmecO6n2GS0zL025gbHGQVxznPDICoXzR2uUngz4DqxVUC/w9cE6FxSiXm2ap8Gcjg7wmcZfm85EBaxCx/0J2u5CqnhzIoGCdhBPuhWQnIh5TLgj/X6uNquwZkKChbNe9aeFirU/JbyN7Egia9oKH9KZUsodiM/pWAH00PCtoKJ9OBcSHMq8Rqa3KKoBcfkg1ZrgueffwRLws9yOcRWLb02sDOPzGIm/jEFicVYt2Hw1qdRE5xmTZ7AGG0UHs+unkGjpCVeJ+BEBn0JPLWVvDKHZAQMj6s5Bku35+d/MyATkpOPsGT/VTnsouxekDfikJD1f7A1ZpJbqDpkJnss3vQIDAQABox0wGzAMBgNVHRMBAf8EAjAAMAsGA1UdDwQEAwIGwDANBgkqhkiG9w0BAQsFAAOCAgEAFaUgj5PqgvJigNMgtrdXZnbPfVBbukAbW4OGnUhNrA7SRAAfv2BSGk16PI0nBOr7qF2mItmBnjgEwk+DTv8Zr7w5qp7vleC6dIsZFNJoa6ZndrE/f7KO1CYruLXr5gwEkIyGfJ9NwyIagvHHMszzyHiSZIA850fWtbqtythpAliJ2jF35M5pNS+YTkRB+T6L/c6m00ymN3q9lT1rB03YywxrLreRSFZOSrbwWfg34EJbHfbFXpCSVYdJRfiVdvHnewN0r5fUlPtR9stQHyuqewzdkyb5jTTw02D2cUfL57vlPStBj7SEi3uOWvLrsiDnnCIxRMYJ2UA2ktDKHk+zWnsDmaeleSzonv2CHW42yXYPCvWi88oE1DJNYLNkIjua7MxAnkNZbScNw01A6zbLsZ3y8G6eEYnxSTRfwjd8EP4kdiHNJftm7Z4iRU7HOVh79/lRWB+gd171s3d/mI9kte3MRy6V8MMEMCAnMboGpaooYwgAmwclI2XZCczNWXfhaWe0ZS5PmytD/GDpXzkX0oEgY9K/uYo5V77NdZbGAjmyi8cE2B2ogvyaN2XfIInrZPgEffJ4AB7kFA2mwesdLOCh0BLD9itmCve3A1FGR4+stO2ANUoiI3w3Tv2yQSg4bjeDlJ08lXaaFCLW2peEXMXjQUk7fmpb5MNuOUTW6BE=" Sello="l3Uq5SRwBpTWSanQkC2du6PQS4uIoLpD/Gk77/Z+LMAu5HgnZwFN4UC04Y6Nc7rsqCx99L0pdqJ8ZMErX7x2NJbQwLXbVpYvATqb1p+Mdoso2BvpsP2mydgnza/EtWBMl4+Q4qnQzQBzkLNlRf9QqyIZO0xA9DIJZQSdH4cACSuS5mWKsKYyDZPT6H7BpPjIr7pg5xZbXnd0xzSfH3cNJBHHlJzt1QuamM4kKWGgNbnFkdEGdJcHyrIAbbkAC9vBMcIRLR8/xezguJg4YwU1NrKwQx6RtWqPCau/hCfwV601c5Xp4PXdBqQ2nGI4mv76ewuw1uUAMBiRQxMULe4tUg==">
    <cfdi:Emisor Rfc="EKU9003173C9" Nombre="ESCUELA KEMPER URGATE" RegimenFiscal="601" />
    <cfdi:Receptor Rfc="URE180429TM6" Nombre="UNIVERSIDAD ROBOTICA ESPAÑOLA" DomicilioFiscalReceptor="86991" RegimenFiscalReceptor="601" UsoCFDI="CP01" />
    <cfdi:Conceptos>
        <cfdi:Concepto ClaveProdServ="84111506" Cantidad="1" ClaveUnidad="ACT" Descripcion="Pago" ValorUnitario="0" Importe="0" ObjetoImp="01" />
    </cfdi:Conceptos>
    <cfdi:Complemento>
        <pago20:Pagos Version="2.0">
            <pago20:Totales TotalTrasladosBaseIVA16="1380160.72" TotalTrasladosImpuestoIVA16="220825.70" MontoTotalPagos="1600986.46" />
            <pago20:Pago FechaPago="2022-04-28T17:49:04" FormaDePagoP="03" MonedaP="MXN" TipoCambioP="1" Monto="7097.38">
                <pago20:DoctoRelacionado IdDocumento="79ff44fd-f0ba-4024-a55f-0a228fa72903" MonedaDR="USD" EquivalenciaDR="0.049693" NumParcialidad="2" ImpSaldoAnt="352.69" ImpPagado="352.69" ImpSaldoInsoluto="0" ObjetoImpDR="02">
                    <pago20:ImpuestosDR>
                        <pago20:TrasladosDR>
                            <pago20:TrasladoDR BaseDR="304.043103" ImpuestoDR="002" TipoFactorDR="Tasa" TasaOCuotaDR="0.160000" ImporteDR="48.646897" />
                        </pago20:TrasladosDR>
                    </pago20:ImpuestosDR>
                </pago20:DoctoRelacionado>
                <pago20:ImpuestosP>
                    <pago20:TrasladosP>
                        <pago20:TrasladoP BaseP="6118.42" ImpuestoP="002" TipoFactorP="Tasa" TasaOCuotaP="0.160000" ImporteP="978.94" />
                    </pago20:TrasladosP>
                </pago20:ImpuestosP>
            </pago20:Pago>
            <pago20:Pago FechaPago="2022-04-28T17:49:04" FormaDePagoP="03" MonedaP="MXN" TipoCambioP="1" Monto="793395.85">
                <pago20:DoctoRelacionado IdDocumento="79ff44fd-f0ba-4024-a55f-0a228fa72903" MonedaDR="USD" EquivalenciaDR="0.049693" NumParcialidad="1" ImpSaldoAnt="39778.91" ImpPagado="39426.22" ImpSaldoInsoluto="352.69" ObjetoImpDR="02">
                    <pago20:ImpuestosDR>
                        <pago20:TrasladosDR>
                            <pago20:TrasladoDR BaseDR="33988.120690" ImpuestoDR="002" TipoFactorDR="Tasa" TasaOCuotaDR="0.160000" ImporteDR="5438.099310" />
                        </pago20:TrasladosDR>
                    </pago20:ImpuestosDR>
                </pago20:DoctoRelacionado>
                <pago20:ImpuestosP>
                    <pago20:TrasladosP>
                        <pago20:TrasladoP BaseP="683961.94" ImpuestoP="002" TipoFactorP="Tasa" TasaOCuotaP="0.160000" ImporteP="109433.91" />
                    </pago20:TrasladosP>
                </pago20:ImpuestosP>
            </pago20:Pago>
            <pago20:Pago FechaPago="2022-04-28T17:49:04" FormaDePagoP="03" MonedaP="MXN" TipoCambioP="1" Monto="7097.38">
                <pago20:DoctoRelacionado IdDocumento="79ff44fd-f0ba-4024-a55f-0a228fa72903" MonedaDR="USD" EquivalenciaDR="0.049693" NumParcialidad="2" ImpSaldoAnt="352.69" ImpPagado="352.69" ImpSaldoInsoluto="0" ObjetoImpDR="02">
                    <pago20:ImpuestosDR>
                        <pago20:TrasladosDR>
                            <pago20:TrasladoDR BaseDR="304.043103" ImpuestoDR="002" TipoFactorDR="Tasa" TasaOCuotaDR="0.160000" ImporteDR="48.646897" />
                        </pago20:TrasladosDR>
                    </pago20:ImpuestosDR>
                </pago20:DoctoRelacionado>
                <pago20:ImpuestosP>
                    <pago20:TrasladosP>
                        <pago20:TrasladoP BaseP="6118.42" ImpuestoP="002" TipoFactorP="Tasa" TasaOCuotaP="0.160000" ImporteP="978.94" />
                    </pago20:TrasladosP>
                </pago20:ImpuestosP>
            </pago20:Pago>
            <pago20:Pago FechaPago="2022-04-28T17:49:04" FormaDePagoP="03" MonedaP="MXN" TipoCambioP="1" Monto="793395.85">
                <pago20:DoctoRelacionado IdDocumento="79ff44fd-f0ba-4024-a55f-0a228fa72903" MonedaDR="USD" EquivalenciaDR="0.049693" NumParcialidad="1" ImpSaldoAnt="39778.91" ImpPagado="39426.22" ImpSaldoInsoluto="352.69" ObjetoImpDR="02">
                    <pago20:ImpuestosDR>
                        <pago20:TrasladosDR>
                            <pago20:TrasladoDR BaseDR="33988.120690" ImpuestoDR="002" TipoFactorDR="Tasa" TasaOCuotaDR="0.160000" ImporteDR="5438.099310" />
                        </pago20:TrasladosDR>
                    </pago20:ImpuestosDR>
                </pago20:DoctoRelacionado>
                <pago20:ImpuestosP>
                    <pago20:TrasladosP>
                        <pago20:TrasladoP BaseP="683961.94" ImpuestoP="002" TipoFactorP="Tasa" TasaOCuotaP="0.160000" ImporteP="109433.91" />
                    </pago20:TrasladosP>
                </pago20:ImpuestosP>
            </pago20:Pago>
        </pago20:Pagos>
        <tfd:TimbreFiscalDigital xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" Version="1.1" UUID="8fec019e-8856-45e3-9798-aa861075450e" FechaTimbrado="2024-04-29T13:02:56" RfcProvCertif="SPR190613I52" SelloCFD="l3Uq5SRwBpTWSanQkC2du6PQS4uIoLpD/Gk77/Z+LMAu5HgnZwFN4UC04Y6Nc7rsqCx99L0pdqJ8ZMErX7x2NJbQwLXbVpYvATqb1p+Mdoso2BvpsP2mydgnza/EtWBMl4+Q4qnQzQBzkLNlRf9QqyIZO0xA9DIJZQSdH4cACSuS5mWKsKYyDZPT6H7BpPjIr7pg5xZbXnd0xzSfH3cNJBHHlJzt1QuamM4kKWGgNbnFkdEGdJcHyrIAbbkAC9vBMcIRLR8/xezguJg4YwU1NrKwQx6RtWqPCau/hCfwV601c5Xp4PXdBqQ2nGI4mv76ewuw1uUAMBiRQxMULe4tUg==" NoCertificadoSAT="30001000000500003456" SelloSAT="ZuYQqMrulFUFESTJEBcJ7KFcd618m9DaVJeDcR+p/QnYTj5ujYK5BoKgFKXsXe5CdiqgM4tJOyWeFxRUsTtPtYFQrrAejCOeu6zBJuSENkPaaW8uKQC4CoHMotDQLxVym559kPxeKo86ovChs25HOdSmxakM4LJOpu/7Kg5MI0E2faDBCJT35I+Xz3jlPU2y+/GNAvj0M3fKr67swZ7SoAg3zAJs1FO44DZfclPfVdFAE8eXFVWkQjOaBe7rFk40qvl3/2Qrlr817KsxA3lMETkSjKcLC1eNY8qghS8cLZTdHaUfiIwR9lg+LNStTBI5qqgcc8DAtY205/iVfWPI+Q=="
            xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" />
    </cfdi:Complemento>
</cfdi:Comprobante>

<?xml version="1.0" encoding="utf-8"?>
<cfdi:Comprobante xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:pago20="http://www.sat.gob.mx/Pagos20" xsi:schemaLocation="http://www.sat.gob.mx/Pagos20 http://www.sat.gob.mx/sitio_internet/cfd/Pagos/Pagos20.xsd&#xD;&#xA;&#xD;&#xA;                        http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd" Version="4.0" Serie="00" Folio="0000179826" Fecha="2024-04-29T00:00:00" Sello="Kg6CyPmAROGtYW83rQbhpyuMa9B9YVs9UoZt9+ULk86bxp/jk/w8WastVBTdWW2xR5s+W4e+wVZ6mRgr2k2AWKmRBF4z5HpNyzYCiFpckrBWaHI9T+KN9u04c7fiHyOcsQm3IZNa6ukLePgLV6CAaNMccrAvc3ElBRZI4pKjDq51kui3uH4Zmbi6paedByAEqnN/g+FAG+kk5PYR9JzzdXjhmTc8iyE7vwX2TQhjRvCS8vf/DlOBfzBfNK342c87SAqEWKQG1Gh/jcjkrm7LGaLTNuMHmtZHKd3kvoWuIYq3eLVeNc96WneXP6jsibGidQWg6e8OIiAZQPzcxVEoKQ==" NoCertificado="30001000000500003416" Certificado="MIIFsDCCA5igAwIBAgIUMzAwMDEwMDAwMDA1MDAwMDM0MTYwDQYJKoZIhvcNAQELBQAwggErMQ8wDQYDVQQDDAZBQyBVQVQxLjAsBgNVBAoMJVNFUlZJQ0lPIERFIEFETUlOSVNUUkFDSU9OIFRSSUJVVEFSSUExGjAYBgNVBAsMEVNBVC1JRVMgQXV0aG9yaXR5MSgwJgYJKoZIhvcNAQkBFhlvc2Nhci5tYXJ0aW5lekBzYXQuZ29iLm14MR0wGwYDVQQJDBQzcmEgY2VycmFkYSBkZSBjYWxpejEOMAwGA1UEEQwFMDYzNzAxCzAJBgNVBAYTAk1YMRkwFwYDVQQIDBBDSVVEQUQgREUgTUVYSUNPMREwDwYDVQQHDAhDT1lPQUNBTjERMA8GA1UELRMIMi41LjQuNDUxJTAjBgkqhkiG9w0BCQITFnJlc3BvbnNhYmxlOiBBQ0RNQS1TQVQwHhcNMjMwNTE4MTE0MzUxWhcNMjcwNTE4MTE0MzUxWjCB1zEnMCUGA1UEAxMeRVNDVUVMQSBLRU1QRVIgVVJHQVRFIFNBIERFIENWMScwJQYDVQQpEx5FU0NVRUxBIEtFTVBFUiBVUkdBVEUgU0EgREUgQ1YxJzAlBgNVBAoTHkVTQ1VFTEEgS0VNUEVSIFVSR0FURSBTQSBERSBDVjElMCMGA1UELRMcRUtVOTAwMzE3M0M5IC8gVkFEQTgwMDkyN0RKMzEeMBwGA1UEBRMVIC8gVkFEQTgwMDkyN0hTUlNSTDA1MRMwEQYDVQQLEwpTdWN1cnNhbCAxMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtmecO6n2GS0zL025gbHGQVxznPDICoXzR2uUngz4DqxVUC/w9cE6FxSiXm2ap8Gcjg7wmcZfm85EBaxCx/0J2u5CqnhzIoGCdhBPuhWQnIh5TLgj/X6uNquwZkKChbNe9aeFirU/JbyN7Egia9oKH9KZUsodiM/pWAH00PCtoKJ9OBcSHMq8Rqa3KKoBcfkg1ZrgueffwRLws9yOcRWLb02sDOPzGIm/jEFicVYt2Hw1qdRE5xmTZ7AGG0UHs+unkGjpCVeJ+BEBn0JPLWVvDKHZAQMj6s5Bku35+d/MyATkpOPsGT/VTnsouxekDfikJD1f7A1ZpJbqDpkJnss3vQIDAQABox0wGzAMBgNVHRMBAf8EAjAAMAsGA1UdDwQEAwIGwDANBgkqhkiG9w0BAQsFAAOCAgEAFaUgj5PqgvJigNMgtrdXZnbPfVBbukAbW4OGnUhNrA7SRAAfv2BSGk16PI0nBOr7qF2mItmBnjgEwk+DTv8Zr7w5qp7vleC6dIsZFNJoa6ZndrE/f7KO1CYruLXr5gwEkIyGfJ9NwyIagvHHMszzyHiSZIA850fWtbqtythpAliJ2jF35M5pNS+YTkRB+T6L/c6m00ymN3q9lT1rB03YywxrLreRSFZOSrbwWfg34EJbHfbFXpCSVYdJRfiVdvHnewN0r5fUlPtR9stQHyuqewzdkyb5jTTw02D2cUfL57vlPStBj7SEi3uOWvLrsiDnnCIxRMYJ2UA2ktDKHk+zWnsDmaeleSzonv2CHW42yXYPCvWi88oE1DJNYLNkIjua7MxAnkNZbScNw01A6zbLsZ3y8G6eEYnxSTRfwjd8EP4kdiHNJftm7Z4iRU7HOVh79/lRWB+gd171s3d/mI9kte3MRy6V8MMEMCAnMboGpaooYwgAmwclI2XZCczNWXfhaWe0ZS5PmytD/GDpXzkX0oEgY9K/uYo5V77NdZbGAjmyi8cE2B2ogvyaN2XfIInrZPgEffJ4AB7kFA2mwesdLOCh0BLD9itmCve3A1FGR4+stO2ANUoiI3w3Tv2yQSg4bjeDlJ08lXaaFCLW2peEXMXjQUk7fmpb5MNuOUTW6BE=" SubTotal="0" Moneda="XXX" Total="0" TipoDeComprobante="P" Exportacion="01" LugarExpedicion="75700"
    xmlns:cfdi="http://www.sat.gob.mx/cfd/4">
    <cfdi:Emisor Rfc="EKU9003173C9" Nombre="ESCUELA KEMPER URGATE" RegimenFiscal="601" />
    <cfdi:Receptor Rfc="XAXX010101000" Nombre="PUBLICO GENERAL" DomicilioFiscalReceptor="75700" RegimenFiscalReceptor="616" UsoCFDI="CP01" />
    <cfdi:Conceptos>
        <cfdi:Concepto ClaveProdServ="84111506" Cantidad="1" ClaveUnidad="ACT" Descripcion="Pago" ValorUnitario="0" Importe="0" ObjetoImp="01" />
    </cfdi:Conceptos>
    <cfdi:Complemento>
        <pago20:Pagos Version="2.0">
            <pago20:Totales TotalTrasladosBaseIVA16="5843.11" TotalTrasladosImpuestoIVA16="934.90" MontoTotalPagos="6778.00" />
            <pago20:Pago FechaPago="2022-09-09T17:33:38" FormaDePagoP="01" MonedaP="MXN" TipoCambioP="1" Monto="6778.00">
                <pago20:DoctoRelacionado IdDocumento="b7c8d2bf-cb4e-4f84-af89-c68b6731206a" Serie="FA" Folio="N0000216349" MonedaDR="MXN" EquivalenciaDR="1" NumParcialidad="2" ImpSaldoAnt="6777.41" ImpPagado="6777.41" ImpSaldoInsoluto="0.00" ObjetoImpDR="02">
                    <pago20:ImpuestosDR>
                        <pago20:TrasladosDR>
                            <pago20:TrasladoDR BaseDR="5842.600000" ImpuestoDR="002" TipoFactorDR="Tasa" TasaOCuotaDR="0.160000" ImporteDR="934.816000" />
                        </pago20:TrasladosDR>
                    </pago20:ImpuestosDR>
                </pago20:DoctoRelacionado>
                <pago20:DoctoRelacionado IdDocumento="94f4e541-bb38-4355-b779-02d337dc9720" Serie="FA" Folio="SI000032690" MonedaDR="MXN" EquivalenciaDR="1" NumParcialidad="1" ImpSaldoAnt="9610.81" ImpPagado="0.59" ImpSaldoInsoluto="9610.22" ObjetoImpDR="02">
                    <pago20:ImpuestosDR>
                        <pago20:TrasladosDR>
                            <pago20:TrasladoDR BaseDR="0.510000" ImpuestoDR="002" TipoFactorDR="Tasa" TasaOCuotaDR="0.160000" ImporteDR="0.081600" />
                        </pago20:TrasladosDR>
                    </pago20:ImpuestosDR>
                </pago20:DoctoRelacionado>
                <pago20:ImpuestosP>
                    <pago20:TrasladosP>
                        <pago20:TrasladoP BaseP="5843.110000" ImpuestoP="002" TipoFactorP="Tasa" TasaOCuotaP="0.160000" ImporteP="934.897600" />
                    </pago20:TrasladosP>
                </pago20:ImpuestosP>
            </pago20:Pago>
        </pago20:Pagos>
        <tfd:TimbreFiscalDigital xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" Version="1.1" UUID="0630ceaa-ebb0-4043-853c-8220da56af2c" FechaTimbrado="2024-04-29T12:20:43" RfcProvCertif="SPR190613I52" SelloCFD="Kg6CyPmAROGtYW83rQbhpyuMa9B9YVs9UoZt9+ULk86bxp/jk/w8WastVBTdWW2xR5s+W4e+wVZ6mRgr2k2AWKmRBF4z5HpNyzYCiFpckrBWaHI9T+KN9u04c7fiHyOcsQm3IZNa6ukLePgLV6CAaNMccrAvc3ElBRZI4pKjDq51kui3uH4Zmbi6paedByAEqnN/g+FAG+kk5PYR9JzzdXjhmTc8iyE7vwX2TQhjRvCS8vf/DlOBfzBfNK342c87SAqEWKQG1Gh/jcjkrm7LGaLTNuMHmtZHKd3kvoWuIYq3eLVeNc96WneXP6jsibGidQWg6e8OIiAZQPzcxVEoKQ==" NoCertificadoSAT="30001000000500003456" SelloSAT="cCF7S/PYX/U+1NK4y3qVTB/u/T9/vZjJkhGVGEfaq4xZxkPQzJFntmnD97I+lbWlStOyZDhlKz80thpx7uT6MF+n691FTKP0TjUbzBDn7wGXZIy2IJQf4tfc5bTH6z/LI79ziKQSySdDKMHxdjLLzoIbVbHDr/+2/1eHNuRw21+3IPkFnRYtqO3Z7PT0KFxyyXGfn9bBruDm9NJu6uHjBtKA8qYiSeliG6r7pvwKI10ySj01KWFX3vI8oJCELsEWjTYHB2GoFUCsiTkzFUSfBevXhCzEK1jeO0KyTH6DH2sCZoT74bJKxiPS+g6xXk4LBLRKjwHPogiLfaRzRc5FiQ=="
            xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" />
    </cfdi:Complemento>
</cfdi:Comprobante>`;

  const expectedXml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd" xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Version="4.0" Serie="P" Folio="234234" Fecha="2024-04-29T00:00:00" SubTotal="0" Moneda="XXX" Total="0" TipoDeComprobante="P" LugarExpedicion="75700" NoCertificado="" Certificado="" Exportacion="01">
<cfdi:Emisor Rfc="EKU9003173C9" Nombre="ESCUELA KEMPER URGATE" RegimenFiscal="601"/>
<cfdi:Receptor Rfc="XAXX010101000" Nombre="PUBLICO GENERAL" DomicilioFiscalReceptor="75700" RegimenFiscalReceptor="616" UsoCFDI="CP01"/>
<cfdi:Conceptos>
  <cfdi:Concepto ClaveProdServ="84111506" Cantidad="1" ClaveUnidad="ACT" Descripcion="Pago" ValorUnitario="0.00" Importe="0.00" ObjetoImp="01"/>
</cfdi:Conceptos>
</cfdi:Comprobante>`;

  it("generate xml without certifieds and signatures", async (): Promise<any> => {
    const attributes = {
      Serie: "P",
      Folio: "234234",
      Fecha: "2024-04-29T00:00:00",
      TipoComprobante: "P",
      LugarExpedicion: "75700",
      Subtotal: "0",
      Total: "0",
      Moneda: "XXX",
      Exportacion: "01",
    };

    factura.crearEmisor("EKU9003173C9", "ESCUELA KEMPER URGATE", "601");

    factura.crearReceptor(
      "XAXX010101000",
      "PUBLICO GENERAL",
      "616",
      "75700",
      "CP01"
    );

    factura.crearConceptos([
      {
        ClaveProdServ: "84111506",
        Cantidad: "1",
        ClaveUnidad: "ACT",
        Descripcion: "Pago",
        ValorUnitario: "0",
        Importe: "0",
        ObjetoImp: "01",
      },
    ]);

    const generatedXml = factura.generarXml(attributes);


    const normalizeXml = (xml: string) => {
      return xml
        .replace(/\s+/g, " ") // Reemplaza múltiples espacios con uno solo
        .replace(/>\s+</g, "><") // Elimina espacios entre tags
        .trim();
    };

    expect(normalizeXml(generatedXml)).toEqual(normalizeXml(expectedXml));
  });
  it("generate xml with certifieds and signatures",
    async (): Promise<any> => {

        const payments = [
            {
              payment_form: "01",
              total_amount: 232.00,
              payment_date: "2017-05-05T20:55:33.468Z",
              payment_currency: "MXN",
              payment_exchange: 1,
              payment_related_documents: [
                {
                  uuid: "b7c8d2bf-cb4e-4f84-af89-c68b6731206a",
                  amount: 100,
                  currency_related_documents: "MXN",
                  parciality: 2,
                  equality: 1,
                  last_balance: 200,
                  taxability: "02",
                  taxes: [
                    {
                      type: "002",
                      base: 100,
                      rate: 0.16,
                      factor: "Tasa",
                      withholding: false
                    },
                  ]
                },
                 {
                  uuid: "b7c8d2bf-cb4e-4f84-af89-c68b6731206a",
                  amount: 100,
                  currency_related_documents: "MXN",
                  parciality: 2,
                  equality: 1,
                  last_balance: 200,
                  taxability: "02",
                  taxes: [
                    {
                      type: "002",
                      base: 100,
                      rate: 0.16,
                      factor: "Tasa",
                      withholding: false
                    },
                  ]
                }
              ]
            },
          ]
        

       
          const pago20 = new Pago(expectedXml);

          const addPayments = payments.map((item) => ({
              FormaPagoP: item.payment_form,
              FechaPago: item.payment_date,
              MonedaP: item.payment_currency,
              Monto: item.total_amount,
              TipoCambioP: "1",
              doctoRelacionado: item.payment_related_documents.map((doc) => {
                return {
                    IdDocumento: doc.uuid,
                    MonedaDR: doc.currency_related_documents,
                    NumParcialidad: doc.parciality,
                    EquivalenciaDR: 1,
                    ImpSaldoAnt: doc.last_balance,
                    ImpPagado: doc.amount,
                    ImpSaldoInsoluto: (doc.last_balance - doc.amount),
                    ObjetoImpDR: doc.taxability,
                    ImpuestosDR: doc.taxes.map((tax) => ({
                      Tipo: tax.withholding ? "retencion" : "traslado",
                      BaseDR: tax.base,
                      ImpuestoDR: tax.type,
                      TipoFactorDR: tax.factor || "Tasa",
                      TasaOCuotaDR: tax.rate,
                      ImporteDR: (tax.base * tax.rate),
                }))
              }})
          }));

          pago20.agregarPago(addPayments);
 
      const generatedPago20 = await pago20.generarPago();
      

      const normalizeXml = (xml: string) => {
        return xml
          .replace(/\s+/g, " ") //Reemplaza múltiples espacios con uno solo
          .replace(/>\s+</g, "><") //Elimina espacios entre tags
          .trim();
      };
      expect(normalizeXml(generatedPago20)).toBe('string');

    });

it("generate PDF", async (): Promise<any> => {
    const pdfg = await factura.generarPDF({
        Xml: `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd" Version="4.0" Serie="F" Fecha="2025-03-26T13:39:08" SubTotal="5000" Moneda="MXN" Total="5220" TipoDeComprobante="I" MetodoPago="PUE" FormaPago="03" LugarExpedicion="97246" NoCertificado="00001000000517621866" Certificado="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" Exportacion="01" Descuento="500" Sello="opK0fzpv4H8Kj480xf1jCKwKNz9zp4hA88Izy5In3r9IbV/A9oErl4K61ki8r9onMFyzThi5vXFb05eSfJFVZXYXmIJDQvEfAOwKxSpvtmi0/vzaRQ/9YcugPHtcyO30L3Tp8J46Y5aRX6iVgs1jiFsjd9q/eAmda3CTgvOJ1sW8rPW9oOn03Ks4dNDjvnM58/TVDIjzzGxo0w1nL68LbE3+x4oQJ8DErNfR191TtQMvDQEpWNtr/SC3XJzoqwf7tAdnSRRO0knpoByH5MOsB6iYHsms6vBq0JtGwj+jVU58Ai6yY0+9P/q6iwmnC4wIoX/z23duKEW8VhYnrQ+R3w==">
  <cfdi:Emisor Rfc="RUUR961112LZ3" Nombre="RODRIGO JAVIER RUIZ US" RegimenFiscal="612" />
  <cfdi:Receptor Rfc="HAÑ930228SM9" Nombre="HERMANOS ANZURES ÑARVAEZ" DomicilioFiscalReceptor="97246" RegimenFiscalReceptor="601" UsoCFDI="G03" />
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="43211503" Cantidad="1" ClaveUnidad="E51" Unidad="Trabajo" Descripcion="Laptop con Descuento" ValorUnitario="5000.00" Importe="5000.00" ObjetoImp="02" NoIdentificacion="LAPTOP-DESC" Descuento="500.00">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="4500.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="720.00" />
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="720.00">
    <cfdi:Traslados>
      <cfdi:Traslado Base="4500.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="720.00" />
    </cfdi:Traslados>
  </cfdi:Impuestos>
<cfdi:Complemento><tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" Version="1.1" UUID="9BDF70A2-294A-42AD-A5E3-6F0CBE4E59FB" FechaTimbrado="2025-03-26T13:39:13" RfcProvCertif="SFE0807172W7" SelloCFD="opK0fzpv4H8Kj480xf1jCKwKNz9zp4hA88Izy5In3r9IbV/A9oErl4K61ki8r9onMFyzThi5vXFb05eSfJFVZXYXmIJDQvEfAOwKxSpvtmi0/vzaRQ/9YcugPHtcyO30L3Tp8J46Y5aRX6iVgs1jiFsjd9q/eAmda3CTgvOJ1sW8rPW9oOn03Ks4dNDjvnM58/TVDIjzzGxo0w1nL68LbE3+x4oQJ8DErNfR191TtQMvDQEpWNtr/SC3XJzoqwf7tAdnSRRO0knpoByH5MOsB6iYHsms6vBq0JtGwj+jVU58Ai6yY0+9P/q6iwmnC4wIoX/z23duKEW8VhYnrQ+R3w==" NoCertificadoSAT="30001000000500003442" SelloSAT="CKOx2Z01D+GbtmLcMErramFjbv9IHdhO8MnI75zmXFEzRJMl1VbOXOcLmGZOpKktAGOaqalBJn6jc8Roj5UzhETbAAKhh/blFztTWHu2lZVGF5/hWZfSEd0BAxNqqP6OHixQ3qPcObP9qFdSU4UavHMbGrKSKg8wxOqTULdIbrFjA3JRW98nKys74LKgPtACyh1Oek/uGS1E69fmvqC5J8w7e2nnarL+EndonhHtCK5uIqwqFHscaRvBHToHQmTnsbQS6SvlsHkpPRXu3J+SGVrGhe9IdnLpmpKq/WEShRHxYQtSzuQRzrSRnI/dp2eN81Lztb+VnnQ2/a5iwyy//A==" /></cfdi:Complemento></cfdi:Comprobante>
`,
CadenaOriginal: "||1.1|5348B1D5-7557-49E3-8ED6-174A680748AE|2025-03-26T13:49:03|SFE0807172W7|QvPUHkpYE/fY+WwA7HNqqRQbXGwpy0CMAXsP6Qmdj5+S/zlpouyMtyPWy19OkxHmkayfpSYtAZrkiSniF/nl5PR9q/nsMM3iztNb9UyzUtGUP4v9lpENCT+zemJmV5/g3bK8Isbln89QOVk3FzcjvMwE6mXPef5cgs4/RFG5JCOBTfEJEwbq8qKV62/wFWM0V9ZkkYPRv0NKGnRGYE1ECDVg9fe+lktJXsIEvRZGX1mUQg78MLJduKg/1KFWIgJbKaeFw/UyCkM08WBvm6ZeaGq5LW4ZpKKHLnrh0Hmt0WIQtjggywNyb/YIaBsbHVsz4i3tPlQwq8iLePop+X20zQ==|30001000000500003442||",
    })

    const base64String = Buffer.from(pdfg).toString('base64');
    expect(typeof base64String).toBe('string');
})

it("Complemento Pago", async (): Promise<any> => {
  const payments = [
    {
      payment_form: "01",
      total_amount: 232.00,
      payment_date: "2017-05-05T20:55:33.468Z",
      payment_currency: "MXN",
      payment_exchange: 1,
      payment_related_documents: [
        {
          uuid: "b7c8d2bf-cb4e-4f84-af89-c68b6731206a",
          amount: 100,
          currency_related_documents: "MXN",
          parciality: 2,
          equality: 1,
          last_balance: 200,
          taxability: "02",
          taxes: [
            {
              type: "002",
              base: 100,
              rate: 0.16,
              factor: "Tasa",
              withholding: false
            },
          ]
        },
         {
          uuid: "b7c8d2bf-cb4e-4f84-af89-c68b6731206a",
          amount: 100,
          currency_related_documents: "MXN",
          parciality: 2,
          equality: 1,
          last_balance: 200,
          taxability: "02",
          taxes: [
            {
              type: "002",
              base: 100,
              rate: 0.16,
              factor: "Tasa",
              withholding: false
            },
          ]
        }
      ]
    },
  ]
  const addPayments = payments.map((item) => ({
    FormaPagoP: item.payment_form,
    FechaPago: item.payment_date,
    MonedaP: item.payment_currency,
    Monto: item.total_amount,
    TipoCambioP: "1",
    doctoRelacionado: item.payment_related_documents.map((doc) => {
      return {
          IdDocumento: doc.uuid,
          MonedaDR: doc.currency_related_documents,
          NumParcialidad: doc.parciality,
          EquivalenciaDR: 1,
          ImpSaldoAnt: doc.last_balance,
          ImpPagado: doc.amount,
          ImpSaldoInsoluto: (doc.last_balance - doc.amount),
          ObjetoImpDR: doc.taxability,
          ImpuestosDR: doc.taxes.map((tax) => ({
            Tipo: tax.withholding ? "retencion" : "traslado",
            BaseDR: tax.base,
            ImpuestoDR: tax.type,
            TipoFactorDR: tax.factor || "Tasa",
            TasaOCuotaDR: tax.rate,
            ImporteDR: (tax.base * tax.rate),
      }))
    }})
}));

  
  const pago20 = new ComplementoPago(expectedXml, addPayments);

  pago20.crearSello(keyStream, password)
  

  const xml = pago20.generarXmlSellado()


  return xml


})
});