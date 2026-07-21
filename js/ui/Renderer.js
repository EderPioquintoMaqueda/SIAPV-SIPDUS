/**
 * @file Renderer.js
 * @description Clase encargada de renderizar los elementos de la interfaz (HTML dinámico).
 * 
 * NOTA PARA EL AGENTE DE SQL/PYTHON:
 * Si cambia o agrega columnas en la base de datos que se usarán en la interfaz,
 * debe asegurarse de actualizar la plantilla de HTML de este archivo para mapear 
 * las propiedades equivalentes del JSON.
 */

export class Renderer {

    /**
     * Renderiza las tarjetas de los vehículos y maquinaria en el contenedor principal.
     * @param {Array<Object>} units - Arreglo de objetos de unidades obtenidos del repositorio
     * @param {string} containerId - ID del contenedor del DOM (por defecto 'units-list-container')
     */
    static renderUnits(units, containerId = 'units-list-container') {
        const container = document.getElementById(containerId);
        const countBadge = document.getElementById('units-count');

        if (!container) return;

        // Actualiza el contador de registros
        if (countBadge) {
            countBadge.textContent = `${units.length} ${units.length === 1 ? 'registro' : 'registros'}`;
        }

        // Si no se encontraron coincidencias en la búsqueda
        if (units.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted card-hover bg-white rounded-3 p-4 border border-1">
                    <i class="fa-solid fa-triangle-exclamation fa-3x mb-3 text-warning"></i>
                    <p class="m-0 fw-bold">Sin coincidencias encontradas</p>
                    <small>Intente buscar utilizando otros términos como placas, marca o número económico.</small>
                </div>
            `;
            return;
        }

        // Construcción del HTML utilizando Template Literals de ES6
        let htmlContent = '<div class="row g-3">';

        units.forEach(unit => {
            // Manejo seguro de fotografía o marcador alternativo (placeholder)
            const photoUrl = unit.fotografia || 'assets/img/unidades/placeholder.webp';

            // Determina la clase del badge según el estado
            const badgeClass = this.getBadgeClass(unit.estado);

            htmlContent += `
                <div class="col-12 col-md-6">
                    <div class="card card-hover border-0 shadow-sm p-3 unit-card ${unit.estado !== 'Activo' ? 'inactive' : ''}">
                        <div class="row g-2 align-items-center">
                            
                            <!-- Columna Foto -->
                            <div class="col-4">
                                <div class="unit-img-container">
                                    <img src="${photoUrl}" alt="${unit.marca} ${unit.modelo}" class="unit-img" onerror="this.src='https://placehold.co/200x120/E9ECEF/6C757D?text=Sin+Foto'">
                                </div>
                            </div>
                            
                            <!-- Columna Datos Críticos -->
                            <div class="col-8">
                                <div class="d-flex justify-content-between align-items-start mb-1">
                                    <span class="badge ${badgeClass} unit-badge">${unit.estado}</span>
                                    <span class="text-muted fw-bold" style="font-size: 0.8rem;">${unit.inv}</span>
                                </div>
                                <h4 class="h6 m-0 fw-bold text-dark">${unit.marca} ${unit.modelo} (${unit.anio})</h4>
                                <p class="text-muted m-0" style="font-size: 0.85rem;">Placas: <span class="text-dark fw-medium">${unit.placas || 'No Aplica'}</span></p>
                                <p class="text-muted m-0" style="font-size: 0.85rem;">Económico: <span class="text-dark fw-medium">${unit.num_economico || 'N/A'}</span></p>
                            </div>
                            
                            <!-- Fila de Detalles Rápidos en acordeón o grid -->
                            <div class="col-12 border-top mt-2 pt-2">
                                <div class="row text-center">
                                    <div class="col-4">
                                        <div class="spec-label">Tipo</div>
                                        <div class="spec-value text-truncate" title="${unit.subtipo || unit.tipo}">${unit.subtipo || unit.tipo}</div>
                                    </div>
                                    <div class="col-4 border-start border-end">
                                        <div class="spec-label">Transmisión</div>
                                        <div class="spec-value text-truncate">${unit.transmision || 'N/A'}</div>
                                    </div>
                                    <div class="col-4">
                                        <div class="spec-label">Combustible</div>
                                        <div class="spec-value text-truncate">${unit.combustible || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            `;
        });

        htmlContent += '</div>';
        container.innerHTML = htmlContent;
    }

    /**
     * Renderiza el bloque superior con las tarjetas estadísticas del dashboard.
     * @param {Object} stats - Estructura JSON del conteo estadístico global
     * @param {string} containerId - ID del contenedor HTML
     */
    static renderStats(stats, containerId = 'stats-container') {
        const container = document.getElementById(containerId);
        if (!container || !stats || !stats.totales) return;

        const { totales } = stats;

        container.innerHTML = `
            <!-- Vehículos -->
            <div class="col-6 col-sm-4 col-md-2">
                <div class="card border-0 shadow-sm p-3 text-center h-100 card-hover">
                    <div class="stat-card-title">Vehículos</div>
                    <div class="stat-card-number">${totales.vehiculos || 0}</div>
                </div>
            </div>
            <!-- Maquinaria -->
            <div class="col-6 col-sm-4 col-md-2">
                <div class="card border-0 shadow-sm p-3 text-center h-100 card-hover">
                    <div class="stat-card-title">Maquinaria</div>
                    <div class="stat-card-number">${totales.maquinaria || 0}</div>
                </div>
            </div>
            <!-- Motocicletas -->
            <div class="col-6 col-sm-4 col-md-2">
                <div class="card border-0 shadow-sm p-3 text-center h-100 card-hover">
                    <div class="stat-card-title">Motos</div>
                    <div class="stat-card-number">${totales.motocicletas || 0}</div>
                </div>
            </div>
            <!-- Remolques -->
            <div class="col-6 col-sm-4 col-md-2">
                <div class="card border-0 shadow-sm p-3 text-center h-100 card-hover">
                    <div class="stat-card-title">Remolques</div>
                    <div class="stat-card-number">${totales.remolques || 0}</div>
                </div>
            </div>
            <!-- Direcciones -->
            <div class="col-6 col-sm-4 col-md-2">
                <div class="card border-0 shadow-sm p-3 text-center h-100 card-hover">
                    <div class="stat-card-title">Direcciones</div>
                    <div class="stat-card-number text-secondary">${totales.direcciones || 0}</div>
                </div>
            </div>
            <!-- Resguardantes -->
            <div class="col-6 col-sm-4 col-md-2">
                <div class="card border-0 shadow-sm p-3 text-center h-100 card-hover">
                    <div class="stat-card-title">Resguardantes</div>
                    <div class="stat-card-number text-secondary">${totales.resguardantes || 0}</div>
                </div>
            </div>
        `;
    }

    /**
     * Mapea el estado del vehículo con la clase CSS correspondiente.
     * @param {string} status - Estado de la unidad (Activo, Mantenimiento, Baja)
     * @returns {string} Clase css del badge
     */
    static getBadgeClass(status) {
        switch (String(status).toLowerCase()) {
            case 'activo':
                return 'badge-activo';
            case 'mantenimiento':
                return 'badge-mantenimiento';
            case 'baja':
                return 'badge-baja';
            default:
                return 'bg-secondary text-white';
        }
    }
}