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
      
      <!-- Project Settings Panel -->
      <div v-if="currentProject" class="mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="projectBillableRate" class="form-label">Billable Rate ($/h)</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input
                  id="projectBillableRate"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-control"
                  :value="currentProject.billableRate"
                  @input="saveBillableRate(Number(($event.target as HTMLInputElement).value))"
                >
              </div>
              <div class="form-text" v-if="defaultBillableRate !== undefined">
                Current global rate: ${{ defaultBillableRate }}
              </div>
            </div>
            
            <div class="col-md-6">
              <label for="projectInitialEstimate" class="form-label">Initial Estimate ($)</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input
                  id="projectInitialEstimate"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-control"
                  :value="currentProject.initialEstimate"
                  @input="saveInitialEstimate(Number(($event.target as HTMLInputElement).value))"
                >
              </div>
              <div class="form-text">
                Initial project budget/estimate
              </div>
            </div>
          </div>
          
          <!-- Will add more project metrics here -->
          <div class="mt-3">
            <div class="d-flex justify-content-between align-items-center">
              <span>Total Billed:</span>
              <strong>${{ totalAmount.toFixed(2) }}</strong>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span>Remaining Budget:</span>
              <strong :class="{ 'text-danger': calculateRemainingBudget() < 0 }">
                ${{ calculateRemainingBudget().toFixed(2) }}
              </strong>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span>Non-Billable Time:</span>
              <strong>
                {{ formatHours(calculateNonBillableTime()) }}
              </strong>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span>Effective Hourly Rate:</span>
              <strong>
                ${{ calculateEffectiveHourlyRate().toFixed(2) }}/h
              </strong>
            </div>
            <div v-if="calculateRemainingBudget() < 0" class="d-flex justify-content-between align-items-center text-danger">
              <span>Time After Budget Depleted:</span>
              <strong>
                {{ formatHours(calculateOverBudgetTime()) }}
              </strong>
            </div>
          </div>
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
                    <template v-if="task.billable">
                      <input
                        type="number"
                        class="form-control form-control-sm text-end"
                        v-model.number="task.billable"
                        min="0"
                        step="0.01"
                        @change="saveTask(task)"
                      >
                    </template>
                    <template v-else>
                      -
                    </template>
                  </td>
                  <td class="text-end">{{ calculateAmount(task) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="table-active">
                  <td colspan="3" class="text-end"><strong>Total:</strong></td>
                  <td class="text-end"><strong>${{ totalAmount.toFixed(2) }}</strong></td>
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
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import { analyticsTrack } from '../services/analytics';
import { useSettings } from '@/store/settings';
import { useProjects, type ProjectSettings } from '@/store/projects';

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
    const settingsStore = useSettings();
    const projectsStore = useProjects();
    const currentProject = ref<ProjectSettings | null>(null);
    const defaultBillableRate = ref(0);
    
    // Initialize default billable rate
    onMounted(() => {
      defaultBillableRate.value = settingsStore.defaultBillableRate();
    });
    
    // Get the effective billable rate for a task
    const getEffectiveRate = (task: Task): number => {
      // If task is explicitly marked as non-billable, return 0
      if (task.billable === 0 || task.billable.toString() === '0') {
        return 0;
      }
      
      // If task has an explicit rate, use that
      if (task.billable) {
        return Number(task.billable);
      }
      
      // Otherwise use project rate if available
      if (currentProject.value?.billableRate) {
        return currentProject.value.billableRate;
      }
      
      // Fall back to global default
      return defaultBillableRate.value;
    };
    
    // Calculate total billed amount for the current project (should match table total)
    const calculateTotalBilled = (): number => {
      if (!currentProject.value) return 0;
      
      return tasks.value
        .filter(task => task.project === currentProject.value?.id)
        .reduce((total, task) => {
          const hours = task.time / (1000 * 60 * 60);
          const rate = getEffectiveRate(task);
          return total + (hours * rate);
        }, 0);
    };
    
    // Calculate total time spent on non-billable tasks for the current project
    const calculateNonBillableTime = (): number => {
      if (!currentProject.value) return 0;
      
      return tasks.value
        .filter(task => task.project === currentProject.value?.id && !task.billable)
        .reduce((total, task) => total + task.time, 0);
    };
    
    // Calculate total time spent on all tasks (billable and non-billable) for the current project
    const calculateTotalProjectTime = (): number => {
      if (!currentProject.value) return 0;
      
      return tasks.value
        .filter(task => task.project === currentProject.value?.id)
        .reduce((total, task) => total + task.time, 0);
    };
    
    // Calculate effective hourly rate based on initial estimate and total time spent
    const calculateEffectiveHourlyRate = (): number => {
      if (!currentProject.value) return 0;
      
      const totalTimeHours = calculateTotalProjectTime() / (1000 * 60 * 60);
      if (totalTimeHours <= 0) return 0;
      
      return currentProject.value.initialEstimate / totalTimeHours;
    };
    
    // Calculate time worked after the budget was exhausted
    const calculateOverBudgetTime = (): number => {
      if (!currentProject.value || calculateRemainingBudget() >= 0) return 0;
      
      // Sort tasks by creation date to process them in chronological order
      const projectTasks = [...tasks.value]
        .filter(task => task.project === currentProject.value?.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      let remainingBudget = currentProject.value.initialEstimate;
      let overBudgetTime = 0;
      
      for (const task of projectTasks) {
        const taskRate = getEffectiveRate(task);
        const taskHours = task.time / (1000 * 60 * 60);
        const taskCost = taskHours * taskRate;
        
        if (remainingBudget <= 0) {
          // Entire task was done after budget was exhausted
          overBudgetTime += task.time;
        } else if (remainingBudget < taskCost) {
          // Task was partially within budget, partially over
          const budgetedHours = remainingBudget / taskRate;
          const overBudgetHours = taskHours - budgetedHours;
          overBudgetTime += overBudgetHours * (1000 * 60 * 60); // Convert back to ms
          remainingBudget = 0;
        } else {
          // Task was fully within budget
          remainingBudget -= taskCost;
        }
      }
      
      return overBudgetTime;
    };
    
    // Calculate amount for a single task
    const calculateTaskAmount = (task: Task): number => {
      const rate = getEffectiveRate(task);
      // If rate is 0 (non-billable), return 0
      if (rate === 0) return 0;
      
      const hours = task.time / (1000 * 60 * 60);
      return hours * rate;
    };
    
    // Calculate remaining budget
    const calculateRemainingBudget = (): number => {
      if (!currentProject.value) return 0;
      return currentProject.value.initialEstimate - calculateTotalBilled();
    };
    
    // Watch for active tab changes to update project settings
    watch(activeTab, (newProjectName) => {
      if (newProjectName) {
        currentProject.value = projectsStore.getProject(newProjectName);
      } else {
        currentProject.value = null;
      }
    });
    
    // Save project settings
    const saveProjectSettings = () => {
      if (currentProject.value) {
        projectsStore.saveProject({
          ...currentProject.value
        });
      }
    };
    
    // Save billable rate
    const saveBillableRate = (rate: number) => {
      if (currentProject.value) {
        projectsStore.updateProjectBillableRate(currentProject.value.id, rate);
        // Update local ref to trigger UI update
        currentProject.value = {
          ...currentProject.value,
          billableRate: rate
        };
      }
    };
    
    // Save initial estimate
    const saveInitialEstimate = (estimate: number) => {
      if (currentProject.value) {
        projectsStore.updateProjectEstimate(currentProject.value.id, estimate);
        // Update local ref to trigger UI update
        currentProject.value = {
          ...currentProject.value,
          initialEstimate: estimate
        };
      }
    };

    // Format time in milliseconds to human-readable format (e.g., 1h 35min)
    const formatHours = (ms: number): string => {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      
      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}min`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else if (minutes > 0) {
        return `${minutes}min`;
      } else {
        return '<1min';
      }
    };

    // Format number to 2 decimal places
    const formatNumber = (num: number): string => {
      return num.toFixed(2);
    };

    // Calculate amount for display in the table
    const calculateAmount = (task: Task): string => {
      return calculateTaskAmount(task).toFixed(2);
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

    // Calculate total amount for all tasks in the current project
    const totalAmount = computed(() => {
      if (!currentProject.value) return 0;
      
      return tasks.value
        .filter(task => task.project === currentProject.value?.id)
        .reduce((total, task) => {
          return total + calculateTaskAmount(task);
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
        
        // Ensure billable is properly set with default rate
        tasks.value = tasks.value.map(task => {
          // If billable is explicitly false, set rate to 0
          if (task.billable === false) {
            return { ...task, billable: 0 };
          }
          // If billable is true or not set, use the existing rate or default
          if (task.billable === true || task.billable === undefined) {
            return { ...task, billable: settingsStore.defaultBillableRate() };
          }
          // If billable is already a number, keep it as is
          return task;
        });

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
      currentProject,
      defaultBillableRate,
      formatHours,
      formatNumber,
      calculateAmount,
      saveTask,
      saveBillableRate,
      saveInitialEstimate,
      calculateTotalBilled,
      calculateRemainingBudget,
      calculateNonBillableTime,
      calculateEffectiveHourlyRate,
      calculateOverBudgetTime
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
