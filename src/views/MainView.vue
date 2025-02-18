<template>
    <div id="main-data" class="w-100 d-flex align-items-stretch">
      <!-- Contenedor Izquierdo -->
      <div class="w-35 p-3 d-flex flex-column">
        <div class="d-flex gap-2 mb-2 form-group-small">
            <label class="lbl-dates">Fecha Inicio: </label>
            <input type="date" class="form-control inputdate" />
            <label class="lbl-dates">Fecha Fin: </label>
            <input type="date" class="form-control inputdate" />
            <button class="btn-ext">Extraer Correos</button>
        </div>
        <div class="d-flex gap-2 mb-3">
            <button class="btn-upd">Actualizar Estado de Seguimiento</button>
            <button class="btn-load">Cargar Datos</button>
        </div>
        <div class="table-container">
          <table class="table table-bordered table-striped table-hover mb-3">
            <thead>
              <tr>
                <th>Remitente</th>
                <th>Asunto</th>
                <th>Fecha y hora</th>
                <th>Seguimiento</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="n in 10" :key="n"><td>Ejemplo {{ n }}</td><td>Asunto {{ n }}</td><td>03/01/2025</td><td>Estado {{ n }}</td></tr>
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
        <textarea class="form-control mb-2" style="height: 1200px;" readonly></textarea>
        <div class="d-flex gap-2 w-100">
          <button class="btn btn-danger btn-sm w-50 btn-limpiar">Limpiar</button>
          <button class="btn btn-primary btn-sm w-50 btn-guardar">Guardar</button>
        </div>
      </div>
    </div>
</template>
  
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

.btn-buscar{
    background-color: #2778bf;
    color: white;
}

.btn-buscar-cot{
    background-color: #2778bf;
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

.btn-limpiar {
    background-color: #940404;
    color: white;
}
.btn-guardar {
    background-color: #2778bf;
    color: white;
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
  