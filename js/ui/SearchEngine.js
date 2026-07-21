/**
 * @file SearchEngine.js
 * @description Gestor de eventos de búsqueda en tiempo real.
 * Coordina la entrada de datos del usuario, el filtrado y el renderizado en pantalla.
 */

import { VehicleRepository } from '../repositories/VehicleRepository.js';
import { Renderer } from './Renderer.js';

export class SearchEngine {
    constructor() {
        this.searchInput = document.getElementById('main-search-input');
        this.searchTimeout = null;
    }

    /**
     * Inicializa los escuchadores de eventos para la barra de búsqueda.
     */
    init() {
        if (!this.searchInput) {
            console.warn('Advertencia: El elemento #main-search-input no se encontró en el DOM.');
            return;
        }

        // Escucha cambios mediante evento 'input' para responder al teclado, clics de borrar y pegados de texto.
        this.searchInput.addEventListener('input', (event) => {
            const queryValue = event.target.value;

            // Implementación de DEBOUNCE (espera de 300ms)
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.executeSearch(queryValue);
            }, 300);
        });
    }

    /**
     * Coordina la consulta al repositorio y la actualización visual de los resultados.
     * @param {string} query - Término de búsqueda
     */
    async executeSearch(query) {
        try {
            // 1. Ejecuta la consulta al repositorio abstracto (JSON local o API)
            const results = await VehicleRepository.search(query);

            // 2. Envía la lista resultante al renderer para pintar en el DOM
            Renderer.renderUnits(results);

            // Nota para el futuro: Aquí se puede enganchar la actualización del mapa 
            // para mostrar solo los pines de las unidades filtradas.
        } catch (error) {
            console.error('Error al ejecutar la búsqueda en el motor del frontend:', error);
        }
    }
}