// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import CocktailList from '@/components/cocktails/list.vue';
import CocktailNew from '@/components/cocktails/new.vue';

const routes = [
  {
    path: '/',
    name: 'CocktailList',
    component: CocktailList,
  },
  {
    path: '/new',
    name: 'CocktailNew',
    component: CocktailNew,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;