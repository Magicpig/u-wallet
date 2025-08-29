import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'wallet',
      component: () => import('../views/WalletView.vue')
    },
    {
      path: '/add-wallet',
      name: 'add-wallet',
      component: () => import('../views/AddWalletView.vue')
    }
  ]
})

export default router
