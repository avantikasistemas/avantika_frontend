<template>
    <header>
      <div>
        <h4>Bienvenido, a la App de cotizaciones Avantika</h4>
      </div>
    </header> 
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Acceder al enrutador
const router = useRouter();


</script>

<style scoped>
*{
    box-sizing: border-box;   
}
body {
    margin: 0;
    padding: 0;
}
header {
    width: 100%;
    background-color: #2777a4;
    display: flex;
    justify-content: center;
}
header h4 {
    color: white;
    text-align: center;
}

</style>