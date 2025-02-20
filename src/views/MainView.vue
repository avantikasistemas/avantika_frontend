<template>
    <div id="main-data" class="w-100 d-flex align-items-stretch">
      <!-- Contenedor Izquierdo -->
      <div class="w-35 p-3 d-flex flex-column">
        <div class="d-flex gap-2 mb-2 form-group-small">
            <label class="lbl-dates">Fecha Inicio: </label>
            <input type="date" class="form-control inputdate" v-model="fechaInicio" id="fechaInicio" />
            <label class="lbl-dates">Fecha Fin: </label>
            <input type="date" class="form-control inputdate" v-model="fechaFin" id="fechaFin" />
            <button class="btn-ext" @click="get_emails" >Extraer Correos</button>
        </div>
        <div class="d-flex gap-2 mb-3">
            <button class="btn-upd">Actualizar Estado de Seguimiento</button>
            <button class="btn-load">Cargar Datos</button>
        </div>
        <div class="table-container">
          <table class="table table-bordered table-striped table-hover custom-table mb-3">
            <thead>
              <tr>
                <th></th>
                <th class="th-remitente">Remitente</th>
                <th>Asunto</th>
                <th>Fecha y hora</th>
                <th>Seguimiento</th>
              </tr>
            </thead>
            <tbody>
              <!-- <tr v-for="n in 10" :key="n"><td>Ejemplo {{ n }}</td><td>Asunto {{ n }}</td><td>03/01/2025</td><td>Estado {{ n }}</td></tr> -->
              <tr v-for="email in email_list" :key="email.id" @click="selectEmail(email)">
                <td>{{ email.id }}</td>
                <td>{{ email.remitente }}</td>
                <td>{{ truncateAsunto(email.asunto) }}</td>
                <td>{{ email.fecha_hora }}</td>
                <td>{{ email.seguimiento }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <label>NIT:</label>
          <div class="d-flex mb-2">
            <input type="text" class="form-control form-control-sm w-25" />
            <button class="btn btn-info btn-sm w-75 ms-2 btn-buscar">Buscar</button>
          </div>
          <label>Nombre:</label><input type="text" class="form-control form-control-sm mb-2" />
          <label>Coordinador:</label><input type="text" class="form-control form-control-sm mb-2" />
          <label>Ejecutivo:</label><input type="text" class="form-control form-control-sm mb-2" />
          <label>Tipo de Cliente:</label><input type="text" class="form-control form-control-sm mb-2" />
          <label>Zona:</label><input type="text" class="form-control form-control-sm mb-2" />
          <label>Fecha de Vencimiento:</label><input type="date" class="form-control form-control-sm mb-2" />
          <label>Nueva Fecha de Vencimiento:</label><input type="date" class="form-control form-control-sm mb-2" />
          <label>Items a Cotizar:</label><input type="text" class="form-control form-control-sm mb-2" />
          <label>Estado:</label>
          <select class="form-control form-control-sm mb-2">
            <option>Seleccione Estado</option>
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
        </div>

        <div class="mt-3 d-flex gap-2">
          <label>Número de Cotización:</label>
          <input type="text" class="form-control form-control-sm w-50" />
          <button class="btn btn-info btn-sm w-75 ms-2 btn-buscar-cot">Buscar Cotización</button>
        </div>

        <div class="table-container">
          <table class="table table-bordered table-striped table-hover mb-3">
            <thead>
              <tr>
                <th>Concepto de Cotización</th>
                <th>Estado</th>
                <th>Fecha de Entrega</th>
                <th>Usuario</th>
                <th>Pesos Cotizados</th>
                <th>Items Cotizados</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="n in 2" :key="n"><td>Concepto {{ n }}</td><td>Activo</td><td>04/01/2025</td><td>Usuario {{ n }}</td><td>$1000</td><td>5</td></tr>
            </tbody>
          </table>
        </div>

        <div class="mt-3 d-flex gap-2 align-items-center entrega-container">
          <label class="label-small">Oportunidad en la entrega:</label>
          <input type="text" class="form-control mb-2 input-small" />
          <label class="label-small">Número de días de entrega:</label>
          <input type="text" class="form-control mb-2 input-small" />
        </div>

        <div class="mt-3">
          <h6 class="titulo-seguimiento">SEGUIMIENTOS A LA COTIZACIÓN ANTERIOR</h6>
          <textarea class="form-control mt-2 area-seguimiento" readonly></textarea>
        </div>

      </div>
      <!-- Contenedor Derecho -->
      <div class="w-65 p-3 d-flex flex-column">
        <!-- <textarea class="form-control mb-2" v-model="selectedBody" style="height: 1200px;" readonly></textarea> -->
        <div v-html="selectedBody" class="email-body mb-2"></div>
        <div class="d-flex gap-2 w-100">
          <button class="btn btn-danger btn-sm w-50 btn-limpiar">Limpiar</button>
          <button class="btn btn-primary btn-sm w-50 btn-guardar">Guardar</button>
        </div>
      </div>
    </div>
</template>

<script setup>

import DOMPurify from 'dompurify';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Modal } from 'bootstrap';

// Obtener la fecha actual y restarle un mes
const fechaInicio = ref(null);
const fechaInicioFormateada = ref(null);
const fechaFin = ref(null);
const fechaFinFormateada = ref(null);
const email_list = ref([]);
const selectedBody = ref('');

const msg = ref('');
const modalInstance = ref(null);
const modalErrorInstance = ref(null);
const errorMsg = ref('');


const get_emails = async () => {
  try {

    const [year, month, day] = fechaInicio.value.split("-");
    fechaInicioFormateada.value = `${day}-${month}-${year}`;

    const [yearff, monthff, dayff] = fechaFin.value.split("-");
    fechaFinFormateada.value = `${dayff}-${monthff}-${yearff}`;

    const response = await axios.post(
        // `${apiUrl}/params/get_clients`,
        `http://localhost:8000/get_emails`,
        {
          start_date: fechaInicioFormateada.value,
          end_date: fechaFinFormateada.value,
        },
        {
            headers: {
                Accept: "application/json",
            }
        }
    );
    if (response.status === 200) {
        msg.value = response.data.message;
        email_list.value = response.data.data;
    }

  } catch (error) {
      console.error('Error al cargar los datos:', error);
      modalErrorInstance.value.show();
      errorMsg.value = error.response.data.message;
  }
};

// Función para truncar el asunto (1 palabra + "...")
const truncateAsunto = (asunto) => {
  if (!asunto) return "";
  const words = asunto.split(" ");
  return words.length > 1 ? `${words[0]} ${words[1]}...` : asunto;
};

// ✅ Función para seleccionar el email y mostrar su body
const selectEmail = (email) => {
  selectedBody.value = DOMPurify.sanitize(email.body) || '';  // Si no hay body, se muestra vacío
};

// Función para calcular la fecha hace un mes
const getFechaUnMesAtras = () => {
  const hoy = new Date();
  hoy.setMonth(hoy.getMonth() - 1); // Restar un mes
  return hoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD
};
// Función para obtener la fecha actual
const getFechaHoy = () => {
  return new Date().toISOString().split('T')[0];
};

// Código que se ejecuta al montar el componente
onMounted(() => {
  // modalInstance.value = new Modal(exitoModal);
  // modalErrorInstance.value = new Modal(errorModal);
  fechaInicio.value = getFechaUnMesAtras();
  fechaFin.value = getFechaHoy();
});
</script>
  
<style scoped>

#main-data > div:first-child {
    width: 35%;
}
#main-data > div:last-child {
    width: 65%;
}

.lbl-dates{
    align-self: center;
}

.table-container {
    max-height: 150px;
    overflow-y: auto;
}

/* --- Estilo general de la tabla --- */
.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px; /* ✅ Reducir tamaño de fuente */
}

/* --- Estilo del encabezado --- */
.custom-table thead {
  background-color: #f0f0f0;
  font-size: 11px; /* ✅ Reducir tamaño del header */
  height: 30px; /* ✅ Reducir altura del header */
}

/* --- Celda del encabezado --- */
.custom-table th {
  padding: 5px;
  text-align: start;
  white-space: nowrap; /* ✅ Evitar saltos de línea en encabezado */
}

/* --- Celda del cuerpo de la tabla --- */
.custom-table td {
  padding: 4px 5px;
  text-align: start;
  vertical-align: middle;
  border: 1px solid #ddd;
  white-space: nowrap; /* ✅ Evitar saltos de línea */
  overflow: hidden; /* ✅ Evitar desbordamiento */
  text-overflow: ellipsis; /* ✅ Mostrar "..." si el texto es largo */
}

/* ✅ Ajustar el ancho de las columnas específicas */
.custom-table td:nth-child(2), 
.custom-table th:nth-child(2) {
  width: 130px !important;  /* ✅ Forzar el ancho de la columna Remitente */
  max-width: 130px !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.custom-table td:nth-child(3) {
  width: 150px; /* Asunto: Ancho fijo */
}
.custom-table td:nth-child(4) {
  width: 150px; /* Fecha: Ancho fijo */
}
.custom-table td:nth-child(5) {
  width: 150px; /* Seguimiento: Ancho personalizado */
}

label {
    font-size: 12px;
    font-weight: bold;
}

.inputdate {
    width: 140px;
    height: 40px;
}

.btn-ext{
    width: 104px;
    height: 40px;
    background-color: #2778bf;
    color: white;
    border-radius: 5px;
}
.btn-ext:hover{
    background-color: #5eaef5;
}
.btn-upd{
    width: 208px;
    height: 40px;
    background-color: gray;
    color: white;
    border-radius: 5px;
}
.btn-upd:hover{
    background-color: #bcbcbc;
}
.btn-load{
    width: 91px;
    height: 40px;
    background-color: green;
    color: white;
    border-radius: 5px;
}
.btn-load:hover{
    background-color: #02c502;
}

.btn-buscar{
    background-color: #2778bf;
    color: white;
}
.btn-buscar:hover{
    background-color: #5eaef5;
}

.btn-buscar-cot{
    background-color: #2778bf;
    color: white;
}
.btn-buscar-cot:hover{
    background-color: #5eaef5;
    color: white;
}

.titulo-seguimiento {
    background-color: #2778bf;
    color: white;
    font-size: medium;
}
.area-seguimiento{
    height: 50px;
}

.email-body {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  overflow-y: auto;
  height: 1200px;
  background-color: #f9f9f9;
  white-space: normal;
}

.btn-limpiar {
    background-color: #940404;
    color: white;
}
.btn-limpiar:hover{
    background-color: #f84f4f;
}
.btn-guardar {
    background-color: #2778bf;
    color: white;
}
.btn-guardar:hover {
    background-color: #5eaef5;
}

button {
    font-size: small;
}

.label-small {
    white-space: nowrap;
    font-size: 12px;
    font-weight: bold;
}
.input-small {
    width: 100px;
}
@media (max-width: 1280px) {

    .btn-ext{
        width: 70px;
        height: 45px;
        background-color: #2778bf;
        color: white;
        border-radius: 5px;
    }
    .btn-upd{
        width: 208px;
        height: 40px;
        background-color: gray;
        color: white;
        border-radius: 5px;
    }
    .btn-load{
        width: 91px;
        height: 40px;
        background-color: green;
        color: white;
        border-radius: 5px;
    }
    .entrega-container {
        flex-direction: column;
        align-items: flex-start;
    }
    .entrega-container input, .entrega-container label {
        width: 100% !important;
    }
}

</style>
  