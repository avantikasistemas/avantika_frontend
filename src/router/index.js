import { createRouter, createWebHistory } from 'vue-router'
// import LoginView from '@/views/LoginView.vue';
import MainView from '@/views/MainView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {path: '/', name: 'login', component: LoginView},
    {path: '/', name: 'main', component: MainView},
  ]
})

// router.beforeEach((to, from, next) => {

//   const token = localStorage.getItem('token');
//   // Si no se requiere autenticación (por ejemplo, en la ruta de login), continúa
//   if (to.path === '/' || to.name === 'login') {
//     next();
//   } else {
//     // Si se requiere autenticación y no hay token, redirigir al login
//     if (!token) {
//       next({ name: 'login' }); // Redirigir a la ruta de login si no hay token
//     } else {
//       // Si hay token, permitir la navegación
//       next();
//     }
//   }
// });

export default router