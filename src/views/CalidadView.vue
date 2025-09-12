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
        <div class="d-flex gap-2 mb-3 align-items-center">
            <button class="btn-upd" @click="handleGetEstados">Actualizar Estado de Seguimiento</button>
            <button class="btn-load" @click="cargarDatosCotizacion">Cargar Datos</button>
            <button class="btn btn-outline-primary ms-auto btn-router-link" @click="abrirModalSeguimiento">
              <i class="bi bi-calendar-plus me-1"></i>
              Programar Seguimiento
            </button>
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
                <td :title="email.remitente">{{ email.remitente }}</td>
                <td :title="email.asunto">{{ truncateAsunto(email.asunto) }}</td>
                <td>{{ email.fecha_hora }}</td>
                <td>{{ email.seguimiento }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <label>NIT:</label>
          <div class="grupo-busqueda">
            <div class="w-75">
              <input 
                  type="text" 
                  class="form-control form-control-sm w-100" 
                  v-model="nit" 
                  @focus="mostrarLista = true" 
                  @blur="ocultarLista"
              >
              <ul v-if="mostrarLista && terceros_list.length" class="dropdown-list">
                  <li v-for="ter in terceros_list" :key="ter.nit" @mousedown="seleccionarTercero(ter)">
                      {{ ter.nit }} - {{ ter.nombres }} - {{ ter.zona }}
                  </li>
              </ul>
            </div>
            <div class="w-25">
              <button class="btn btn-info btn-sm w-100 ms-2 btn-buscar" @click="get_info_tercero">Buscar</button>
            </div>
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
          <label  v-if="selectEstados === 'NO SE COTIZA'">Motivo de no cotización:</label>
          <textarea 
            v-if="selectEstados === 'NO SE COTIZA'" 
            class="form-control mt-2" 
            v-model="motivo_no_cotizacion">
          </textarea>
          <div class="d-flex align-items-end gap-2 flex-wrap">
            <label>Desvío de Oportunidad:</label>
            <textarea class="form-control mt-2" v-model="desvio_oportunidad"></textarea>
            <div class="d-flex flex-column">
              <label style="font-size:12px;">Autorización desvío de Oportunidad</label>
              <select class="form-control form-control-sm" v-model="autorizacion_desvio_oportunidad">
                <option value="" disabled>Seleccione</option>
                <option value="1">SI</option>
                <option value="0">NO</option>
              </select>
            </div>
          </div>
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

        <div class="d-flex gap-2 align-items-center entrega-container">
          <label class="label-small">Oportunidad en la entrega:</label>
          <input type="text" class="form-control mb-2 input-small" v-model="dias_oportunidad" readonly/>
          <label class="label-small">Número de días de entrega:</label>
          <input type="text" class="form-control mb-2 input-small" v-model="dias_entrega" readonly/>
        </div>

        <hr>
        <h6 class="titulo-calidad">Desvío de Calidad</h6>
        <div class="d-flex gap-2 align-items-center entrega-container">
          <label class="label-small">Item revisado que cumple criterio:</label>
          <input type="number" class="form-control mb-2 input-small" v-model="item_revisado_cumple" />
          <label class="label-small">Item revisado (Muestra):</label>
          <input type="number" class="form-control mb-2 input-small" v-model="item_revisado_muestra" />
          <span>{{ porcentajeCalculo }} %</span>
        </div>

        <div class="d-flex align-items-end gap-2 mt-3 flex-wrap">
          <label>Desvío de Calidad:</label><textarea class="form-control mt-2" v-model="desvio_calidad"></textarea>
          <div class="d-flex flex-column">
            <label style="font-size:12px;">Autorización desvío de Calidad</label>
            <select class="form-control form-control-sm" v-model="autorizacion_desvio_calidad">
              <option value="" disabled>Seleccione</option>
              <option value="1">SI</option>
              <option value="0">NO</option>
            </select>
          </div>
        </div>

        <div class="mt-3">
          <h6 class="titulo-seguimiento">Seguimientos a la Cotización Anterior</h6>
          <textarea class="form-control mt-2 area-seguimiento" v-model="seguimiento" readonly></textarea>
        </div>
        <div class="d-flex gap-2 w-100">
          <button class="btn btn-danger btn-sm w-50 btn-limpiar" @click="limpiarCampos">Limpiar</button>
          <button class="btn btn-primary btn-sm w-50 btn-guardar" @click="guardarCotizacion" :disabled="spinnerLoading">
            <span v-if="spinnerLoading" class="spinner-border spinner-border-sm"></span>
                {{ spinnerLoading ? 'Guardando...' : 'Guardar' }}
          </button>
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

    <!-- Modal de mensaje de que se programó el seguimiento  -->
    <div class="modal fade" id="exitoModal2" tabindex="-1" aria-labelledby="exitoModal2Label" aria-hidden="true" data-bs-backdrop="static" ref="exitoModal2">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exitoModal2Label">Guardar Seguimiento</h5>
                    <!-- <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
                </div>
                <div class="modal-body">
                    <p>Se creará un seguimiento para el día {{ siguienteDiaHabil }}.</p>
                    <!-- Nuevo campo de hora -->
                    <div class="mb-3">
                      <label for="horaSeguimiento" class="form-label">Hora:</label>
                      <input id="horaSeguimiento" type="time" class="form-control" v-model="horaSeguimiento" />
                    </div>
                    <!-- Nuevo select -->
                    <div class="mb-3">
                      <label for="modal_contactos" class="form-label">Contacto:</label>
                      <select id="modal_contactos" class="form-select" v-model="modal_contacto_seleccionado">
                        <option :value="null" disabled>Seleccione una opción...</option>
                        <option v-for="contac in modal_contactos" :key="contac.tel_celular" :value="contac.tel_celular + ' - ' + contac.nombre">
                          {{ contac.nombre }} - {{ contac.tel_celular }}
                        </option>
                      </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary btn-guardar-seguimiento" data-bs-dismiss="modal" @click="guardarSeguimientoDesdeMain">Guardar Seguimiento</button>
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
            <span class="visually-hidden"></span>
        </div>
        <p class="mt-2 text-light">{{ loading_msg }}</p>
    </div>

    <!-- Modal Programar Seguimiento -->
    <div class="modal fade" id="modalSeguimiento" tabindex="-1" aria-labelledby="modalSeguimientoLabel" aria-hidden="true" ref="modalSeguimiento">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalSeguimientoLabel">Programar Seguimiento</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Nuevo contenedor -->
            <div class="contenedor-programar-seguimiento">
              <div class="contenedor-formulario-seguimiento">
                  <h4 class="titulo-programar-seguimiento">Programar seguimientos</h4>
                  <form @submit.prevent="buscarCotizacion">
                    <div class="grupo-cotizacion mb-3">
                      <label for="num_cotizacion" class="mb-2">N° Cotización:</label>
                      <div class="input-group">
                        <input id="num_cotizacion" type="text" class="form-control" v-model="num_cotizacion" />
                        <button type="submit" class="btn btn-buscar-cot" title="Buscar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="icono-buscar" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242 1.398a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </form>
              </div>

              <!-- Nueva sección para mostrar la información -->
              <div v-if="cotizacionInfo" class="info-cotizacion ms-5 info-cotizacion-compacta">
                <h5 class="titulo-info-cotizacion">Información Cotización</h5>
                <div class="row row-compacta">
                  <div class="col-6 mb-2">
                    <strong>NIT:</strong> <span>{{ cotizacionInfo.nit }}</span>
                  </div>
                  <div class="col-6 mb-2">
                    <strong>Nombre:</strong> <span>{{ cotizacionInfo.nombre_tercero }}</span>
                  </div>
                  <div class="col-6 mb-2">
                    <strong>Valor:</strong> <span>${{ cotizacionInfo.Pesos_cotizados }}</span>
                  </div>
                  <div class="col-6 mb-2">
                    <strong>Usuario:</strong> <span>{{ cotizacionInfo.usuario }}</span>
                  </div>
                  <div class="col-6 mb-2">
                    <strong>Concepto:</strong> <span>{{ cotizacionInfo.descripcion_concep1 }}</span>
                  </div>
                  <div class="col-6 mb-2">
                    <strong>Estado:</strong> <span>{{ cotizacionInfo.descripcion_concep2 }}</span>
                  </div>
                  <div class="col-6 mb-2">
                    <strong>Entrega:</strong> <span>{{ cotizacionInfo.fecha_hora_entrega }}</span>
                  </div>
                </div>
              </div>
            </div>

            <hr v-if="cotizacionInfo">

            <div class="segundo-contenedor">
              <div v-if="cotizacionInfo" class="contenedor-programar-seguimiento">
                <div class="contenedor-formulario-seguimiento">
                    <form @submit.prevent="guardar_seguimiento(false)">
                      <div class="grupo-cotizacion mb-3">
                        <label for="fecha_programacion" class="mb-2">Fecha y hora seguimiento:</label>
                        <input id="fecha_programacion" type="datetime-local" class="form-control form-control-sm mb-3" v-model="fecha_programacion" />
                      </div>
                      <div class="grupo-cotizacion mb-3">
                        <label for="tipo_seguimiento" class="mb-2">Tipo de Seguimiento:</label>
                        <select id="tipo_seguimiento" class="form-control form-control-sm mb-3" v-model="tipo_seguimiento_seleccionado">
                          <option value="null">Seleccione una opción</option>
                          <option v-for="tipo in tipo_seguimiento" :key="tipo.id" :value="tipo.id">
                            {{ tipo.nombre }}
                          </option>
                        </select>
                      </div>
                      <div class="grupo-cotizacion mb-3">
                        <label for="contacto" class="mb-2">Contacto:</label>
                        <select id="contacto" class="form-control form-control-sm mb-3" v-model="contacto_seleccionado">
                          <option value="null">Seleccione una opción</option>
                          <option v-for="contacto in contactos" :key="contacto.tel_celular" :value="contacto.tel_celular + ' - ' + contacto.nombre">
                            {{ contacto.nombre }} - {{ contacto.tel_celular }}
                          </option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        class="btn btn-primary w-100 btn-sm btn-modal-guardar"
                        :disabled="resultado_seguimiento === 5 || resultado_seguimiento === 6 || resultado_seguimiento === 7 || !puedeGuardarSeguimiento"
                      >Programar Seguimiento</button>
                    </form>
                </div>
              </div>
              <!-- Nuevo div con tabla debajo del formulario de seguimiento -->
              <div v-if="cotizacionInfo" class="contenedor-tabla-seguimientos">
                <h5>Seguimientos Programados</h5>
                <table class="table table-bordered table-striped tabla-seguimiento-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cotización</th>
                      <th>Fecha Programación</th>
                      <th>Usuario</th>
                      <th>Tipo Seguimiento</th>
                      <th>Contacto</th>
                      <th>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="cotizacionHistoria.length === 0">
                      <td colspan="8" class="text-center">No hay seguimientos programados.</td>
                    </tr>
                    <tr v-for="(item, idx) in cotizacionHistoria" :key="item.id || idx">
                      <td>{{ item.index }}</td>
                      <td>{{ item.numero }}</td>
                      <td>{{ item.fecha_programacion }}</td>
                      <td>{{ item.usuario }}</td>
                      <td>{{ item.tipo_seguimiento }}</td>
                      <td>{{ item.contacto }}</td>
                      <td>
                        <select
                          class="form-select form-select-sm"
                          v-model="item.resultado_seguimiento"
                          :disabled="item.bloqueado"
                          @change="onResultadoSeguimientoChange(item)"
                        >
                          <option value="null" >Seleccione</option>
                          <option v-for="resultado in tipo_resultado_llamada" :key="resultado.id" :value="resultado.id">
                            {{ resultado.nombre }}
                          </option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <hr v-if="cotizacionInfo">

            <div v-if="mostrarMotivoNoAdjudicacion" class="row px-3">
              <div class="col-md-4 mb-3">
                <label for="motivo_no_adjudicacion" class="form-label">Motivo de NO Adjudicación</label>
                <select id="motivo_no_adjudicacion" v-model="motivo_no_adjudicacion" class="form-select" :disabled="camposNoAdjudicacionBloqueados">
                  <option value="null">Seleccione una opción</option>
                  <option v-for="motivo in listado_motivos_no_adjudicacion" :key="motivo.id" :value="motivo.id">
                    {{ motivo.nombre }}
                  </option>
                </select>
              </div>
              <div class="col-md-2 mb-3 text-end" v-if="!camposNoAdjudicacionBloqueados">
                <button class="btn btn-success w-100" @click="guardarMotivoNoAdjudicacion">Guardar</button>
              </div>
            </div>

            <div v-if="mostrarComentario" class="row px-3 align-items-end mt-3">
              <div class="col-md-10 mb-3">
                <label for="comentario" class="form-label">Comentario:</label>
                <textarea id="comentario" v-model="comentario" class="form-control" rows="2" placeholder="Escriba el comentario..." ></textarea>
              </div>
              <div class="col-md-2 mb-3 text-end">
                <button class="btn btn-success w-100" @click="actualizarResultadoLlamada(selectedItem)">Guardar</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

</template>

<script setup>

import DOMPurify from 'dompurify';
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import { Modal } from 'bootstrap';
import logo from '@/assets/logo.png';
import apiUrl from "../../config.js";

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

const motivo_no_cotizacion = ref('');
const desvio_oportunidad = ref('');
const desvio_calidad = ref('');
const autorizacion_desvio_oportunidad = ref(null);
const autorizacion_desvio_calidad = ref(null);

const numero_cotizacion = ref('');
const dias_oportunidad = ref('');
const dias_entrega = ref('');
const seguimiento = ref('');

const mostrarLista = ref(false);
const tercerosBusqueda = ref("");
const tercerosNit = ref("");
const terceros_list = ref([]);

const item_revisado_cumple = ref(0);
const item_revisado_muestra = ref(0);

const msg = ref('');
const modalTitle = ref('');
const modalInstance = ref(null);
const modalInstance2 = ref(null);
const modalErrorInstance = ref(null);
const modalPreguntaInstance = ref(null);
const modalSeguimiento = ref(null);
const errorMsg = ref('');
const loading = ref(false);
const loading_msg = ref('');
const spinnerLoading = ref(false);

const num_cotizacion = ref('');
const fecha_programacion = ref('');
const cotizacionInfo = ref(null);
const seguimientoInfo = ref(null);
const cotizacionHistoria = ref([]);
const cotizacionHistoriaOriginal = ref([]);
const tipo_seguimiento = ref([]);
const tipo_seguimiento_seleccionado = ref(null);
const contacto_seleccionado = ref(null);
const contactos = ref([]);
const tipo_resultado_llamada = ref([]);
const listado_motivos_no_adjudicacion = ref([]);
const resultado_seguimiento = ref(null);

const razon_no_adjudicacion = ref(null);
const motivo_no_adjudicacion = ref('');
const comentario_en_estudio = ref(null);
const comentario_no_contesta = ref(null);
const comentario_llamar_mas_tarde = ref(null);
const comentario_reprogramar_llamada = ref(null);
const comentario_no_confirmado = ref(null);
const comentario_presentado_plataforma = ref(null);
const comentario = ref(null);

const mostrarMotivoNoAdjudicacion = ref(false);
const mostrarEnEstudio = ref(false);
const mostrarNoContesta = ref(false);
const mostrarLlamarMasTarde = ref(false);
const mostrarReprogramarLlamada = ref(false);
const mostrarNoConfirmado = ref(false);
const mostrarPresentadoPlataforma = ref(false);
const mostrarComentario = ref(false);

const camposNoAdjudicacionBloqueados = ref(false);
const camposEnEstudioBloqueados = ref(false);
const camposNocontestaBloqueados = ref(false);
const camposLlamarMasTardeBloqueados = ref(false);
const camposReprogramarLlamadaBloqueados = ref(false);
const camposNoConfirmadoBloqueados = ref(false);
const camposPresentadoPlataformaBloqueados = ref(false);

const fechaActual = ref('')
const siguienteDiaHabil = ref('')
const horaSeguimiento = ref('');
const modal_contacto_seleccionado = ref(null);
const modal_contactos = ref([]);
const flag_mod = ref(true);
const selectedItem = ref(null);

const puedeGuardarSeguimiento = computed(() => {
  if (!cotizacionHistoriaOriginal.value || !cotizacionHistoriaOriginal.value.length) return true;
  const ultimoOriginal = cotizacionHistoriaOriginal.value[cotizacionHistoriaOriginal.value.length - 1];
  if (!ultimoOriginal) return true;
  // Bloquear si el último registro no tiene resultado válido en la respuesta original
  return ultimoOriginal.resultado_seguimiento !== null && ultimoOriginal.resultado_seguimiento !== '' && ultimoOriginal.resultado_seguimiento !== 'null' && ultimoOriginal.resultado_seguimiento !== 'Seleccione';
});

const abrirModalSeguimiento = () => {
  num_cotizacion.value = ''; // Limpiar el número de cotización
  cotizacionInfo.value = null; // Limpiar la información de la cotización
  if (numero_cotizacion.value) {
    num_cotizacion.value = numero_cotizacion.value;
    buscarCotizacion();
  }

  const modal = new Modal(modalSeguimiento.value, {
    backdrop: 'static'
  });
  modal.show();
};

const onResultadoSeguimientoChange = (item) => {
  if (item.resultado_seguimiento !== null || item.resultado_seguimiento !== "null") {
    mostrarComentario.value = true;
  } else {
    mostrarComentario.value = false;
  }
  selectedItem.value = item;
};

const guardarSeguimientoDesdeMain = async () => {
  try {
    const response = await axios.post(
        `${apiUrl}/guardar_seguimiento_desde_principal`,
          {
            email_sender: selectedCorreo.value,
            email_subject: selectedAsunto.value,
            email_datetime: selectedFechaHora.value,
            numero_cotizacion: numero_cotizacion.value,
            usuario_creador_cotizacion: usuario_creador_cotizacion.value,
            fecha_programacion: siguienteDiaHabil.value,
            hora_programacion: horaSeguimiento.value,
            contacto: modal_contacto_seleccionado.value
          },
          {
              headers: {
                  Accept: "application/json"
              }
          }
      );
      if (response.status === 200) {
        alert("Seguimiento programado exitosamente.");
        // modalInstance.value.show();
        // modalTitle.value = "Guardar";
        // msg.value = response.data.message;
        await consultarCotizacion();
      }

    } catch (error) {
      console.error('Error al cargar los datos:', error);
      modalErrorInstance.value.show();
      errorMsg.value = error.response.data.message;
    } 
};

// ✅ Función para realizar carga de pantalla de espera.
const handleGetEmails = async () => {
  try {
    loading.value = true; // Mostrar el spinner antes de la llamada API
    loading_msg.value = 'Extrayendo correos, por favor espere...';
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
    loading_msg.value = 'Actualizando estados, por favor espere...';
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
        `${apiUrl}/get_emails`,
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
        `${apiUrl}/get_tercero_x_nit`,
        {
          nit: nit.value.toString(),
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
        `${apiUrl}/get_tipos_estado`, {},
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
        `${apiUrl}/consultar_cotizacion`, 
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
  hoy.setDate(1); // Establecer el día en 1
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
  datos_cotizacion_list.value = [];
  seguimiento.value = '';
  selectedBody.value = '';
  motivo_no_cotizacion.value = '';
  desvio_oportunidad.value = '';
  item_revisado_cumple.value = 0;
  item_revisado_muestra.value = 0;
  desvio_calidad.value = '';
  tercerosBusqueda.value = '';
  tercerosNit.value = '';
  autorizacion_desvio_oportunidad.value = null;
  autorizacion_desvio_calidad.value = null;
  cotizacion_concepto.value = '';
  estado.value = '';
  fecha_entrega.value = '';
  usuario_creador_cotizacion.value = '';
  pesos_cotizados.value = '';
  items_cotizados.value = '';
};

const validarModal2 = async () => {
  if (selectEstados.value === 'COT. ADJUDICACION') {

    try {
      const response = await axios.post(
        `${apiUrl}/obtener_contactos`,
        {
          nit: nit.value
        },
        {
            headers: {
                Accept: "application/json",
            }
        }
      )
      if (response.status === 200) {
        modal_contactos.value = response.data.data
      }
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      modalErrorInstance.value.show();
      errorMsg.value = error.response.data.message;
    }

    modalInstance.value.hide();
    modalInstance2.value.show();
  }
};

// ✅ Función para guardar una cotización
const guardarCotizacion = async () => {

  try {

      if (itemsCotizar.value == '' || itemsCotizar.value == null) {
        errorMsg.value = 'Items a cotizar no debe estar vacío.';
        modalErrorInstance.value.show();
        return
      }

      if (selectEstados.value === 'NO SE COTIZA' && (motivo_no_cotizacion.value == '' || motivo_no_cotizacion.value == null)) {
        errorMsg.value = 'Motivo de NO cotización no debe estar vacío.';
        modalErrorInstance.value.show();
        return
      }

      spinnerLoading.value = true; // Activar la espera

      if (datos_cotizacion_list.value.length) {
        cotizacion_concepto.value = datos_cotizacion_list.value[0].descripcion_concep1;
        estado.value = datos_cotizacion_list.value[0].descripcion_concep2;
        fecha_entrega.value = datos_cotizacion_list.value[0].fecha_hora_entrega_str;
        usuario_creador_cotizacion.value = datos_cotizacion_list.value[0].usuario;
        pesos_cotizados.value = datos_cotizacion_list.value[0].pesos_cotizados;
        items_cotizados.value = datos_cotizacion_list.value[0].cantidad_filas;
      }

      const response = await axios.post(
        `${apiUrl}/guardar_cotizacion`,
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
            dias_entrega: dias_entrega.value,
            motivo_no_cotizacion: motivo_no_cotizacion.value,
            desvio_oportunidad: desvio_oportunidad.value,
            item_revisado_cumple: item_revisado_cumple.value,
            item_revisado_muestra: item_revisado_muestra.value,
            porcentaje_muestra: porcentajeCalculo.value,
            desvio_calidad: desvio_calidad.value,
            autorizacion_desvio_oportunidad: autorizacion_desvio_oportunidad.value,
            autorizacion_desvio_calidad: autorizacion_desvio_calidad.value
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
    } finally {
        spinnerLoading.value = false; // Desactivar la espera
    }
};
// ✅ Función para actualizar una cotización
const actualizarCotizacion = async () => {

  try {

      if (itemsCotizar.value == '' || itemsCotizar.value == null) {
        errorMsg.value = 'Items a cotizar no debe estar vacío.';
        modalErrorInstance.value.show();
        return
      }

      if (selectEstados.value === 'NO SE COTIZA' && (motivo_no_cotizacion.value == '' || motivo_no_cotizacion.value == null)) {
        errorMsg.value = 'Motivo de NO cotización no debe estar vacío.';
        modalErrorInstance.value.show();
        return
      }

      if (datos_cotizacion_list.value.length) {
        cotizacion_concepto.value = datos_cotizacion_list.value[0].descripcion_concep1;
        estado.value = datos_cotizacion_list.value[0].descripcion_concep2;
        fecha_entrega.value = datos_cotizacion_list.value[0].fecha_hora_entrega_str;
        usuario_creador_cotizacion.value = datos_cotizacion_list.value[0].usuario;
        pesos_cotizados.value = datos_cotizacion_list.value[0].pesos_cotizados;
        items_cotizados.value = datos_cotizacion_list.value[0].cantidad_filas;
      }

      const response = await axios.post(
        `${apiUrl}/actualizar_cotizacion`,
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
            dias_entrega: dias_entrega.value,
            motivo_no_cotizacion: motivo_no_cotizacion.value,
            desvio_oportunidad: desvio_oportunidad.value,
            item_revisado_cumple: item_revisado_cumple.value,
            item_revisado_muestra: item_revisado_muestra.value,
            porcentaje_muestra: porcentajeCalculo.value,
            desvio_calidad: desvio_calidad.value,
            autorizacion_desvio_oportunidad: autorizacion_desvio_oportunidad.value,
            autorizacion_desvio_calidad: autorizacion_desvio_calidad.value
          },
          {
              headers: {
                  Accept: "application/json",
              }
          }
      );
      modalPreguntaInstance.value.hide();
      if (response.status === 200) {
          flag_mod.value = response.data.data;
          modalTitle.value = "Actualizar";
          msg.value = response.data.message;
          if (!flag_mod.value) {
            validarModal2();
          }else if(flag_mod.value){
            // modalInstance.value.show();
            alert("Registro actualizado exitosamente.");
          }
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
        `${apiUrl}/actualizar_estado_seguimiento`,
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
      `${apiUrl}/cargar_datos_cotizacion`,
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
        // modalInstance.value.show();
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
        nuevaFechaVenc.value = response.data.data.nueva_fecha_vencimiento;
        motivo_no_cotizacion.value = response.data.data.motivo_no_cotizacion;
        desvio_oportunidad.value = response.data.data.desvio_oportunidad;
        item_revisado_cumple.value = response.data.data.item_revisado_cumple;
        item_revisado_muestra.value = response.data.data.item_revisado_muestra;
        desvio_calidad.value = response.data.data.desvio_calidad;
        autorizacion_desvio_oportunidad.value = response.data.data.autorizacion_desvio_oportunidad;
        autorizacion_desvio_calidad.value = response.data.data.autorizacion_desvio_calidad;

        if (item_revisado_cumple.value == null){
          item_revisado_cumple.value = 0;
        }
        if (item_revisado_muestra.value == null){
          item_revisado_muestra.value = 0;
        }
    }

  } catch (error) {
    console.error('Error al cargar los datos:', error);
    modalErrorInstance.value.show();
    errorMsg.value = error.response.data.message;
  }
};
// ✅ Función para calcular porcentaje de item de muestra.
const porcentajeCalculo = computed(() => {
  if (item_revisado_muestra.value === 0) return 0; // Evitar división por 0
  return ((item_revisado_cumple.value / item_revisado_muestra.value) * 100).toFixed(0); // Calcula sin redondear decimales
});

// ✅ Función que selecciona los datos del proveedor elegido en el input de proveedor
const seleccionarTercero = (ter) => {
    tercerosBusqueda.value = ter.nombres;
    tercerosNit.value = ter.nit;
    nit.value = ter.nit;
    mostrarLista.value = false;
};

// ✅ Función para ocultar la lista
const ocultarLista = () => {
    setTimeout(() => {
        mostrarLista.value = false;
    }, 200);
};

// ✅ Watcher que esta pendiente si hay un cambio en el campo de busqueda
watch(nit, async (nuevoValor) => {

    if (nuevoValor.length >= 1) { // Iniciar búsqueda después de 2 caracteres
        try {
            const response = await axios.post(`${apiUrl}/get_terceros`, 
                {
                    valor: nuevoValor
                },
                {
                    headers: {
                        Accept: "application/json"
                    }
                }
            );
            terceros_list.value = response.data.data;
        } catch (error) {
            console.error("Error en la búsqueda:", error);
        }
    } else {
      terceros_list.value = [];
    }
    if (nuevoValor.length == 0){
        nuevoValor = ''
        tercerosNit.value = ''
    }
});

// Esta funcion esta pendiente en caso que cambia el estado
watch(selectEstados, (nuevoValor) => {
  if (nuevoValor !== 'NO SE COTIZA') {
    motivo_no_cotizacion.value = ''; // Limpia el campo si cambia la opción
  }
});

// Nueva función para buscar cotización
const buscarCotizacion = async () => {
  
    try {
      mostrarComentario.value = false;
      comentario.value = null
      const response = await axios.post(
        `${apiUrl}/buscar_cotizacion`,
          {
            cotizacion: num_cotizacion.value
          },
          {
              headers: {
                  Accept: "application/json",
              }
          }
      );
      if (response.status === 200) {
          // msg.value = response.data.message;
          modalTitle.value = "Información";
          cotizacionInfo.value = response.data.data.data_cotizacion;
          contactos.value = response.data.data.contactos;
          cotizacionHistoriaOriginal.value = response.data.data.historia_seguimiento.map(item => ({ ...item }));
          cotizacionHistoria.value = response.data.data.historia_seguimiento.map((item, index) => {
            return {
              ...item,
              index: index + 1,
              bloqueado: item.resultado_seguimiento !== null && item.resultado_seguimiento !== 'null' && item.resultado_seguimiento !== ''
            };
          });

          // Usamos directamente el valor de resultado_seguimiento que viene de la API
          resultado_seguimiento.value = response.data.data.resultado_seguimiento;
          if (resultado_seguimiento.value !== null || resultado_seguimiento.value !== 'null' || resultado_seguimiento.value !== '') {
              mostrarComentario.value = true;
          } else {
              mostrarComentario.value = false;
          }
          seguimientoInfo.value = response.data.data.data_seguimiento;
          if (seguimientoInfo.value) {
            comentario.value = seguimientoInfo.value.comentario || ''; 
          } else {
            comentario.value = null
          }
      }

    } catch (error) {
      console.error('Error al cargar los datos:', error);
      modalErrorInstance.value.show();
      errorMsg.value = error.response.data.message;
      cotizacionInfo.value = null;
    }
}

// Funcion para guardar un seguimiento de cotización
const guardar_seguimiento = async (flag) => {
    try {
      const response = await axios.post(
        `${apiUrl}/guardar_seguimiento`,
          {
            cotizacion: num_cotizacion.value,
            fecha_programacion: fecha_programacion.value,
            usuario: cotizacionInfo.value.usuario,
            tipo_seguimiento: tipo_seguimiento_seleccionado.value,
            contacto: contacto_seleccionado.value,
            flag: flag
          },
          {
              headers: {
                  Accept: "application/json",
              }
          }
      );
      if (response.status === 200) {
          // msg.value = response.data.message;
          // modalInstance.value.show();
          // modalTitle.value = "Información"
          alert("Seguimiento guardado exitosamente.");
          if (numero_cotizacion.value) {
            await consultarCotizacion();
          }
          await buscarCotizacion();
      }

    } catch (error) {
      console.error('Error al cargar los datos:', error);
      modalErrorInstance.value.show();
      errorMsg.value = error.response.data.message;
    }
};

// Función para cargar los tipos de seguimiento
const cargar_tipo_seguimientos = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}/tipo_seguimientos`, {},
        {
            headers: {
                Accept: "application/json",
            }
        }
    );
    if (response.status === 200) {
      // Asignar las opciones a los select
      tipo_seguimiento.value = response.data.data;
      // contacto.value = response.data.data.contacto;
    }
  } catch (error) {
    console.error('Error al cargar los desplegables:', error);
    modalErrorInstance.value.show();
    errorMsg.value = error.response.data.message;
  }
};

// Función para cargar los tipos de resultado de llamada
const cargar_tipo_resultado_llamada = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}/tipo_resultado_llamada`, {},
        {
            headers: {
                Accept: "application/json",
            }
        }
    );
    if (response.status === 200) {
      // Asignar las opciones a los select
      tipo_resultado_llamada.value = response.data.data;
    }
  } catch (error) {
    console.error('Error al cargar los desplegables:', error);
    modalErrorInstance.value.show();
    errorMsg.value = error.response.data.message;
  }
};

// Función para actualizar el resultado de la llamada
const actualizarResultadoLlamada = async (item) => {
  try {

    if (comentario.value === '' || comentario.value === null) {
      errorMsg.value = 'Comentario no debe estar vacío.';
      modalErrorInstance.value.show();
      return;
    }

    // Puedes ajustar los campos enviados según tu API
    const response = await axios.post(
      `${apiUrl}/actualizar_resultado_llamada`,
      {
        id: item.id,
        numero: item.numero,
        resultado_llamada: item.resultado_seguimiento,
        comentario: comentario.value
      },
      {
        headers: {
          Accept: "application/json",
        }
      }
    );
    if (response.status === 200) {
      resultado_seguimiento.value = response.data.data;
      item.bloqueado = true;

      // Activar visualización según valor guardado
      if (item.resultado_seguimiento === 6) {
        mostrarMotivoNoAdjudicacion.value = true;
      } else {
        mostrarComentario.value = true;
        mostrarMotivoNoAdjudicacion.value = false;
      }
      await buscarCotizacion();

      alert("Resultado actualizado correctamente.");
      if (numero_cotizacion.value) {
        await consultarCotizacion();
      }
    }
  } catch (error) {
    errorMsg.value = error.response?.data?.message || "Error al actualizar";
    modalErrorInstance.value.show();
  }
};

// Función para cargar los motivos de no adjudicación
const cargar_motivos_no_adjudicacion = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}/motivos_no_adjudicacion`, {},
        {
            headers: {
                Accept: "application/json",
            }
        }
    );
    if (response.status === 200) {
      // Asignar las opciones a los select
      listado_motivos_no_adjudicacion.value = response.data.data;
      // contacto.value = response.data.data.contacto;
    }
  } catch (error) {
    console.error('Error al cargar los desplegables:', error);
    modalErrorInstance.value.show();
    errorMsg.value = error.response.data.message;
  }
};

// Función para guardar el motivo de no adjudicación
const guardarMotivoNoAdjudicacion = async () => {
  try {
    if (motivo_no_adjudicacion.value === '' || motivo_no_adjudicacion.value === null) {
      errorMsg.value = 'Motivo de no adjudicación no debe estar vacío.';
      modalErrorInstance.value.show();
      return;
    }

    const response = await axios.post(
      `${apiUrl}/guardar_no_adjudicacion`,
        {
          id: selectedItem.value.id,
          numero: selectedItem.value.numero,
          resultado_llamada: selectedItem.value.resultado_seguimiento,
          motivo_no_adjudicacion: motivo_no_adjudicacion.value,
          cotizacion: num_cotizacion.value
        },
        {
            headers: {
                Accept: "application/json",
            }
        }
    );
    if (response.status === 200) {
        resultado_seguimiento.value = response.data.data;

        // Activar visualización según valor guardado
        if (resultado_seguimiento.value === 6) {
          mostrarMotivoNoAdjudicacion.value = true;
        } else {
          mostrarMotivoNoAdjudicacion.value = false;
        }
        alert("Resultado actualizado correctamente.");
        await buscarCotizacion();
    }

  } catch (error) {
    console.error('Error al cargar los datos:', error);
    modalErrorInstance.value.show();
    errorMsg.value = error.response.data.message;
  }
};

// Función para obtener el siguiente día hábil
const obtenerSiguienteDiaHabil = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}/calcular_dia_habil`,
      {
        fecha: fechaActual.value
      },
      {
          headers: {
              Accept: "application/json",
          }
      }
    )
    if (response.status === 200) {
      siguienteDiaHabil.value = response.data.data.siguiente_dia_habil
    }
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    modalErrorInstance.value.show();
    errorMsg.value = error.response.data.message;
  }
}

// Código que se ejecuta al montar el componente
onMounted(() => {
  modalInstance.value = new Modal(exitoModal);
  modalInstance2.value = new Modal(exitoModal2);
  modalErrorInstance.value = new Modal(errorModal);
  modalPreguntaInstance.value = new Modal(preguntaModal);
  fechaInicio.value = getFechaUnMesAtras();
  fechaFin.value = getFechaHoy();
  cargarDatos();

  cargar_tipo_seguimientos();
  cargar_tipo_resultado_llamada();
  cargar_motivos_no_adjudicacion();

  const hoy = new Date()
  const yyyy = hoy.getFullYear()
  const mm = String(hoy.getMonth() + 1).padStart(2, '0')
  const dd = String(hoy.getDate()).padStart(2, '0')
  fechaActual.value = `${yyyy}-${mm}-${dd}`
  obtenerSiguienteDiaHabil();

});
</script>
  
<style scoped>

.modal-backdrop.show {
  opacity: 0.5;
  backdrop-filter: blur(4px); /* Desenfoque del fondo */
  z-index: 1050 !important;
}

/* Asegura que las modales de éxito y error estén siempre por delante */
#exitoModal, #errorModal {
  z-index: 1080 !important;
}

#exitoModal .modal-dialog,
#errorModal .modal-dialog {
  z-index: 1081 !important;
}

/* Opcional: fuerza el backdrop de estas modales a estar por debajo */
#exitoModal + .modal-backdrop,
#errorModal + .modal-backdrop {
  z-index: 1079 !important;
}

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
  font-size: 1.2rem;
  color: #333;
  margin: 0;
  margin-left: 10px;
  margin-top: 10px;
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

.grupo-busqueda {
  display: flex;
  align-items: start;
  gap: 2;
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
.titulo-calidad {
    background-color: rgb(84, 154, 164);
    color: white;
    font-size: medium;
}
.titulo-seguimiento {
    background-color: #2778bf;
    color: white;
    font-size: medium;
}
.area-seguimiento{
    height: 120px; 
    max-height: 120px;
    font-size: 12px;
}

.btn-limpiar {
    background-color: #940404;
    color: white;
}
.btn-limpiar:hover{
    background-color: #f84f4f;
}
.btn-guardar {
    background-color: green;
    color: white;
}
.btn-guardar:hover {
    background-color: #01b652;
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

.btn-router-link {
  border-width: 2px;
  font-weight: bold;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(39,120,191,0.08);
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  background: linear-gradient(90deg, #e3f0ff 0%, #f8fbff 100%);
}
.btn-router-link:hover {
  background: #2778bf;
  color: #fff !important;
  border-color: #2778bf;
  box-shadow: 0 4px 16px rgba(39,120,191,0.15);
  text-decoration: none;
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

.contenedor-programar-seguimiento {
  margin-top: 10px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}
.contenedor-formulario-seguimiento {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  width: 220px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.titulo-programar-seguimiento {
  margin-bottom: 20px;
  text-align: left;
}
.grupo-cotizacion label {
  font-weight: 500;
}
.input-group {
  display: flex;
  align-items: stretch;
}
.input-group .form-control {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.btn-buscar-cot {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  background-color: #2778bf;
  color: #fff;
  border: 1px solid #2778bf;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
}
.btn-buscar-cot:hover, .btn-buscar-cot:focus {
  background-color: #155a8a;
  color: #fff;
}
.icono-buscar {
  vertical-align: middle;
}
.info-cotizacion {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  background: #ffffff;
  min-width: 250px;
  width: 100%;
  flex: 1 1 0;
  margin-left: 20px !important;
  box-sizing: border-box;
}
.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -8px;
  margin-left: -8px;
  align-items: end;
}
.col-6 {
  flex: 0 0 50%;
  max-width: 50%;
  padding-left: 8px;
  padding-right: 8px;
}
.contenedor-tabla-seguimientos {
  margin: 10px 10px;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1.5rem;
  min-width: 350px;
  width: 100%;
  box-sizing: border-box;
}

.btn-modal-guardar,
.btn-guardar-seguimiento {
  background-color: #2778bf;
}

.btn-modal-guardar:hover,
.btn-guardar-seguimiento:hover {
  background-color: #5eaef5;
}

.segundo-contenedor{
  display: flex;
}

.contenedor-formulario-seguimiento .form-control-sm,
.contenedor-formulario-seguimiento .btn-sm {
  font-size: 0.95rem;
  padding: 0.25rem 0.5rem;
  height: 32px;
}

.tabla-seguimiento-sm,
.tabla-seguimiento-sm th,
.tabla-seguimiento-sm td {
  font-size: 13px !important;
  padding: 3px 5px !important;
}


.tabla-seguimiento-sm select{
  font-size: 13px !important;
}
</style>
