/**
 * @file config.js
 * @description Configuración global del sistema SIAPV-SIPDUS.
 * 
 * NOTA PARA EL AGENTE DE SQL/PYTHON:
 * Este archivo define las rutas donde el frontend buscará los datos JSON.
 * Su script de Python exportador debe guardar los archivos generados desde 
 * PostgreSQL exactamente con estos nombres y en la carpeta 'datos/'.
 */

export const CONFIG = {
    // FASE 1: 'JSON' para leer archivos estáticos en GitHub Pages.
    // FASE 2: Cambiar a 'API' para apuntar a FastAPI sin tocar la interfaz.
    DATA_SOURCE_MODE: 'JSON',

    // RUTAS FASE 1: Rutas relativas de los JSON que generará su script de Python.
    JSON_ENDPOINTS: {
        vehiculos: './datos/vehiculos.json',
        maquinaria: './datos/maquinaria.json',
        direcciones: './datos/direcciones.json',
        resguardantes: './datos/resguardantes.json',
        estadisticas: './datos/estadisticas.json'
    },

    // RUTAS FASE 2: Dirección del servidor FastAPI para el futuro desarrollo.
    API_BASE_URL: 'https://api.sipdus.gob.mx/v1',

    // CONFIGURACIÓN DE INTERFAZ
    MAP_DEFAULT_CENTER: [20.11697, -98.74288], // Coordenadas del centro geográfico de operaciones (ej. Pachuca, Hgo.)
    MAP_DEFAULT_ZOOM: 13,                      // Nivel de zoom inicial del mapa
    ITEMS_PER_PAGE: 10                         // Paginación para búsquedas masivas
};