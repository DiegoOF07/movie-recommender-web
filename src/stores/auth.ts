import { reactive } from 'vue'

const STORAGE_KEY_USER = 'mr_username'
const STORAGE_KEY_ADMIN = 'mr_admin'

export const auth = reactive({
  username: localStorage.getItem(STORAGE_KEY_USER) ?? '',
  isAdmin: localStorage.getItem(STORAGE_KEY_ADMIN) === 'true',

  login(username: string) {
    this.username = username
    localStorage.setItem(STORAGE_KEY_USER, username)
  },

  logout() {
    this.username = ''
    this.isAdmin = false
    localStorage.removeItem(STORAGE_KEY_USER)
    localStorage.removeItem(STORAGE_KEY_ADMIN)
  },

  loginAdmin() {
    this.isAdmin = true
    localStorage.setItem(STORAGE_KEY_ADMIN, 'true')
  },

  logoutAdmin() {
    this.isAdmin = false
    localStorage.removeItem(STORAGE_KEY_ADMIN)
  },

  checkAdminPassword(input: string): boolean {
    return input === (import.meta.env.VITE_ADMIN_PASSWORD ?? 'admin1234')
  },
})
