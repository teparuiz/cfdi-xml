"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarUsoCFDI = buscarUsoCFDI;
exports.buscarRegimenFiscal = buscarRegimenFiscal;
exports.buscarTipoRelacion = buscarTipoRelacion;
exports.buscarFormaPago = buscarFormaPago;
exports.buscarMetodoPago = buscarMetodoPago;
exports.buscarMeses = buscarMeses;
exports.buscarPeriodicidad = buscarPeriodicidad;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const basePath = path_1.default.resolve(__dirname, "..", "resources", "catalogos");
function buscarUsoCFDI(value) {
    try {
        const json_file = path_1.default.join(basePath, "cat_uso_cfdi.json");
        const cfdisData = fs_1.default.readFileSync(json_file, "utf8");
        const cfdis = JSON.parse(cfdisData);
        return cfdis.find((item) => item.clave === value);
    }
    catch (error) {
        throw error;
    }
}
function buscarRegimenFiscal(value) {
    try {
        const json_file = path_1.default.join(basePath, "cat_regimen_fiscal.json");
        const data = fs_1.default.readFileSync(json_file, "utf8");
        const data_parser = JSON.parse(data);
        return data_parser.find((item) => item.clave === value);
    }
    catch (error) {
        throw error;
    }
}
function buscarTipoRelacion(value) {
    try {
        const json_file = path_1.default.join(basePath, "cat_tipo_relacion.json");
        const data = fs_1.default.readFileSync(json_file, "utf8");
        const data_parser = JSON.parse(data);
        return data_parser.find((item) => item.clave === value);
    }
    catch (error) {
        throw error;
    }
}
function buscarFormaPago(value) {
    try {
        const json_file = path_1.default.join(basePath, "cat_forma_pago.json");
        const data = fs_1.default.readFileSync(json_file, "utf8");
        const data_parser = JSON.parse(data);
        return data_parser.find((item) => item.clave === value);
    }
    catch (error) {
        throw error;
    }
}
function buscarMetodoPago(value) {
    try {
        const json_file = path_1.default.join(basePath, "cat_metodo_pago.json");
        const data = fs_1.default.readFileSync(json_file, "utf8");
        const data_parser = JSON.parse(data);
        return data_parser.find((item) => item.clave === value);
    }
    catch (error) {
        throw error;
    }
}
function buscarMeses(value) {
    try {
        const json_file = path_1.default.join(basePath, "cat_meses.json");
        const data = fs_1.default.readFileSync(json_file, "utf8");
        const data_parser = JSON.parse(data);
        return data_parser.find((item) => item.clave === value);
    }
    catch (error) {
        throw error;
    }
}
function buscarPeriodicidad(value) {
    try {
        const json_file = path_1.default.join(basePath, "cat_periodicidad.json");
        const data = fs_1.default.readFileSync(json_file, "utf8");
        const data_parser = JSON.parse(data);
        return data_parser.find((item) => item.clave === value);
    }
    catch (error) {
        throw error;
    }
}
