/**
 * @file app.js
 * @description Punto de entrada y orquestador del sistema SIAPV-SIPDUS.
 * Inicializa todos los componentes de datos y visuales de manera síncrona.
 */

import { VehicleRepository } from './repositories/VehicleRepository.js';
import { BaseRepository } from './core/BaseRepository.js';
import { Renderer } from './ui/Renderer.js';
import { SearchEngine } from './ui/SearchEngine.js';
import { MapComponent } from './ui/MapComponent.js';
import { ChartComponent } from './ui/ChartComponent.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Iniciando sistema SIAPV-SIPDUS de forma modular...');

    // 1. Instanciamos los componentes interactivos del mapa y el buscador
    const mapComponent = new MapComponent();
    const searchEngine = new SearchEngine();

    // 2. Iniciamos la capa visual vacía del mapa Leaflet
    mapComponent.init('leaflet-map');

    try {
        // 3. Cargamos la información inicial de forma paralela (Fase 1: desde los archivos JSON)
        // Se cargan unidades, estadísticas y direcciones
        const [allUnits, statsData, directionsData] = await Promise.all([
            VehicleRepository.getAll(),
            BaseRepository.fetchJson(BaseRepository.getEndpoint('estadisticas')),
            BaseRepository.fetchJson(BaseRepository.getEndpoint('direcciones'))
        ]);

        // 4. Renderizado Inicial de componentes visuales
        // A. Dibuja las tarjetas de estadísticas rápidas en la barra superior
        Renderer.renderStats(statsData);

        // B. Dibuja la lista inicial de unidades del parque vehicular
        Renderer.renderUnits(allUnits);

        // C. Genera el gráfico interactivo de distribución
        ChartComponent.renderDoughnut(statsData, 'mini-chart');

        // D. Ubica los marcadores de las dependencias oficiales en el mapa
        mapComponent.renderMarkers(directionsData);

        // 5. Inicializa el motor de búsqueda instantáneo
        // Queda listo para responder cada vez que el usuario escriba en el input
        searchEngine.init();

        console.log('Sistema cargado y listo para consultas.');

    } catch (error) {
        console.error('Error crítico durante la carga inicial del sistema:', error);

        // Alerta en consola para diagnosticar si el script de Python no ha generado los JSON correspondientes
        alert('Atención: Hubo un error de conexión con los archivos de datos. Verifique que los archivos JSON estén presentes en la carpeta /datos/.');
    }
});