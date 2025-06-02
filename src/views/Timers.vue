<template>
  <div class="container" style="flex-grow:1">
    <section class="project-breakdown mb-4">
      <div class="d-flex justify-content-between align-items-baseline">
        <h2 class="section-title mb-2">Project Breakdown</h2>
        <div class="total-times text-muted">
          <span class="mr-4">Today: {{ totalWorkTime }}</span>
          <span>This Week: {{ weeklyWorkTime }}</span>
        </div>
      </div>
      <div class="progress" style="height: 30px;">
        <div
          v-for="project in projectBreakdown"
          :key="project.project"
          class="progress-bar"
          :style="{
            width: project.percentage + '%',
            backgroundColor: project.color
          }"
          :title="`${project.project}: ${Math.round(project.percentage)}% (${new Date(project.time).toISOString().substr(11, 8)})`"
        >
          <span
            class="project-label"
            :style="{
              display: project.percentage > 5 ? 'inline' : 'none'
            }"
          >
            {{ project.project }}
          </span>
        </div>
      </div>
      <div class="project-legend mt-2 d-flex flex-wrap">
        <div
          v-for="project in projectBreakdown"
          :key="project.project"
          class="mr-3 mb-1"
        >
          <span
            class="color-dot"
            :style="{ backgroundColor: project.color }"
          ></span>
          {{ project.project }}: {{ Math.round(project.percentage) }}%
          ({{ new Date(project.time).toISOString().substr(11, 8) }})
        </div>
      </div>
    </section>

    <section class="goals mb-4">
      <div class="d-flex justify-content-between align-items-baseline mb-3">
        <h2 class="section-title">Weekly Goals</h2>
        <button
          type="button"
          class="btn btn-sm btn-outline-primary"
          @click="addGoal()"
        >
          Add Goal
        </button>
      </div>

      <div class="row">
        <!-- Goal Cards -->
        <div v-for="goal in goals" :key="goal.id" class="col-12 col-sm-6 col-md-4 col-xl-5-cols mb-2">
          <div class="card">
            <div class="card-header px-3 py-2">
              <div class="d-flex justify-content-between align-items-center">
                <div
                  class="project-name"
                  data-bound-property="project"
                  @dblclick="editGoalField($event, goal.id)"
                >
                  {{ goal.project }}
                </div>
                <div class="d-flex align-items-center">
                  <button
                    type="button"
                    class="btn btn-link p-0"
                    aria-label="Delete Goal"
                    title="Delete Goal"
                    @click.stop="removeGoal(goal.id)"
                  >
                    <i class="fa-duotone fa-regular fa-xmark"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body px-3 py-2">
              <div class="d-flex align-items-center mb-2 times-wrapper">
                <div class="current-time">
                  {{ formatTime(getProjectWeeklyTime(goal.project)) }}
                </div>
                <div class="time-separator">/</div>
                <div
                  class="time-goal"
                  data-bound-property="weeklyTimeGoal"
                  @dblclick="editGoalField($event, goal.id)"
                >
                  {{ formatTime(goal.weeklyTimeGoal) }}
                </div>
              </div>

              <div
                class="progress mb-2"
                style="height: 6px;"
                :style="{ backgroundColor: `color-mix(in srgb, ${getProjectColor(goal.project)} 10%, white)` }"
              >
                <div
                  class="progress-bar"
                  role="progressbar"
                  :style="{
                    width: Math.min((getProjectWeeklyTime(goal.project) / goal.weeklyTimeGoal) * 100, 100) + '%',
                    backgroundColor: getProjectColor(goal.project)
                  }"
                  :aria-valuenow="Math.min((getProjectWeeklyTime(goal.project) / goal.weeklyTimeGoal) * 100, 100)"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              
              <!-- Create Task Button -->
              <div class="d-flex justify-content-end mt-2">
                <button
                  type="button"
                  class="btn btn-link py-0 px-1 text-decoration-none start-task-btn"
                  aria-label="Create Task"
                  title="Create Task"
                  @click.stop="createTaskFromGoal(goal)"
                >
                  <i class="fa-duotone fa-regular fa-plus"></i> Start Task
                </button>
              </div>
              
              <div class="d-flex mt-2">
                <span class="badge d-flex align-items-center mr-2" style="color: #6c757d">
                  <i class="fa-duotone fa-regular fa-fire-flame-curved mr-1" :style="(goal.streak > 0) ? { color: '#fd7e14' } : {}"></i>
                  {{ goal.streak }} weeks
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="task-history">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="section-title mb-0">Task History</h2>
        <div class="d-flex align-items-center">
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm mr-2"
            @click="toggleCompleted()"
          >
            {{ showCompletedButtonText }}
          </button>
          <button
            type="button"
            :disabled="!(cards.length > 0)"
            class="btn btn-outline-danger btn-sm"
            @click="clearCards()"
          >
            Clear Cards
          </button>
        </div>
      </div>

      <div class="row">
        <template v-for="group in groupedCards" :key="group.date">
          <div class="col-12 mb-3">
            <h3 class="date-header">
              {{ group.formattedDate }}
              <small class="text-muted" v-if="!group.isToday">
                (click task to duplicate to today)
              </small>
            </h3>
          </div>

          <task-card
            v-for="card in group.cards"
            :key="card.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
            :id="card.id"
            :data-card-id="card.id"
            :title="card.title"
            :project="card.project"
            :description="card.description"
            :progress-color="getProgressColor(card)"
            :progress="card.percentage"
            :task-state-string="getStateString(card)"
            :time="card.time"
            :eta="card.eta"
            :is-selected="card.isSelected"
            :is-editing="isEditing"
            :project-color="getProjectColor(card.project)"
            :billable="card.billable"
            @card-closed="removeCard(card.id)"
            @card-clicked="cardClicked(card)"
            @edit-title="editField($event, card.id)"
            @edit-project="editField($event, card.id)"
            @edit-description="editField($event, card.id)"
            @edit-time="editField($event, card.id)"
            @edit-eta="editField($event, card.id)"
            @contextmenu="contextmenu($event, card.id)"
            @change-state="openStateMenu(card)"
            @change-percentage="openPercentageDialog(card)"
            @toggle-billable="toggleBillable(card)"
          />

          <!-- Add Task card at the end of today's group -->
          <div
            v-if="group.isToday"
            class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
          >
            <div
              id="add-new"
              class="card h-100 add-card"
              aria-label="Add Task"
              @click="addCard()"
            >
              <div class="card-body text-center d-flex flex-column justify-content-center">
                <div class="plus-wrapper">
                  <span class="plus-btn rounded-circle"></span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </section>

    <context-menu
      id="context-menu"
      v-model:is-active="context.isActive"
      :x="context.x"
      :y="context.y"
      @outside-x="context.x += $event"
      @outside-y="context.y += $event"
      style="z-index: 1000; position: fixed;"
    >
      <div
        v-for="(state,index) in taskStates"
        :key="`${state}${index}`"
        class="dropdown-item"
        @click="switchCardState(index)"
      >
        {{ state }}
        <span
          v-if="checkTaskState(index)"
          class="float-right ml-3"
        >&#x2713;</span>
      </div>
    </context-menu>

    <percentage-modal
      :is-visible="percentageModal.isVisible"
      :current-percentage="getCardFromId(percentageModal.cardId)?.percentage || 0"
      @save="handlePercentageChange"
      @close="closePercentageModal"
    />
  </div>
</template>

<script lang="ts">
import type { Task } from './global';
import { defineComponent } from 'vue';
import $ from 'jquery';
import TaskCard from '../components/task-card.vue';
import ContextMenu from '../components/context-menu.vue';
import PercentageModal from '../components/percentage-modal.vue';
import { analyticsTrack } from '../services/analytics';

export default defineComponent({
  name: 'TimersPage',
  components: {
    TaskCard,
    ContextMenu,
    PercentageModal,
  },
  data: () => ({
    autoSaver: undefined as number|undefined,
    hideCompletedCards: false,
    isEditing: false,

    timer: {
      startCounting: 0,
      current: undefined as number|undefined,
      delay: 200,
      titleUpdater: undefined as number|undefined,
    },

    idOrigin: 0,
    cards: [] as Task[],

    taskStateCustom: [
      { index: 3, percentage: 100, color: 'var(--success)' },
    ],
    taskStates: [
      'todo',
      'doing',
      'paused',
      'done',
    ],

    context: {
      isActive: false,
      cardId: '',
      x: 0,
      y: 0,
    },

    // event args
    eventArgs: {
      previousActiveCard: undefined as Task|undefined,
      senderCard: undefined as Task|undefined,
    },

    percentageModal: {
      isVisible: false,
      cardId: '',
    },

    goals: [] as {
      id: string;
      project: string;
      weeklyTimeGoal: number; // in milliseconds
      streak: number;
      lastWeekAchieved: string; // YYYY-WW format
    }[],
  }),
  computed: {
    storage() {
      return [
        'taskStateCustom',
        'taskStates',
        'idOrigin',
        'timer',
        'cards',
        'goals',
      ].reduce((exports: any, key) => {
        exports[key] = (this as any)[key]
        return exports;
      }, {});
    },
    showCompletedButtonText() {
      return this.hideCompletedCards ? 'Show Completed' : 'Hide Completed';
    },
    projectBreakdown() {
      const today = this.getTodayLocal();
      const projects = new Map<string, { project: string; time: number; color: string }>();
      let totalTime = 0;

      // Calculate total time and group by project
      this.cardList.forEach(card => {
        if (this.formatDateLocal(card.createdAt) === today) {
          const project = card.project || 'Uncategorized';
          const projectTime = card.time || 0;
          
          if (projects.has(project)) {
            projects.get(project)!.time += projectTime;
          } else {
            projects.set(project, {
              project,
              time: projectTime,
              color: this.getProjectColor(project)
            });
          }
          
          totalTime += projectTime;
        }
      });

      // Convert to array and calculate percentages
      return Array.from(projects.values())
        .sort((a, b) => b.time - a.time)
        .map(project => ({
          ...project,
          percentage: totalTime > 0 ? (project.time / totalTime) * 100 : 0
        }));
    },
    cardList() {
      type Filter = (card: Task) => boolean;
      const filters: Filter[] = [];

      if (this.hideCompletedCards) {
        filters.push((card) => this.taskStates[card.taskState] !== 'done');
      }

      return filters.reduce((cardList, handler) => cardList.filter(handler), this.cards);
    },
    totalWorkTime() {
      const today = this.getTodayLocal();
      const totalMs = this.cards
        .filter(card => this.formatDateLocal(card.createdAt) === today)
        .reduce((total, card) => total + card.time, 0);
      const date = new Date(totalMs + this.timeOffset());
      return date.toISOString().substr(11, 8);
    },
    weeklyWorkTime() {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      // Get the most recent Sunday
      const sunday = new Date(today);
      sunday.setDate(today.getDate() - today.getDay());
      
      // Get all dates from Sunday to today in local timezone
      const weekDates = [];
      const current = new Date(sunday);
      const todayStr = this.getTodayLocal();
      const maxDays = 7; // Maximum days in a week
      let daysProcessed = 0;
      
      while (daysProcessed <= maxDays) {
        const currentStr = this.formatDateLocal(current);
        weekDates.push(currentStr);
        if (currentStr === todayStr) break;
        current.setDate(current.getDate() + 1);
        daysProcessed++;
      }
      
      // Filter cards from this week
      const weekCards = this.cardList.filter(card => 
        weekDates.includes(this.formatDateLocal(card.createdAt))
      );
      
      const totalMs = weekCards.reduce((sum, card) => sum + (card.time || 0), 0);
      const date = new Date(totalMs + this.timeOffset());
      return date.toISOString().substr(11, 8);
    },
    groupedCards() {
      const groups = new Map<string, Task[]>();
      const today = this.getTodayLocal();

      // Initialize today's group even if empty
      groups.set(today, []);

      this.cardList.forEach(card => {
        const date = this.formatDateLocal(card.createdAt);
        if (!groups.has(date)) {
          groups.set(date, []);
        }
        groups.get(date)!.push(card);
      });

      // Convert to array and sort by date descending
      return Array.from(groups.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([date, cards]) => ({
          date,
          isToday: date === today,
          formattedDate: this.formatDate(date),
          cards
        }));
    },
    currentWeek() {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const week = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
      return `${now.getFullYear()}-${week.toString().padStart(2, '0')}`;
    },
    availableProjects() {
      return [...new Set(this.cards.map(card => card.project))];
    },
  },
  mounted() {
    this.loadStorage();

    // Start auto save timer
    this.autoSaver = setInterval(
      () => {
        // Only save if there's an active timer
        if (this.timer.current !== undefined) {
          this.saveStorage();
        }
      },
      this.timer.delay,
    );

    const selectedCard = this.cards.find((card) => card.isSelected);
    if (selectedCard) {
      // restart any selected card's timer
      this.startTimerOn(selectedCard, false);
    }

    window.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;

      this.closeContextMenu();
    });

    analyticsTrack('app', {
      event: 'timers_loaded',
    });

    // Check goals every hour
    setInterval(() => this.checkGoals(), 3600000);

    // Initial goals check
    this.checkGoals();
  },
  methods: {
    createTaskFromGoal(goal) {
      const newCard = this.addCard(goal.project);
      this.$nextTick(() => {
        this.startTimerOn(newCard);
      });
    },
    
    editGoal(goal) {
      this.openGoalModal(goal);
    },
    
    getCardFromId(cardId: string) {
      return this.cards.find((card) => card.id === cardId);
    },

    stopTimerOn(card: Task) {
      card.isSelected = false;

      clearInterval(this.timer.current);
      clearInterval(this.timer.titleUpdater);
      this.timer.current = undefined;
      this.timer.titleUpdater = undefined;
      document.title = 'Timed Report!';
      this.saveStorage(); // Save when timer stops
    },
    startTimerOn(card: Task, updateNowValue = true): void {
      // First, stop any currently running timer
      const selectedCard = this.cards.find(c => c.id !== card.id && c.isSelected);
      if (selectedCard) {
        this.stopTimerOn(selectedCard);
        this.eventArgs.previousActiveCard = selectedCard;
      }
      
      // Then start the new timer
      card.isSelected = true;
      
      // Ensure time is initialized
      if (typeof card.time !== 'number' || card.time < 0) {
        card.time = 0;
      }

      if (updateNowValue) {
        this.timer.startCounting = Date.now();
      }

      // Update title immediately
      document.title = `${this.formatTime(card.time)} - ${card.title} - ${card.project} - Timed Report!`;

      this.timer.current = setInterval(() => {
        const now = Date.now();
        const timeDiff = now - this.timer.startCounting;
        if (timeDiff > 0) {  // Only update if time has actually progressed
          card.time += timeDiff;
          this.timer.startCounting = now;
        }
      }, this.timer.delay);

      // Update title every second
      this.timer.titleUpdater = setInterval(() => {
        document.title = `${this.formatTime(card.time)} - ${card.title} - ${card.project} - Timed Report!`;
      }, 1000);
    },

    getProgressColor(card: Task): string {
      const newState = this.taskStateCustom.find((element) => {
        return element.index === card.taskState;
      });

      if (newState === undefined) { return ''; }

      return newState.color;
    },
    getStateString(card: Task): string {
      return this.taskStates[card.taskState];
    },

    cardClicked(card: Task): void {
      this.eventArgs.senderCard = card;

      if (this.isEditing) {
        return;
      }

      if (this.formatDateLocal(card.createdAt) !== this.getTodayLocal()) {
        this.duplicateCard(card);
        return;
      }

      if (card.isSelected) {
        this.stopTimerOn(card);
      } else {
        this.startTimerOn(card);
      }
    },

    ifEditingTime(field: HTMLElement) {
      const cardElement = field.parentNode as HTMLDivElement;
      const card = this.getCardFromId(cardElement.id) as Task;
      const isEta = field.classList.contains('eta');

      if (cardElement?.classList.contains('selected') && !isEta) {
        // because if editing title..description the parentNode == card-body
        this.stopTimerOn(card);
      }

      return {
        wasEta: isEta,
        wasTimer: field.classList.contains('timer'),
        wasRunning: cardElement.classList.contains('selected'),
      };
    },
    timeOffset() {
      return new Date(0).getTimezoneOffset() * 60000;
    },
    editField(field: HTMLElement, cardId: string) {
      const timer = this.ifEditingTime(field);
      const property = field.dataset.boundProperty as keyof Task;

      const callback = () => {
        const textBasedProperties = [
          'title',
          'project',
          'description',
        ] as const;

        if (!textBasedProperties.includes(property as any)) return;

        const card = this.getCardFromId(cardId);
        if (card) {
          type TextBasedProperties = typeof textBasedProperties[number];
          card[property as TextBasedProperties] = field.innerHTML.trim() || '-';
          this.saveStorage(); // Save text-based edits
        }
        this.$forceUpdate();
      };

      const outOfFocusBehaviour = () => {
        this.isEditing = false;
        field.setAttribute('contenteditable', 'false');

        callback();

        let cardIdForTimer: string|undefined = undefined;
        let timeString;
        if (timer.wasTimer || timer.wasEta) {
          cardIdForTimer = (field.parentNode as HTMLDivElement|undefined)?.id;
          timeString = field.innerHTML.match(/(\d+):(\d{2}):(\d{2})/);
        }

        if (!cardIdForTimer) return;
        const card = this.getCardFromId(cardIdForTimer) as Task;

        // if it was editing and has a valid time string
        if (timer.wasTimer && timeString != null) {
          card.time = this.parseTimeString(timeString[0]);
          this.saveStorage(); // Save time edits
        }
        if (timer.wasEta && timeString != null) {
          card.eta = this.parseTimeString(timeString[0]);
          this.saveStorage(); // Save ETA edits
        }
        if (timer.wasTimer && timer.wasRunning) {
          this.startTimerOn(card);
          // was triggering outOfFocusBehaviour multiple times, this is a workaround
          timer.wasTimer = false;
        }

        analyticsTrack('task_edit', {
          name: property,
        });
      };

      this.isEditing = true;
      field.setAttribute('contenteditable', 'true');
      field.focus();

      // select text in field
      const range = document.createRange();
      range.selectNodeContents(field);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      $(field).on('blur', () => {
        outOfFocusBehaviour();
      });
      $(field).on('keydown', (e) => {
        if (e.key !== 'Enter') {
          return;
        }
        outOfFocusBehaviour();
        e.preventDefault();
      });
    },

    addCard(project = 'Project name') {
      this.idOrigin += 1;

      const newCard = {
        id: `card-${this.idOrigin}`,
        title: 'Task description',
        project: project,
        description: 'Full description',
        time: 0,
        eta: 0,
        taskState: 0,
        percentage: 0,
        isSelected: false,
        isHidden: false,
        createdAt: this.getTodayLocal(),
        billable: false,
      };

      this.cards.push(newCard);
      this.saveStorage();
      analyticsTrack('task_create', { count: this.idOrigin });
      
      return newCard;
    },
    removeCard(cardId: string) {
      this.cards = this.cards.filter((element) => element.id !== cardId);
      this.saveStorage(); // Save when removing a card
      analyticsTrack('task_delete');
    },
    clearCards() {
      clearInterval(this.timer.current);
      this.timer.current = undefined;
      this.idOrigin = 0;
      this.cards = [];
      this.saveStorage(); // Save when clearing all cards
      analyticsTrack('navbar', {
        name: 'Clear Cards',
      });
    },

    saveStorage() {
      this.clearOldTasks();
      window.localStorage.setItem('vm-data',
        JSON.stringify(this.storage));
    },
    loadStorage() {
      const raw = window.localStorage.getItem('vm-data');
      if (raw === null || raw === 'undefined') {
        return;
      }

      const load = JSON.parse(raw);

      Object.keys(load).forEach((loadedProperty) => {
        const loaded = load[loadedProperty];

        if (loaded !== undefined) {
          (this as any)[loadedProperty] = loaded;
        }
      });

      this.clearOldTasks();
      
      // Track when goals are loaded
      if (this.goals.length > 0) {
        analyticsTrack('goals', {
          event: 'loaded',
          count: this.goals.length
        });
      }
    },
    clearStorage() {
      clearInterval(this.timer.current);
      clearInterval(this.autoSaver);

      this.timer.current = undefined;
      this.clearCards();

      window.localStorage.clear();
    },

    contextmenu(event: MouseEvent, cardId: string) {
      if (this.isEditing) {
        return;
      }

      event.preventDefault();

      this.context.x = event.x;
      this.context.y = event.y;
      this.context.isActive = true;
      this.context.cardId = cardId;
    },
    switchCardState(statesIndex: number) {
      const card = this.getCardFromId(this.context.cardId) as Task;
      card.taskState = statesIndex;

      const newState = this.taskStateCustom.find((element) => {
        return element.index === statesIndex;
      });
      if (newState === undefined) { return; }

      card.percentage = newState.percentage;
      this.saveStorage(); // Save when changing task state

      analyticsTrack('contextmenu', {
        event: 'select',
        name: this.taskStates[statesIndex],
        type: 'state',
      });
    },
    checkTaskState(taskIndex: number) {
      const card = this.getCardFromId(this.context.cardId);
      if (card === undefined) { return false; }

      return card.taskState === taskIndex;
    },
    showPercentageOption() {
      const card = this.getCardFromId(this.context.cardId);
      if (card === undefined) { return false; }

      const hasMatchingPercentage = this.taskStateCustom.find((element) => {
        return element.index === card.taskState;
      }) !== undefined;

      return !hasMatchingPercentage;
    },
    changePercentage() {
      const card = this.getCardFromId(this.context.cardId) as Task;
      // eslint-disable-next-line no-alert
      const promptAnswer = prompt(
        'Change task percentage:',
        card?.percentage.toString(),
      );

      // convert to Number
      const newValue = Number(promptAnswer);

      if (Number.isNaN(newValue)) return;

      card.percentage = newValue;
      analyticsTrack('contextmenu', {
        event: 'select',
        name: 'change percentage',
        type: 'builtin',
      });
    },

    toggleCompleted() {
      this.hideCompletedCards = !this.hideCompletedCards;

      analyticsTrack('navbar', {
        name: 'Hide Completed',
      });
    },

    openStateMenu(card: Task) {
      // Position the context menu next to the state button
      const cardElement = document.getElementById(card.id);
      if (!cardElement) return;

      const stateButton = cardElement.querySelector('.state-button') as HTMLElement;
      if (!stateButton) return;

      const rect = stateButton.getBoundingClientRect();
      this.context.x = rect.x + rect.width;
      this.context.y = rect.y;
      this.context.isActive = true;
      this.context.cardId = card.id;
    },

    openPercentageDialog(card: Task) {
      this.percentageModal.cardId = card.id;
      this.percentageModal.isVisible = true;
    },

    handlePercentageChange(newPercentage: number) {
      const card = this.getCardFromId(this.percentageModal.cardId);
      if (card) {
        card.percentage = newPercentage;
        this.saveStorage(); // Save when changing percentage
        analyticsTrack('task_edit', {
          name: 'percentage',
        });
      }
      this.percentageModal.isVisible = false;
    },

    closePercentageModal() {
      this.percentageModal.isVisible = false;
    },

    getProjectColor(project: string) {
      const hash = project.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      return `hsl(${hash % 360}, 70%, 50%)`;
    },

    // Format date to YYYY-MM-DD in local timezone
    formatDateLocal(date: Date | string): string {
      const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    // Get today's date in local timezone as YYYY-MM-DD
    getTodayLocal(): string {
      return this.formatDateLocal(new Date());
    },

    // Format date for display with proper timezone handling
    formatDate(dateStr: string): string {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const inputDate = this.formatDateLocal(dateStr);
      const todayStr = this.formatDateLocal(today);
      const yesterdayStr = this.formatDateLocal(yesterday);

      if (inputDate === todayStr) {
        return 'Today';
      }
      if (inputDate === yesterdayStr) {
        return 'Yesterday';
      }

      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    },

    duplicateCard(card: Task) {
      // If the original card is from today, add a number to the title
      let newTitle = card.title;
      if (this.formatDateLocal(card.createdAt) === this.getTodayLocal()) {
        const titleMatch = card.title.match(/^(.*?)(?:\s*\((\d+)\))?$/);
        if (titleMatch) {
          const baseTitle = titleMatch[1].trim();
          const copyNumber = titleMatch[2] ? parseInt(titleMatch[2]) + 1 : 1;
          newTitle = `${baseTitle} (${copyNumber})`;
        }
      }

      const newCard: Task = {
        ...card,
        id: Date.now().toString(),
        title: newTitle,
        time: 0,
        progress: 0,
        state: 0,
        isCompleted: false,
        lastUpdated: Date.now(),
        createdAt: this.getTodayLocal()
      };

      this.cards.push(newCard);

      // Start the timer on the new card
      this.startTimerOn(newCard);

      analyticsTrack('task_duplicate');
    },

    clearOldTasks() {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 45); // 45 days ago
      const cutoffString = cutoffDate.toISOString().split('T')[0];

      const oldTaskCount = this.cards.filter(card => card.createdAt < cutoffString).length;
      this.cards = this.cards.filter(card => card.createdAt >= cutoffString);

      if (oldTaskCount > 0) {
        console.log(`Cleared ${oldTaskCount} tasks older than 45 days`);
      }
    },

    getProjectWeeklyTime(project: string) {
      const now = new Date();
      const sunday = new Date(now);
      sunday.setDate(now.getDate() - now.getDay()); // Go back to last Sunday
      sunday.setHours(0, 0, 0, 0); // Start of the day

      const weekStart = sunday.toISOString().split('T')[0];
      return this.cards
        .filter(card => card.createdAt >= weekStart && card.project === project)
        .reduce((total, card) => total + card.time, 0);
    },

    formatTime(ms: number) {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    parseTimeString(timeStr: string): number {
      const match = timeStr.match(/(\d+):(\d{2}):(\d{2})/);
      if (!match) return 0;

      const [, hours, minutes, seconds] = match;
      return (parseInt(hours) * 3600000) + (parseInt(minutes) * 60000) + (parseInt(seconds) * 1000);
    },

    openGoalModal(goal = null) {
      this.goalModal.editingGoal = goal ? { ...goal } : {
        project: '',
        weeklyTimeGoal: 0,
        streak: 0,
        lastWeekAchieved: this.currentWeek
      };
      this.goalModal.isVisible = true;
    },

    closeGoalModal() {
      this.goalModal.isVisible = false;
    },

    saveGoal(goal: any) {
      if (goal.id) {
        // Update existing goal
        const index = this.goals.findIndex(g => g.id === goal.id);
        if (index !== -1) {
          this.goals[index] = goal;
        }
      } else {
        // Add new goal
        goal.id = `goal-${Date.now()}`;
        this.goals.push(goal);
      }
      this.saveStorage();
      this.closeGoalModal();
    },

    checkGoals() {
      const currentWeek = this.currentWeek;

      this.goals.forEach(goal => {
        const weeklyTime = this.getProjectWeeklyTime(goal.project);

        // If we're in a new week
        if (goal.lastWeekAchieved !== currentWeek) {
          // Check if previous week's goal was met
          if (weeklyTime >= goal.weeklyTimeGoal) {
            goal.streak++;
            goal.lastWeekAchieved = currentWeek;
          } else {
            goal.streak = 0;
          }
        }
      });

      this.saveStorage();
    },

    addGoal() {
      const newGoal = {
        id: `goal-${Date.now()}`,
        project: 'Project name',
        weeklyTimeGoal: 3600000, // 1 hour default
        streak: 0,
        lastWeekAchieved: this.currentWeek
      };
      this.goals.push(newGoal);
      this.saveStorage();
    },

    removeGoal(goalId: string) {
      this.goals = this.goals.filter(goal => goal.id !== goalId);
      this.saveStorage();
    },

    editGoalField(event: MouseEvent, goalId: string) {
      if (this.isEditing) return;

      const field = event.target as HTMLElement;
      const originalText = field.textContent?.trim() || '';
      this.isEditing = true;
      field.setAttribute('contenteditable', 'true');
      field.focus();

      // Select text in field
      const range = document.createRange();
      range.selectNodeContents(field);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      const property = field.dataset.boundProperty as keyof typeof this.goals[0];
      const goal = this.goals.find(g => g.id === goalId);
      if (!goal) return;

      const cleanup = () => {
        this.isEditing = false;
        field.setAttribute('contenteditable', 'false');
      };

      $(field).on('blur', () => {
        let value: string | number = field.textContent?.trim() || originalText;

        if (property === 'weeklyTimeGoal') {
          // Parse time format (HH:MM:SS) to milliseconds
          const timeMs = this.parseTimeString(value);
          value = timeMs || goal.weeklyTimeGoal;
          field.textContent = this.formatTime(value);
        }

        if (property === 'project') {
          value = value || 'Project name';
          field.textContent = value;
        }

        goal[property] = value;
        this.saveStorage();
        cleanup();
      });

      $(field).on('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          field.blur();
        }
      });
    },

    toggleBillable(card: Task) {
      card.billable = !card.billable;
      this.saveStorage();
      analyticsTrack('task_edit', {
        name: 'billable',
        value: card.billable,
      });
    },
  },
});
</script>

<style lang="scss">
.project-breakdown {
  .progress {
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-bar {
    transition: width 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
      opacity: 0.9;
    }
  }

  .project-label {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: white;
    font-size: 0.875rem;
    white-space: nowrap;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  }

  .color-dot {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 6px;
  }

  .project-legend {
    font-size: 0.875rem;
    color: #666;
  }
}

.dropdown-item {
  cursor: pointer;
  text-transform: capitalize;

  &:active {
    color: white;
  }
}

.date-header {
  font-size: 1.25rem;
  font-weight: 500;
  color: #495057;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0,0,0,.1);
  margin-bottom: 1rem;

  small {
    font-size: 0.875rem;
    font-weight: normal;
  }
}

.add-card {
  cursor: pointer;
  transition: box-shadow .3s ease-out, border-color .3s ease-out;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 18rem;
  border-style: dashed;
  border-width: 2px;

  &:hover {
    border-color: #6c757d;
    box-shadow: 0 0 0 8px rgba(108, 117, 125, 0.1);
  }

  .plus-wrapper {
    .plus-btn {
      width: 48px;
      height: 48px;
      background: #f8f9fa;
      border: 2px solid #dee2e6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: #6c757d;
      transition: all .2s ease-out;
      line-height: 0;
      position: relative;

      &::before {
        content: "+";
        display: block;
        transform: translateY(-3px); /* Fine-tune vertical position */
      }
    }
  }

  &:hover .plus-btn {
    background: #e9ecef;
    border-color: #6c757d;
    color: #495057;
  }
}

.section-title {
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6c757d;
  margin: 0;
}

.task-history {
  .section-title {
    border-bottom: none;
    margin-top: 1rem;
  }
}

.goals {
  .col-xl-5-cols {
    @media (min-width: 1200px) {
      flex: 0 0 20%;
      max-width: 20%;
    }
  }

  .card {
    border-radius: 6px;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }

    .card-header {
      background-color: rgba(0, 0, 0, 0.03);
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      padding: 0.5rem 0.75rem;

      .project-name {
        font-size: 1rem;
        font-weight: 500;
        margin: 0;
        cursor: pointer;
        padding: 0.2em 0.4em;
        margin: -0.2em -0.4em;
        border-radius: 4px;

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        &[contenteditable="true"] {
          outline: 2px solid var(--primary);
          background-color: white;
        }
      }

      .close {
        padding: 0.25rem;
        margin: -0.25rem -0.25rem -0.25rem 0.5rem;
        opacity: 0.5;

        &:hover {
          opacity: 1;
        }
      }

      .badge {
        font-size: 0.75rem;
        padding: 0.3em 0.5em;
      }
    }

    .card-body {
      padding: 0.75rem;
    }

    .progress {
      border-radius: 4px;
      background-color: rgba(0, 0, 0, 0.05);
      height: 6px !important;
      margin-bottom: 0.5rem;
    }

    .progress-bar {
      transition: width 0.3s ease;
    }

    .times-wrapper {
      gap: 0.4em;
      margin-bottom: 0.5rem;
    }

    .current-time {
      font-size: 1rem;
      color: #6c757d;
      line-height: 1;
      margin-inline-end: 0.4em;
    }

    .time-separator {
      color: #6c757d;
      opacity: 0.5;
      font-size: 1rem;
      line-height: 1;
      display: flex;
      align-items: center;
    }

    .time-goal {
      cursor: pointer;
      display: inline-block;
      font-size: 1rem;
      font-weight: 500;
      padding: 0.2em 0.4em;
      margin: -0.2em 0;
      border-radius: 4px;
      line-height: 1;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      &[contenteditable="true"] {
        outline: 2px solid var(--primary);
        background-color: white;
      }
    }

    .text-muted.small {
      font-size: 0.75rem;
    }
  }
}
  .start-task-btn {
    color: inherit;
    color: #6c757d;
    transition: color 0.2s ease-in-out;
  }
  
  .start-task-btn:hover {
    color: #28a745 !important;
  }
  
  .start-task-btn:active {
    color: #218838 !important;
  }
</style>
