<template>
  <div class="d-flex flex-column min-vh-100">
    <header class="mb-3">
      <nav class="navbar navbar-light bg-light">
        <div class="container">
          <h1 class="navbar-brand mb-0">
            Timed Report!
          </h1>

          <ul class="navbar-nav d-flex align-items-center">
            <li class="nav-item d-flex align-items-center">
              <router-link
                class="nav-link mr-3"
                to="/"
                active-class="active"
                exact-active-class="active"
              >Timers</router-link>
              <router-link
                class="nav-link mr-3"
                to="/reports"
                active-class="active"
                exact-active-class="active"
              >Reports</router-link>
              <router-link
                class="nav-link mr-3"
                to="/settings"
                active-class="active"
                exact-active-class="active"
              >Settings</router-link>
              <button
                type="button"
                class="btn btn-link nav-link p-0 d-flex align-items-center justify-content-center"
                style="width: 32px; height: 32px; border-radius: 4px;"
                @click="toggleDarkMode"
                :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              >
                <i v-if="isDark" class="fa-duotone fa-regular fa-sun"></i>
                <i v-else class="fa-duotone fa-regular fa-moon"></i>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    
    <main class="flex-grow-1">
      <router-view />
    </main>
    
    <my-footer />
    <ko-fi-message />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { analyticsTrack } from './services/analytics';
import MyFooter from './components/my-footer.vue';
import KoFiMessage from './components/KoFiMessage.vue';

export default defineComponent({
  components: {
    MyFooter,
    KoFiMessage
  },
  data() {
    return {
      isDark: false
    };
  },
  methods: {
    toggleDarkMode() {
      const newIsDark = !this.isDark;
      this.isDark = newIsDark;
      this.applyTheme();
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      this.analyticsTrack('theme_change', {
        theme: newIsDark ? 'dark' : 'light'
      });
    },
    applyTheme() {
      if (this.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    trackThemeLoaded(theme: string) {
      analyticsTrack('theme_loaded', { theme });
    }
  },
  mounted() {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      this.isDark = savedTheme === 'dark';
    } else {
      // Check system preference
      this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
    
    // Track theme load
    this.trackThemeLoaded(this.isDark ? 'dark' : 'light');

    // Listen for system theme changes if no theme is explicitly set
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.isDark = e.matches;
        this.applyTheme();
        this.trackThemeLoaded(e.matches ? 'dark' : 'light');
      }
    });
  }
});
</script>
