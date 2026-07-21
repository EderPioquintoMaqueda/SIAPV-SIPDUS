/**
 * @file VehicleRepository.js
 * @description Repositorio encargado de gestionar todas las consultas del parque vehicular.
 * 
 * NOTA PARA EL AGENTE DE SQL/PYTHON:
 * Las búsquedas en la Fase 1 se realizan en memoria del cliente usando los atributos de este JSON.
 * Asegúrese de que las columnas de PostgreSQL se mapeen exactamente con los mismos nombres
 * de atributos descritos en la función de filtrado (inv, placas, marca, modelo, etc.).
 */

import { BaseRepository } from '../core/BaseRepository.js';
import { CONFIG } from '../config.js';

export class VehicleRepository extends BaseRepository {

    /**
     * Obtiene el listado unificado de todo el parque vehicular.
     * En la Fase 1, une los archivos 'vehiculos.json' y 'maquinaria.json'.
     * @returns {Promise<Array>} Lista completa de unidades (vehículos + maquinaria)
     */
    static async getAll() {
        const urlVehiculos = this.getEndpoint('vehiculos');
        const urlMaquinaria = this.getEndpoint('maquinaria');

        if (CONFIG.DATA_SOURCE_MODE === 'JSON') {
            // Consultas asíncronas en paralelo para acelerar el tiempo de carga inicial
            const [vehiculos, maquinaria] = await Promise.all([
                this.fetchJson(urlVehiculos),
                this.fetchJson(urlMaquinaria)
            ]);
            return [...vehiculos, ...maquinaria];
        } else {
            // Fase 2: El API de FastAPI entregará un listado único ya optimizado
            const urlUnificada = this.getEndpoint('unidades');
            return await this.fetchJson(urlUnificada);
        }
    }

    /**
     * Busca una sola unidad utilizando su identificador único ("inv" - Número de Inventario).
     * @param {string} inventoryNumber - Número de inventario (ej. 'SIPDUS-VEH-001')
     * @returns {Promise<Object|null>} El objeto de la unidad encontrada o null si no existe
     */
    static async getByInventory(inventoryNumber) {
        if (CONFIG.DATA_SOURCE_MODE === 'JSON') {
            const allUnits = await this.getAll();
            return allUnits.find(unit => unit.inv === inventoryNumber) || null;
        } else {
            // Fase 2: Consulta directa al endpoint de FastAPI
            const urlDetalle = `${this.getEndpoint('unidades')}/${inventoryNumber}`;
            return await this.fetchJson(urlDetalle);
        }
    }

    /**
     * Motor de búsqueda instantáneo multiparámetro.
     * @param {string} term - Término o palabra clave a buscar en la base de datos
     * @returns {Promise<Array>} Unidades que coinciden con el término de búsqueda
     */
    static async search(term) {
        const queryClean = term.toLowerCase().trim();

        if (CONFIG.DATA_SOURCE_MODE === 'JSON') {
            const allUnits = await this.getAll();
            if (!queryClean) return allUnits; // Si no hay búsqueda, retorna todo el inventario

            // Filtro en cliente: Evalúa múltiples campos de la unidad de forma simultánea
            return allUnits.filter(unit =>
                (unit.inv && unit.inv.toLowerCase().includes(queryClean)) ||
                (unit.placas && unit.placas.toLowerCase().includes(queryClean)) ||
                (unit.marca && unit.marca.toLowerCase().includes(queryClean)) ||
                (unit.modelo && unit.modelo.toLowerCase().includes(queryClean)) ||
                (unit.tipo && unit.tipo.toLowerCase().includes(queryClean)) ||
                (unit.num_economico && unit.num_economico.toLowerCase().includes(queryClean)) ||
                (unit.serie && unit.serie.toLowerCase().includes(queryClean)) ||
                (unit.motor && unit.motor.toLowerCase().includes(queryClean)) ||
                (unit.color && unit.color.toLowerCase().includes(queryClean))
            );
        } else {
            // Fase 2: Delegación de búsqueda al servidor FastAPI mediante query string
            const urlBusqueda = `${this.getEndpoint('unidades')}/search?q=${encodeURIComponent(queryClean)}`;
            return await this.fetchJson(urlBusqueda);
        }
    }
}