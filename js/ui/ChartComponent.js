/**
 * @file ChartComponent.js
 * @description Generador de la gráfica estadística circular (Doughnut Chart) mediante Chart.js.
 * 
 * NOTA PARA EL AGENTE DE SQL/PYTHON:
 * Espera que el JSON de estadísticas mantenga los conteos dentro de la clave 'totales'.
 */

export class ChartComponent {
    static chartInstance = null;

    /**
     * Dibuja una gráfica circular del inventario institucional en el canvas especificado.
     * @param {Object} stats - JSON de estadísticas globales
     * @param {string} canvasId - ID del canvas en el HTML ('mini-chart')
     */
    static renderDoughnut(stats, canvasId = 'mini-chart') {
        const ctx = document.getElementById(canvasId);
        if (!ctx || !stats || !stats.totales) return;

        // Si ya existía una gráfica previa (por ejemplo, en recargas dinámicas), se destruye
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const { totales } = stats;

        // Mapeo de categorías para la gráfica
        const labels = ['Vehículos', 'Maquinaria', 'Motocicletas', 'Remolques'];
        const dataValues = [
            totales.vehiculos || 0,
            totales.maquinaria || 0,
            totales.motocicletas || 0,
            totales.remolques || 0
        ];

        // Creación del gráfico Chart.js
        this.chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: dataValues,
                    backgroundColor: [
                        '#621132', // Guinda Oscuro
                        '#9D2449', // Guinda Claro
                        '#BC955C', // Dorado Oscuro
                        '#D4C19C'  // Dorado Claro
                    ],
                    borderWidth: 2,
                    borderColor: '#FFFFFF'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right', // Coloca la lista de categorías a la derecha
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return ` ${context.label}: ${context.raw} unidades`;
                            }
                        }
                    }
                },
                cutout: '65%' // Grosor del círculo interior
            }
        });
    }
}