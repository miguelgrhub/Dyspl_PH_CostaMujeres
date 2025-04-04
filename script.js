// ==================== Variables globales ====================
let todaysRecords = [];        // Registros de today (data.json)
let tomorrowsRecords = [];     // Registros de tomorrow (data_2.json)
let currentDataset = "today";  // "today" o "tomorrow"
let currentRecords = [];       // Conjunto de registros actual
let currentPage = 1;           // Página actual
const itemsPerPage = 15;       // Registros por "página"
let totalPages = 1;            // Se calculará al cargar
let autoPageInterval = null;   // Intervalo para auto-cambiar página cada 10s

// ==================== Referencias a elementos del DOM ====================
const tableContainer = document.getElementById('table-container');
const mainTitle = document.getElementById('main-title');

// ==================== Cargar ambos JSON ====================
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Cargar data.json y data_2.json en paralelo
    const [todayResp, tomorrowResp] = await Promise.all([
      fetch('data.json'),
      fetch('data_2.json')
    ]);
    const todayData = await todayResp.json();
    const tomorrowData = await tomorrowResp.json();

    todaysRecords = todayData.template.content || [];
    tomorrowsRecords = tomorrowData.template.content || [];
    
    // Empezamos mostrando los registros de hoy
    currentDataset = "today";
    currentRecords = todaysRecords;
    totalPages = Math.ceil(currentRecords.length / itemsPerPage);
    updateTitle();
    renderTable();
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    tableContainer.innerHTML = `<p style="color:red;text-align:center;">Error loading data.</p>`;
  }
});

// ==================== Actualizar título según dataset ====================
function updateTitle() {
  if (currentDataset === "today") {
    mainTitle.innerText = "Today’s pick-up airport transfers";
  } else {
    mainTitle.innerText = "Tomorrow’s pick-up airport transfers";
  }
}

// ==================== Renderizar tabla con paginación auto ====================
function renderTable() {
  // Limpiar cualquier intervalo previo
  if (autoPageInterval) {
    clearInterval(autoPageInterval);
    autoPageInterval = null;
  }
  
  // Asegurarse de que currentRecords esté actualizado según el dataset actual
  currentRecords = (currentDataset === "today") ? todaysRecords : tomorrowsRecords;
  totalPages = Math.ceil(currentRecords.length / itemsPerPage);
  
  // Calcular índices de la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageRecords = currentRecords.slice(startIndex, endIndex);
  
  // Construir tabla HTML
  let tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Booking No.</th>
          <th>Flight No.</th>
          <th>Hotel</th>
          <th>Pick-Up time</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  pageRecords.forEach(item => {
    tableHTML += `
      <tr>
        <td>${item.id}</td>
        <td>${item.Flight}</td>
        <td>${item.HotelName}</td>
        <td>${item.Time}</td>
      </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  // Información de la página actual
  let pageInfoHTML = '';
  if (totalPages > 1) {
    pageInfoHTML = `<div class="auto-page-info">Page ${currentPage} of ${totalPages}</div>`;
  }
  
  tableContainer.innerHTML = tableHTML + pageInfoHTML;
  
  // Si hay más de una página, iniciar auto-paginación
  if (totalPages > 1) {
    startAutoPagination();
  }
}

// ==================== Auto-paginación cada 10 segundos ====================
function startAutoPagination() {
  autoPageInterval = setInterval(() => {
    currentPage++;
    if (currentPage > totalPages) {
      // Cambiar al otro dataset y reiniciar la página
      currentDataset = (currentDataset === "today") ? "tomorrow" : "today";
      updateTitle();
      currentPage = 1;
    }
    renderTable();
  }, 10000);
}
