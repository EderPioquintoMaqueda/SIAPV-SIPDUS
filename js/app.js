/**
 * @file app.js
 * @description Punto de entrada, orquestador y enrutador SPA del sistema SIAPV-SIPDUS.
 */

import { VehicleRepository } from './repositories/VehicleRepository.js';
import { BaseRepository } from './core/BaseRepository.js';
import { Renderer } from './ui/Renderer.js';
import { SearchEngine } from './ui/SearchEngine.js';
import { MapComponent } from './ui/MapComponent.js';
import { ChartComponent } from './ui/ChartComponent.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando sistema SIAPV-SIPDUS...');

    // 1. INICIALIZACIÓN INMEDIATA DEL SISTEMA DE NAVEGACIÓN (SPA)
    // Se ejecuta de inmediato para asegurar que los clics funcionen incluso si los JSON fallan.
    const navLinks = {
        'nav-inicio': 'view-inicio',
        'nav-consulta': 'view-consulta',
        'nav-direcciones': 'view-direcciones',
        'nav-mapa': 'view-mapa',
        'nav-estadisticas': 'view-estadisticas'
    };

    function cambiarPantalla(targetViewId, clickedLinkId) {
        // Oculta todas las vistas
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.add('d-none');
        });

        // Muestra la vista seleccionada
        const targetView = document.getElementById(targetViewId);
        if (targetView) {
            targetView.classList.remove('d-none');
        }

        // Actualiza el estilo activo en el menú
        document.querySelectorAll('.inst-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const clickedLink = document.getElementById(clickedLinkId);
        if (clickedLink) {
            clickedLink.classList.add('active');
        }

        // Corrección especial para el redibujado de mapas de Leaflet al hacerse visibles
        if (targetViewId === 'view-mapa' && mapComponent.map) {
            setTimeout(() => {
                mapComponent.map.invalidateSize();
            }, 100);
        }
    }

    // Registra los eventos de clic en el menú
    Object.keys(navLinks).forEach(linkId => {
        const linkElement = document.getElementById(linkId);
        if (linkElement) {
            linkElement.addEventListener('click', (event) => {
                event.preventDefault();
                cambiarPantalla(navLinks[linkId], linkId);
            });
        }
    });

    // Enlace de acceso directo "Ver todas"
    const linkVerTodas = document.getElementById('link-ver-todas');
    if (linkVerTodas) {
        linkVerTodas.addEventListener('click', (event) => {
            event.preventDefault();
            cambiarPantalla('view-consulta', 'nav-consulta');
        });
    }

    // 2. INSTANCIACIÓN DE COMPONENTES INTERACTIVOS
    const mapComponent = new MapComponent();
    const searchEngine = new SearchEngine();

    // Inicializamos el mapa vacío
    mapComponent.init('leaflet-map');
    
    // Inicializamos el buscador en tiempo real
    searchEngine.init();

    // =========================================================================
    // 3. CARGA DE DATOS SECTORIZADA (CON TOLERANCIA A ERRORES)
    // =========================================================================
    async function inicializarDatos() {
        try {
            console.log('Consultando bases de datos JSON de la Fase 1...');
            
            // Carga paralela de archivos para máxima velocidad
            const [allUnits, statsData, directionsData] = await Promise.all([
                VehicleRepository.getAll().catch(e => { console.warn('No se pudo cargar vehiculos.json:', e); return []; }),
                BaseRepository.fetchJson(BaseRepository.getEndpoint('estadisticas')).catch(e => { console.warn('No se pudo cargar estadisticas.json:', e); return {}; }),
                BaseRepository.fetchJson(BaseRepository.getEndpoint('direcciones')).catch(e => { console.warn('No se pudo cargar direcciones.json:', e); return []; })
            ]);

            // A. Cargar Tarjetas de Estadísticas (Dashboard)
            if (statsData && Object.keys(statsData).length > 0) {
                Renderer.renderStats(statsData);
                ChartComponent.renderDoughnut(statsData, 'mini-chart');
            } else {
                document.getElementById('stats-container').innerHTML = `
                    <div class="col-12 text-center text-muted py-2">Estadísticas temporalmente no disponibles (Falta estadisticas.json)</div>
                `;
            }

            // B. Cargar Lista de Unidades Recientes y Buscador
            if (allUnits && allUnits.length > 0) {
                Renderer.renderUnits(allUnits.slice(0, 4), 'inicio-units-container');
                Renderer.renderUnits(allUnits, 'units-list-container');
            } else {
                document.getElementById('inicio-units-container').innerHTML = `
                    <div class="text-center py-4 text-muted">No se encontraron registros de inventario (Falta vehiculos.json)</div>
                `;
                document.getElementById('units-list-container').innerHTML = `
                    <div class="text-center py-4 text-muted">No se encontraron registros de inventario (Falta vehiculos.json)</div>
                `;
            }

            // C. Cargar Marcadores en el Mapa
            if (directionsData && directionsData.length > 0) {
                mapComponent.renderMarkers(directionsData);
                
                // Cargar tabla de Direcciones Responsables
                const tableBody = document.getElementById('direcciones-table-body');
                if (tableBody) {
                    tableBody.innerHTML = directionsData.map(dir => `
                        <tr>
                            <td><span class="badge bg-secondary py-2 px-3">${dir.siglas || 'DIR'}</span></td>
                            <td class="fw-bold text-dark">${dir.nombre || 'N/A'}</td>
                            <td>${dir.titular || 'Por asignar'}</td>
                            <td><i class="fa-solid fa-location-dot text-muted me-2"></i>${(dir.ubicacion && dir.ubicacion.descripcion) || 'Sin dirección registrada'}</td>
                        </tr>
                    `).join('');
                }
            } else {
                document.getElementById('direcciones-table-body').innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center py-4 text-muted">No hay direcciones registradas (Falta direcciones.json)</td>
                    </tr>
                `;
            }

            console.log('Proceso de carga inicial finalizado.');

        } catch (error) {
            console.error('Ocurrió un error inesperado al procesar los datos:', error);
        }
    }

    // Disparamos la carga de datos sin bloquear el hilo principal de la interfaz
    inicializarDatos();
});
