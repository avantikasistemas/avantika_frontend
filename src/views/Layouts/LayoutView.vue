<template>
    <div id="main-data" class="w-100">
      <Navbar />
      <div class="main-content container-fluid">
        <slot></slot> <!-- Aquí se renderizará el contenido dinámico de cada página -->
      </div>
    </div>
  </template>
  
  <script setup>
    import Navbar from './NavbarView.vue';
  </script>
  
  <style scoped>
  html, body {
    height: 100%;
    margin: 0;
  }

  </style>
  