import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import App from '../app.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: App,
    children: [
      {
        path: '',
        name: 'Timers',
        component: () => import('../views/Index.vue')
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('../views/Reports.vue')
      }
    ]
  },
  // Add a catch-all route that redirects to the home page
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  // Enable fragment-based routing
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      };
    }
    return { top: 0 };
  }
});

export default router;
