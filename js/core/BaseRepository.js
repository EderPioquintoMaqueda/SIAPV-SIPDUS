/**
 * @file BaseRepository.js
 * @description Clase base para la adquisición de datos (Fase 1 JSON / Fase 2 API).
 * Proporciona métodos genéricos para consultar archivos de manera asíncrona.
 */

import { CONFIG } from '../config.js';

export class BaseRepository {
    /**
     * Determina de manera inteligente el origen del recurso (JSON local o API externa).
     * @param {string} resourceKey - Clave del recurso definido en config.js (ej. 'vehiculos')
     * @returns {string} URL o ruta final del archivo
     */
    static getEndpoint(resourceKey) {
        if (CONFIG.DATA_SOURCE_MODE === 'API') {
            // Fase 2: Conexión con endpoints de FastAPI
            return `${CONFIG.API_BASE_URL}/${resourceKey}`;
        } else {
            // Fase 1: Lectura de archivos JSON en GitHub Pages
            return CONFIG.JSON_ENDPOINTS[resourceKey];
        }
    }

    /**
     * Realiza una consulta HTTP GET genérica de forma segura.
     * @param {string} url - Ruta o endpoint de consulta
     * @returns {Promise<any>} Datos convertidos a formato de objeto/arreglo de JS
     */
    static async fetchJson(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - No se pudo acceder a ${url}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error crítico en la capa de datos al consultar [${url}]:`, error);
            // Retorna un arreglo vacío para prevenir que la interfaz se congele ante fallas de carga
            return [];
        }
    }
}