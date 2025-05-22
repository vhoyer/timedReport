<template>
  <div class="reports-page container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Time Reports</h1>
      <router-link to="/" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left"></i> Back to Timers
      </router-link>
    </div>

    <!-- Project Tabs -->
    <div class="card">
      <div class="card-header p-0 bg-transparent border-bottom-0">
        <div class="nav-tabs-wrapper">
          <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item" v-for="project in projects" :key="project">
              <button
                class="nav-link"
                :class="{ 'active': activeTab === project }"
                @click="activeTab = project"
              >
                {{ project }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div class="card-body p-0">
        <div v-if="!projects.length" class="text-muted text-center p-4">
          No projects found. Add tasks to see reports.
        </div>

        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th class="w-100">Task</th>
                  <th class="text-end" style="width: 100px">Hours</th>
                  <th class="text-end" style="width: 150px">Rate ($/h)</th>
                  <th class="text-end" style="width: 120px">Amount ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in projectTasks" :key="task.id">
                  <td>
                    <div class="fw-bold">{{ task.title }}</div>
                    <small class="text-muted">{{ task.description || 'No description' }}</small>
                  </td>
                  <td class="text-end">{{ formatHours(task.time) }}</td>
                  <td class="text-end">
                    <input
                      type="number"
                      class="form-control form-control-sm text-end"
                      v-model.number="task.billable"
                      min="0"
                      step="0.01"
                      @change="saveTask(task)"
                    >
                  </td>
                  <td class="text-end">{{ calculateAmount(task) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="table-active">
                  <td colspan="3" class="text-end"><strong>Total:</strong></td>
                  <td class="text-end"><strong>${{ formatNumber(totalAmount) }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { analyticsTrack } from '../services/analytics';

interface Task {
  id: string;
  title: string;
  description: string;
  time: number;
  billable: number;
  project: string;
}

export default defineComponent({
  name: 'ReportsPage',
  setup() {
    const tasks = ref<Task[]>([]);
    const activeTab = ref('');

    // Format time in milliseconds to hours with 2 decimal places
    const formatHours = (ms: number): string => {
      return (ms / (1000 * 60 * 60)).toFixed(2);
    };

    // Format number to 2 decimal places
    const formatNumber = (num: number): string => {
      return num.toFixed(2);
    };

    // Calculate amount for a task
    const calculateAmount = (task: Task): string => {
      const hours = task.time / (1000 * 60 * 60);
      return (hours * (task.billable || 0)).toFixed(2);
    };

    // Save task updates to localStorage
    const saveTask = (updatedTask: Task) => {
      const savedData = localStorage.getItem('vm-data');
      if (savedData) {
        const data = JSON.parse(savedData);
        const taskIndex = data.cards.findIndex((t: Task) => t.id === updatedTask.id);
        if (taskIndex !== -1) {
          data.cards[taskIndex] = { ...data.cards[taskIndex], billable: updatedTask.billable };
          localStorage.setItem('vm-data', JSON.stringify(data));
        }
      }
    };

    // Get unique projects from tasks
    const projects = computed(() => {
      const projectSet = new Set<string>();
      tasks.value.forEach(task => projectSet.add(task.project));
      return Array.from(projectSet).sort();
    });

    // Get tasks for the active project
    const projectTasks = computed(() => {
      if (!activeTab.value) return [];
      return tasks.value.filter(task => task.project === activeTab.value);
    });

    // Calculate total amount for the active project
    const totalAmount = computed(() => {
      return projectTasks.value.reduce((sum, task) => {
        return sum + parseFloat(calculateAmount(task));
      }, 0);
    });

    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];

    // Load tasks from localStorage
    const loadTasks = () => {
      const savedData = localStorage.getItem('vm-data');
      if (savedData) {
        const data = JSON.parse(savedData);
        tasks.value = data.cards || [];
        
        // Set default billable rate if not set
        tasks.value = tasks.value.map(task => ({
          ...task,
          billable: task.billable || 0
        }));

        // Set first project as active if available
        if (projects.value.length > 0 && !activeTab.value) {
          activeTab.value = projects.value[0];
        }
      }
    };

    onMounted(() => {
      loadTasks();
      analyticsTrack('app', {
        event: 'reports_loaded'
      });
    });

    return {
      activeTab,
      projects,
      projectTasks,
      totalAmount,
      currentDate,
      formatHours,
      formatNumber,
      calculateAmount,
      saveTask
    };
  }
});
</script>

<style scoped>
/* Dark mode overrides */
.dark {
  color: #ffffff;
}

.dark .nav-tabs {
  --bs-nav-tabs-link-active-bg: #2c3034 !important;
  --bs-nav-tabs-link-active-color: #ffffff !important;
  --bs-nav-tabs-link-hover-border-color: rgba(255, 255, 255, 0.1) !important;
  --bs-border-color: rgba(255, 255, 255, 0.1) !important;
  border-bottom-color: rgba(255, 255, 255, 0.1) !important;
}

.dark .nav-link {
  color: #ffffff;
}

.dark .nav-tabs .nav-link {
  border-color: transparent !important;
  margin-bottom: 0;
  transition: all 0.2s ease;
}

.dark .nav-tabs .nav-link.active {
  background-color: #2c3034 !important;
  border-color: rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.1) #2c3034 !important;
  color: #ffffff !important;
  font-weight: 500;
  position: relative;
  z-index: 1;
}

.dark .text-muted {
  color: #adb5bd !important;
}

.dark .card {
  --bs-card-bg: var(--bs-dark-bg-subtle);
  --bs-card-border-color: var(--bs-border-color);
}

.dark .table {
  --bs-table-color: #ffffff;
  --bs-table-bg: transparent;
  --bs-table-hover-color: #ffffff;
  --bs-table-hover-bg: rgba(255, 255, 255, 0.1);
  --bs-table-border-color: var(--bs-border-color);
  color: #ffffff;
}

.dark .table th,
.dark .table td {
  color: #ffffff;
}

.dark .table thead th {
  background-color: #2c3034;
  border-color: rgba(255, 255, 255, 0.05) !important;
}

.dark .table td,
.dark .table th {
  border-color: rgba(255, 255, 255, 0.05) !important;
}

.dark .table-hover > tbody > tr:hover > * {
  --bs-table-hover-bg: rgba(255, 255, 255, 0.03) !important;
}

.dark .form-control {
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
  border-color: var(--bs-border-color);
}

.dark .form-control:focus {
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
.nav-tabs-wrapper {
  margin: 0 -1px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  padding: 0 1px;
}

.nav-tabs {
  border-bottom: 1px solid #dee2e6;
  flex-wrap: nowrap;
  min-width: 100%;
  display: inline-flex;
}

.nav-tabs .nav-link {
  white-space: nowrap;
  padding: 0.75rem 1.25rem;
  border: 1px solid transparent;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  margin-bottom: -1px;
}

.nav-tabs .nav-link.active {
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
  color: #495057;
}

.card {
  overflow: hidden;
}

.table {
  margin-bottom: 0;
  table-layout: fixed;
}

.table th:first-child,
.table td:first-child {
  width: auto;
  min-width: 200px;
}

.table th:not(:first-child),
.table td:not(:first-child) {
  white-space: nowrap;
}

.reports-page {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

.nav-tabs .nav-link {
  color: #495057;
  border: 1px solid transparent;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
  font-weight: 500;
}

.table th {
  white-space: nowrap;
  border-top: none;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  vertical-align: middle;
}

.form-control-sm {
  min-width: 100px;
  display: inline-block;
  text-align: right;
}

.text-muted {
  color: #6c757d !important;
}
</style>
