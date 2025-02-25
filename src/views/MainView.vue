<template>
    <div id="main-data" class="w-100 d-flex align-items-stretch">
      <!-- Contenedor Izquierdo -->
      <div class="w-35 p-3 d-flex flex-column">
        <!-- div para imagen y título -->
        <div class="header-container">
          <img :src="logo" :alt="logo" class="img-logo me-2" />
          <h1 class="titulo-principal">Seguimiento de Cotizaciones</h1>
        </div>
        <div class="d-flex gap-2 mb-2 form-group-small">
            <label class="lbl-dates">Fecha Inicio: </label>
            <input type="date" class="form-control inputdate" v-model="fechaInicio" id="fechaInicio" />
            <label class="lbl-dates">Fecha Fin: </label>
            <input type="date" class="form-control inputdate" v-model="fechaFin" id="fechaFin" />
            <button class="btn-ext" @click="handleGetEmails" >Extraer Correos</button>
        </div>
        <div class="d-flex gap-2 mb-3">
            <button class="btn-upd" @click="handleGetEstados">Actualizar Estado de Seguimiento</button>
            <button class="btn-load" @click="cargarDatosCotizacion">Cargar Datos</button>
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
              <tr v-for="email in email_list" :key="email.id" @click="selectEmail(email)" :class="{ 'selected-row': email.id === selectedEmailId }">
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
            <input type="text" class="form-control form-control-sm w-25" v-model="nit" />
            <button class="btn btn-info btn-sm w-75 ms-2 btn-buscar" @click="get_info_tercero">Buscar</button>
          </div>
          <label>Nombre:</label><input type="text" class="form-control form-control-sm mb-2" v-model="nombreTercero" readonly />
          <label>Coordinador:</label><input type="text" class="form-control form-control-sm mb-2" v-model="coordinadorTercero" readonly />
          <label>Ejecutivo:</label><input type="text" class="form-control form-control-sm mb-2" v-model="ejecutivoTercero" readonly />
          <label>Tipo de Cliente:</label><input type="text" class="form-control form-control-sm mb-2" v-model="tipoClienteTercero" readonly />
          <label>Zona:</label><input type="text" class="form-control form-control-sm mb-2" v-model="zonaTercero" readonly />
          <label>Fecha de Vencimiento:</label><input type="text" class="form-control form-control-sm mb-2" v-model="fechaVenc" readonly />
          <label>Nueva Fecha de Vencimiento:</label><input type="date" class="form-control form-control-sm mb-2" v-model="nuevaFechaVenc" />
          <label>Items a Cotizar:</label><input type="number" class="form-control form-control-sm mb-2" v-model="itemsCotizar" />
          <label>Estado:</label>
          <select id="selectEstados" class="form-control form-control-sm mb-2" v-model="selectEstados">
            <option disabled>Seleccione Estado</option>
            <option v-for="estado in lista_estados" :value="estado">{{ estado }}</option>
          </select>
          <hr>
        </div>
      </div>
      <!-- Contenedor Derecho -->
      <div class="w-65 p-3 d-flex flex-column">
        <div v-html="selectedBody" class="email-body mb-2"></div>
        <div class="mt-3 d-flex gap-2">
          <label>Número de Cotización:</label>
          <input type="text" class="form-control form-control-sm w-50" v-model="numero_cotizacion" />
          <button class="btn btn-info btn-sm w-75 ms-2 btn-buscar-cot" @click="consultarCotizacion">Buscar Cotización</button>
        </div>
        <hr>
        <div class="table-container">
          <table class="table table-bordered table-striped table-hover custom-table2 mb-3">
            <thead>
              <tr>
                <th></th>
                <th>Concepto de Cotización</th>
                <th>Estado</th>
                <th>Fecha de Entrega</th>
                <th>Usuario</th>
                <th>Pesos Cotizados</th>
                <th>Items Cotizados</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dato_coti in datos_cotizacion_list" :key="dato_coti.id">
                <td>{{ dato_coti.id }}</td>
                <td>{{ dato_coti.descripcion_concep1 }}</td>
                <td>{{ dato_coti.descripcion_concep2 }}</td>
                <td>{{ dato_coti.fecha_hora_entrega_str }}</td>
                <td>{{ dato_coti.usuario }}</td>
                <td>{{ dato_coti.pesos_cotizados }}</td>
                <td>{{ dato_coti.cantidad_filas }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-3 d-flex gap-2 align-items-center entrega-container">
          <label class="label-small">Oportunidad en la entrega:</label>
          <input type="text" class="form-control mb-2 input-small" v-model="dias_oportunidad" readonly/>
          <label class="label-small">Número de días de entrega:</label>
          <input type="text" class="form-control mb-2 input-small" v-model="dias_entrega" readonly/>
        </div>

        <div class="mt-3">
          <h6 class="titulo-seguimiento">SEGUIMIENTOS A LA COTIZACIÓN ANTERIOR</h6>
          <textarea class="form-control mt-2 area-seguimiento" v-model="seguimiento" readonly style="height: 150px; max-height: 150px;"></textarea>
        </div>
        <div class="d-flex gap-2 w-100">
          <button class="btn btn-danger btn-sm w-50 btn-limpiar" @click="limpiarCampos">Limpiar</button>
          <button class="btn btn-primary btn-sm w-50 btn-guardar" @click="guardarCotizacion">Guardar</button>
        </div>
      </div>
    </div>

    <!-- Modal de éxito -->
    <div class="modal fade" id="exitoModal" tabindex="-1" aria-labelledby="exitoModalLabel" aria-hidden="true" data-bs-backdrop="static" ref="exitoModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exitoModalLabel">{{ modalTitle }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>{{ msg }}</p>                    
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de pregunta -->
    <div class="modal fade" id="preguntaModal" tabindex="-1" aria-labelledby="preguntaModalLabel" aria-hidden="true" data-bs-backdrop="static" ref="preguntaModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="preguntaModalLabel">Registro Existente</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                {{msg}}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary btn-pregunta-modal" @click="actualizarCotizacion">Si</button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            </div>
            </div>
        </div>
    </div>

    <!-- Modal de error -->
    <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true" data-bs-backdrop="static" ref="errorModal">
      <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title" id="errorModalLabel">Error</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                  {{ errorMsg }}
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
              </div>
          </div>
      </div>
    </div>

    <!-- Overlay de carga -->
    <div v-if="loading" class="loading-overlay">
        <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 text-light">Procesando la información, por favor espere...</p>
    </div>

</template>

<script setup>

import DOMPurify from 'dompurify';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Modal } from 'bootstrap';
import logo from '@/assets/logo.png';

// Obtener la fecha actual y restarle un mes
const fechaInicio = ref(null);
const fechaInicioFormateada = ref(null);
const fechaFin = ref(null);
const fechaFinFormateada = ref(null);
const email_list = ref([]);
const datos_cotizacion_list = ref([]);
const selectedBody = ref('');
const selectedCorreo = ref('');
const selectedAsunto = ref('');
const selectedFechaHora = ref('');
const lista_estados = ref([]);
const selectEstados = ref(null);
const selectedEmailId = ref(null);

const nit = ref('');
const nombreTercero = ref('');
const coordinadorTercero = ref('');
const ejecutivoTercero = ref('');
const tipoClienteTercero = ref('');
const zonaTercero = ref('');
const fechaVenc = ref('');
const nuevaFechaVenc = ref('');
const itemsCotizar = ref('');

const cotizacion_concepto = ref('');
const estado = ref('');
const fecha_entrega = ref('');
const usuario_creador_cotizacion = ref('');
const pesos_cotizados = ref('');
const items_cotizados = ref('');

const numero_cotizacion = ref('');
const dias_oportunidad = ref('');
const dias_entrega = ref('');
const seguimiento = ref('');

const msg = ref('');
const modalTitle = ref('');
const modalInstance = ref(null);
const modalErrorInstance = ref(null);
const modalPreguntaInstance = ref(null);
const errorMsg = ref('');
const loading = ref(false);


// ✅ Función para realizar carga de pantalla de espera.
const handleGetEmails = async () => {
  try {
    loading.value = true; // Mostrar el spinner antes de la llamada API
      await get_emails(); // Llama a la función que obtiene los correos
  } catch (error) {
      console.error('Error al extraer correos:', error);
  } finally {
    loading.value = false; // Oculta el spinner al finalizar la operación
  }
};
// ✅ Función para realizar carga de seguimiento.
const handleGetEstados = async () => {
  try {
    loading.value = true; // Mostrar el spinner antes de la llamada API
      await actualizarEstadoSeguimiento(); // Llama a la función que obtiene los correos
  } catch (error) {
      console.error('Error al extraer correos:', error);
  } finally {
    loading.value = false; // Oculta el spinner al finalizar la operación
  }
};
// ✅ Consumo de api para obtener los correos de Graph
const get_emails = async () => {
  try {

    const [year, month, day] = fechaInicio.value.split("-");
    fechaInicioFormateada.value = `${day}-${month}-${year}`;

    const [yearff, monthff, dayff] = fechaFin.value.split("-");
    fechaFinFormateada.value = `${dayff}-${monthff}-${yearff}`;

    const response = await axios.post(
        // `${apiUrl}/params/get_clients`,
        `http://130.1.64.105:8000/get_emails`,
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
// ✅ Consumo de api para obtener informacion de terceos
const get_info_tercero = async () => {
  try {

    const response = await axios.post(
        // `${apiUrl}/params/get_clients`,
        `http://130.1.64.105:8000/get_tercero_x_nit`,
        {
          nit: nit.value,
          fecha: selectedFechaHora.value
        },
        {
            headers: {
                Accept: "application/json",
            }
        }
    );
    if (response.status === 200) {
        msg.value = response.data.message;
        nombreTercero.value = response.data.data.nombres
        coordinadorTercero.value = response.data.data.coordinador
        ejecutivoTercero.value = response.data.data.ejecutivo
        tipoClienteTercero.value = response.data.data.tipo_cliente
        zonaTercero.value = response.data.data.zona
        fechaVenc.value = response.data.data.fecha_vencimiento
    }

  } catch (error) {
      console.error('Error al cargar los datos:', error);
      modalErrorInstance.value.show();
      errorMsg.value = error.response.data.message;
  }
};
// ✅ Función para truncar el asunto (1 palabra + "...")
const truncateAsunto = (asunto) => {
  if (!asunto) return "";
  const words = asunto.split(" ");
  return words.length > 1 ? `${words[0]} ${words[1]}...` : asunto;
};
// ✅ Función para seleccionar el email y mostrar su body
const selectEmail = async (email) => {
  selectedEmailId.value = email.id;
  selectedBody.value = DOMPurify.sanitize(email.body) || '';  // Si no hay body, se muestra vacío
  selectedCorreo.value = email.remitente;
  selectedAsunto.value = email.asunto;
  selectedFechaHora.value = email.fecha_hora;
  
  if (nombreTercero.value !== '' && coordinadorTercero.value !== '') {
    await get_info_tercero();
  }
};
// ✅ Función para cargar los datos en el select de estados
const cargarDatos = async () => {
  try {
    const response = await axios.post(
        // `${apiUrl}/params/get_clients`,
        `http://130.1.64.105:8000/get_tipos_estado`, {},
        {
            headers: {
                Accept: "application/json",
            }
        }
    );
    if (response.status === 200) {
        msg.value = response.data.message;
        lista_estados.value = response.data.data
    }

    } catch (error) {
      console.error('Error al cargar los datos:', error);
      modalErrorInstance.value.show();
      errorMsg.value = error.response.data.message;
    }
};
// ✅ Consumo de api para consultar la información de una cotización
const consultarCotizacion = async () => {
  try {
    const response = await axios.post(
        // `${apiUrl}/params/get_clients`,
        `http://130.1.64.105:8000/consultar_cotizacion`, 
        {
          numero_cotizacion: numero_cotizacion.value,
          fecha: selectedFechaHora.value,
          fecha_vencimiento: fechaVenc.value
        },
        {
            headers: {
                Accept: "application/json",
            }
        }
    );
    if (response.status === 200) {
        msg.value = response.data.message;
        datos_cotizacion_list.value = response.data.data.cotizacion;
        dias_oportunidad.value = response.data.data.informacion_extra.dias_oportunidad;
        dias_entrega.value = response.data.data.informacion_extra.dias_entrega;
        seguimiento.value = response.data.data.informacion_extra.seguimiento;
    }

    } catch (error) {
      console.error('Error al cargar los datos:', error);
      modalErrorInstance.value.show();
      errorMsg.value = error.response.data.message;
    }
};
// ✅ Función para calcular la fecha hace un mes
const getFechaUnMesAtras = () => {
  const hoy = new Date();
  hoy.setMonth(hoy.getMonth() - 1); // Restar un mes
  return hoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD
};
// ✅ Función para obtener la fecha actual
const getFechaHoy = () => {
  return new Date().toISOString().split('T')[0];
};
// ✅ Función para limpiar los campos del formulario de cotización
const limpiarCampos = () => {
  nit.value = '';
  nombreTercero.value = '';
  coordinadorTercero.value = '';
  ejecutivoTercero.value = '';
  tipoClienteTercero.value = '';
  zonaTercero.value = '';
  fechaVenc.value = '';
  nuevaFechaVenc.value = '';
  itemsCotizar.value = '';
  selectEstados.value = '';
  numero_cotizacion.value = '';
  dias_oportunidad.value = '';
  dias_entrega.value = '';
  datos_cotizacion_list.value = '';
  seguimiento.value = '';
};
// ✅ Función para guardar una cotización
const guardarCotizacion = async () => {

  try {

      if (datos_cotizacion_list.value.length) {
        cotizacion_concepto.value = datos_cotizacion_list.value[0].descripcion_concep1;
        estado.value = datos_cotizacion_list.value[0].descripcion_concep2;
        fecha_entrega.value = datos_cotizacion_list.value[0].fecha_hora_entrega_str;
        usuario_creador_cotizacion.value = datos_cotizacion_list.value[0].usuario;
        pesos_cotizados.value = datos_cotizacion_list.value[0].pesos_cotizados;
        items_cotizados.value = datos_cotizacion_list.value[0].cantidad_filas;
      }

      const response = await axios.post(
        // `${apiUrl}/params/get_clients`,
        `http://130.1.64.105:8000/guardar_cotizacion`,
          {
            email_sender: selectedCorreo.value,
            email_subject: selectedAsunto.value,
            email_datetime: selectedFechaHora.value,
            nit: nit.value,
            nombre: nombreTercero.value,
            coordinador: coordinadorTercero.value,
            ejecutivo: ejecutivoTercero.value,
            tipo_cliente: tipoClienteTercero.value,
            zona: zonaTercero.value,
            fecha_vencimiento: fechaVenc.value,
            nueva_fecha_vencimiento: nuevaFechaVenc.value,
            items_a_cotizar: itemsCotizar.value,
            numero_cotizacion: numero_cotizacion.value,
            cotizacion_concepto: cotizacion_concepto.value,
            estado: selectEstados.value,
            fecha_entrega: fecha_entrega.value,
            usuario_creador_cotizacion: usuario_creador_cotizacion.value,
            pesos_cotizados: pesos_cotizados.value,
            items_cotizados: items_cotizados.value,
            oportunidad_entrega: dias_oportunidad.value,
            dias_entrega: dias_entrega.value
          },
          {
              headers: {
                  Accept: "application/json",
              }
          }
      );
      if (response.status === 200) {
        modalInstance.value.show();
        modalTitle.value = "Guardar";
        msg.value = response.data.message;
      }else if (response.status === 210) {
        modalPreguntaInstance.value.show();
        msg.value = response.data.message;
      }

    } catch (error) {
      console.error('Error al cargar los datos:', error);
      modalErrorInstance.value.show();
      errorMsg.value = error.response.data.message;
    }
};
// ✅ Función para actualizar una cotización
const actualizarCotizacion = async () => {

  try {

      if (datos_cotizacion_list.value.length) {
        cotizacion_concepto.value = datos_cotizacion_list.value[0].descripcion_concep1;
        estado.value = datos_cotizacion_list.value[0].descripcion_concep2;
        fecha_entrega.value = datos_cotizacion_list.value[0].fecha_hora_entrega_str;
        usuario_creador_cotizacion.value = datos_cotizacion_list.value[0].usuario;
        pesos_cotizados.value = datos_cotizacion_list.value[0].pesos_cotizados;
        items_cotizados.value = datos_cotizacion_list.value[0].cantidad_filas;
      }

      const response = await axios.post(
        // `${apiUrl}/params/get_clients`,
        `http://130.1.64.105:8000/actualizar_cotizacion`,
          {
            email_sender: selectedCorreo.value,
            email_subject: selectedAsunto.value,
            email_datetime: selectedFechaHora.value,
            nit: nit.value,
            nombre: nombreTercero.value,
            coordinador: coordinadorTercero.value,
            ejecutivo: ejecutivoTercero.value,
            tipo_cliente: tipoClienteTercero.value,
            zona: zonaTercero.value,
            fecha_vencimiento: fechaVenc.value,
            nueva_fecha_vencimiento: nuevaFechaVenc.value,
            items_a_cotizar: itemsCotizar.value,
            numero_cotizacion: numero_cotizacion.value,
            cotizacion_concepto: cotizacion_concepto.value,
            estado: selectEstados.value,
            fecha_entrega: fecha_entrega.value,
            usuario_creador_cotizacion: usuario_creador_cotizacion.value,
            pesos_cotizados: pesos_cotizados.value,
            items_cotizados: items_cotizados.value,
            oportunidad_entrega: dias_oportunidad.value,
            dias_entrega: dias_entrega.value
          },
          {
              headers: {
                  Accept: "application/json",
              }
          }
      );
      modalPreguntaInstance.value.hide();
      if (response.status === 200) {
          modalTitle.value = "Actualizar";
          msg.value = response.data.message;
          modalInstance.value.show();
      }

    } catch (error) {
      console.error('Error al cargar los datos:', error);
      modalErrorInstance.value.show();
      errorMsg.value = error.response.data.message;
    }
};
// ✅ Función para actualizar los estados de seguimiento
const actualizarEstadoSeguimiento = async () => {

  try {
      const response = await axios.post(
        // `${apiUrl}/params/get_clients`,
        `http://130.1.64.105:8000/actualizar_estado_seguimiento`,
          {
            email_list: email_list.value
          },
          {
              headers: {
                  Accept: "application/json",
              }
          }
      );
      if (response.status === 200) {
          msg.value = response.data.message;
          modalTitle.value = "Información"
          email_list.value = response.data.data;
      }

    } catch (error) {
      console.error('Error al cargar los datos:', error);
      modalErrorInstance.value.show();
      errorMsg.value = error.response.data.message;
    }
};
// ✅ Función cargar los datos de una cotizacion
const cargarDatosCotizacion = async () => {

  try {
    const response = await axios.post(
      // `${apiUrl}/params/get_clients`,
      `http://130.1.64.105:8000/cargar_datos_cotizacion`,
        {
          email_sender: selectedCorreo.value,
          email_subject: selectedAsunto.value,
          email_datetime: selectedFechaHora.value
        },
        {
            headers: {
                Accept: "application/json",
            }
        }
    );
    if (response.status === 200) {
        modalInstance.value.show();
        modalTitle.value = "Información";
        msg.value = response.data.message;
        nit.value = response.data.data.nit;
        nombreTercero.value = response.data.data.nombre;
        coordinadorTercero.value = response.data.data.coordinador;
        ejecutivoTercero.value = response.data.data.ejecutivo;
        tipoClienteTercero.value = response.data.data.tipo_cliente;
        zonaTercero.value = response.data.data.zona;
        selectEstados.value = response.data.data.estado;
        fechaVenc.value = response.data.data.fecha_vencimiento;
        itemsCotizar.value = response.data.data.items_a_cotizar;
        numero_cotizacion.value = response.data.data.numero_cotizacion;
    }

  } catch (error) {
    console.error('Error al cargar los datos:', error);
    modalErrorInstance.value.show();
    errorMsg.value = error.response.data.message;
  }
};

// Código que se ejecuta al montar el componente
onMounted(() => {
  modalInstance.value = new Modal(exitoModal);
  modalErrorInstance.value = new Modal(errorModal);
  modalPreguntaInstance.value = new Modal(preguntaModal);
  fechaInicio.value = getFechaUnMesAtras();
  fechaFin.value = getFechaHoy();
  cargarDatos();
});
</script>
  
<style scoped>

#main-data > div:first-child {
    width: 35%;
}
#main-data > div:last-child {
    width: 65%;
}

.header-container {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  text-align: center;
  padding: 10px 0;
}

.img-logo {
  width: 150px;
  height: 50px;
  object-fit: cover;
}

.titulo-principal {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.lbl-dates{
    align-self: center;
}

.table-container {
    max-height: 120px;
    overflow-y: auto;
}

/* --- Estilo general de la tabla --- */
.custom-table,
.custom-table2 {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px; /* ✅ Reducir tamaño de fuente */
}

/* --- Estilo del encabezado --- */
.custom-table thead,
.custom-table2 thead {
  background-color: #f0f0f0;
  font-size: 11px; /* ✅ Reducir tamaño del header */
  height: 30px; /* ✅ Reducir altura del header */
}

/* --- Celda del encabezado --- */
.custom-table th,
.custom-table2 th {
  background-color: #2777a4;
  color: white;
  padding: 5px;
  text-align: start;
  white-space: nowrap; /* ✅ Evitar saltos de línea en encabezado */
}

/* --- Celda del cuerpo de la tabla --- */
.custom-table td,
.custom-table2 td {
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

.selected-row {
  background-color: #cce5ff;  /* Azul suave */
  border: 1px solid #d0ebff;  /* Borde azul */
  font-weight: bold;
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

.email-body {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  overflow-y: auto;
  height: 600px;
  background-color: #f9f9f9;
  white-space: normal;
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
    font-size: 14px;
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

.btn-pregunta-modal{
  background-color: #2778bf;
  color: white;
  width: 100px;
}
.btn-pregunta-modal:hover{
  background-color: #5eaef5;
}
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7); /* Fondo oscuro */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999; /* Asegura que esté sobre todo */
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
