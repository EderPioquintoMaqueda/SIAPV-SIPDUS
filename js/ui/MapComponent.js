/**
 * @file MapComponent.js
 * @description Gestión del mapa interactivo de OpenStreetMap utilizando Leaflet.
 * 
 * NOTA PARA EL AGENTE DE SQL/PYTHON:
 * Este componente espera que cada objeto de "direcciones" tenga un atributo "ubicacion"
 * con lat (Latitud), lng (Longitud) y una descripcion legible para el globo de información.
 */

import { CONFIG } from '../config.js';

export class MapComponent {
    constructor() {
        this.map = null;
        this.markersGroup = null;
    }

    /**
     * Inicializa el mapa y lo enfoca en las coordenadas predefinidas.
     * @param {string} containerId - ID del div contenedor ('leaflet-map')
     */
    init(containerId = 'leaflet-map') {
        const mapContainer = document.getElementById(containerId);
        if (!mapContainer) return;

        // 1. Instancia el objeto Leaflet y centra la vista
        this.map = L.map(containerId).setView(CONFIG.MAP_DEFAULT_CENTER, CONFIG.MAP_DEFAULT_ZOOM);

        // 2. Carga la capa visual de mapas libres de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        // 3. Crea una capa de grupo para los marcadores (facilita limpiarlos o actualizarlos después)
        this.markersGroup = L.layerGroup().addTo(this.map);
    }

    /**
     * Dibuja pines de ubicación en el mapa correspondientes a las direcciones institucionales.
     * @param {Array<Object>} locations - Lista de direcciones/patios con coordenadas
     */
    renderMarkers(locations) {
        if (!this.map || !this.markersGroup) return;

        // Limpia cualquier pin existente antes de redibujar
        this.markersGroup.clearLayers();

        locations.forEach(loc => {
            if (loc.ubicacion && loc.ubicacion.lat && loc.ubicacion.lng) {

                // Crea el marcador de Leaflet sutil
                const marker = L.marker([loc.ubicacion.lat, loc.ubicacion.lng]);

                // Diseña el globo de diálogo (Popup) al hacer clic en el pin usando estilos institucionales
                const popupContent = `
                    <div style="font-family: sans-serif; min-width: 150px;">
                        <h5 style="margin: 0 0 5px; color: #621132; font-size: 0.9rem; font-weight: bold;">
                            ${loc.siglas || 'SIPDUS'}
                        </h5>
                        <p style="margin: 0 0 3px; font-size: 0.8rem; color: #212529;">
                            <strong>${loc.nombre}</strong>
                        </p>
                        <p style="margin: 0; font-size: 0.75rem; color: #6C757D;">
                            <i class="fa-solid fa-location-dot"></i> ${loc.ubicacion.descripcion || 'Sin descripción de ubicación'}
                        </p>
                    </div>
                `;

                marker.bindPopup(popupContent);
                this.markersGroup.addLayer(marker);
            }
        });
    }
}