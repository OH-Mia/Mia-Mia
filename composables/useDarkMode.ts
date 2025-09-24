import { ref } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    localStorage.setItem('dark-mode', String(isDark.value))
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  const initializeDarkMode = () => {
    const saved = localStorage.getItem('dark-mode') === 'true'
    isDark.value = saved
    document.documentElement.classList.toggle('dark', saved)
  }

  return {
    isDark: readonly(isDark),
    toggleDarkMode,
    initializeDarkMode,
  }
}
