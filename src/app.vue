<template>
  <div
    class="d-flex flex-column"
    style="min-height:100vh"
    @click="closeContextMenu()"
  >
    <header class="mb-3">
      <nav class="navbar navbar-light bg-light">
        <div class="container">
          <h1 class="navbar-brand mb-0">
            Timed Report!
          </h1>

          <ul class="navbar-nav mr-auto">
            <li class="nav-item">
              <a
                class="nav-link"
                target="_blank"
                href="https://github.com/vhoyer/timedReport/issues/new"
              >Feature request?</a>
            </li>
          </ul>

          <form class="form-inline">
            <button
              type="button"
              class="btn my-2 mr-2 my-sm-0"
              @click="toggleCompleted()"
            >
              {{ showCompletedButtonText }}
            </button>
            <button
              type="button"
              :disabled="!(cards.length > 0)"
              class="btn btn-outline-danger my-2 my-sm-0"
              @click="clearCards()"
            >
              Clear Cards
            </button>
          </form>
        </div>
      </nav>
    </header>

    <main
      class="container"
      style="flex-grow:1"
    >
      <div class="project-breakdown mb-4">
        <div class="d-flex justify-content-between align-items-baseline">
          <h5 class="mb-2">Project Breakdown</h5>
          <div class="total-time text-muted">
            Total work time: {{ totalWorkTime }}
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
      </div>

      <div
        id="container"
        class="row"
      >
        <template v-for="group in groupedCards" :key="group.date">
          <div class="col-12 mb-3">
            <h4 class="date-header">
              {{ group.formattedDate }}
              <small class="text-muted" v-if="!group.isToday">
                (click task to duplicate to today)
              </small>
            </h4>
          </div>

          <task-card
            v-for="card in group.cards"
            :key="card.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
            :id="card.id"
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
    </main>

    <context-menu
      :is-active="context.isActive"
      :x="context.x"
      :y="context.y"
      @outside-x="context.x += $event"
      @outside-y="context.y += $event"
      @close-context="context.isActive = false"
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

    <my-footer />
  </div>
</template>

<script lang="ts">
import type { Task } from './global';
import { defineComponent } from 'vue';
import $ from 'jquery';
import autosize from 'autosize';
import TaskCard from './components/task-card.vue';
import ContextMenu from './components/context-menu.vue';
import MyFooter from './components/my-footer.vue';
import PercentageModal from './components/percentage-modal.vue';
import { analyticsTrack } from './services/analytics';

export default defineComponent({
  components: {
    TaskCard,
    ContextMenu,
    MyFooter,
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
  }),
  computed: {
    storage() {
      return [
        'taskStateCustom',
        'taskStates',
        'idOrigin',
        'timer',
        'cards',
      ].reduce((exports: any, key) => {
        exports[key] = (this as any)[key]
        return exports;
      }, {});
    },
    showCompletedButtonText() {
      return this.hideCompletedCards ? 'Show Completed' : 'Hide Completed';
    },
    projectBreakdown() {
      const projects = new Map<string, { time: number; color: string }>();
      let totalTime = 0;

      // Generate random color for a project
      const getProjectColor = (project: string) => {
        const hash = project.split('').reduce((acc, char) => {
          return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        return `hsl(${hash % 360}, 70%, 50%)`;
      };

      // Calculate total time and assign colors
      this.cards.forEach(card => {
        if (!projects.has(card.project)) {
          projects.set(card.project, { time: 0, color: getProjectColor(card.project) });
        }
        const projectData = projects.get(card.project)!;
        projectData.time += card.time;
        totalTime += card.time;
      });

      // Convert to array and calculate percentages
      return Array.from(projects.entries())
        .map(([project, data]) => ({
          project,
          percentage: totalTime > 0 ? (data.time / totalTime) * 100 : 0,
          color: data.color,
          time: data.time
        }))
        .filter(p => p.percentage > 0)
        .sort((a, b) => b.percentage - a.percentage);
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
      const totalMs = this.cards.reduce((total, card) => total + card.time, 0);
      const date = new Date(totalMs + this.timeOffset());
      return date.toTimeString().match(/\d\d:\d\d:\d\d/)?.[0] || '00:00:00';
    },
    groupedCards() {
      const groups = new Map<string, Task[]>();
      const today = new Date().toISOString().split('T')[0];
      
      // Initialize today's group even if empty
      groups.set(today, []);

      this.cardList.forEach(card => {
        const date = card.createdAt || today;
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
    }
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
      event: 'start',
    });
  },
  methods: {
    getCardFromId(cardId: string) {
      return this.cards.find((card) => card.id === cardId);
    },

    stopTimerOn(card: Task) {
      card.isSelected = false;

      clearInterval(this.timer.current);
      this.timer.current = undefined;
      this.saveStorage(); // Save when timer stops
    },
    startTimerOn(card: Task, updateNowValue = true): void {
      const selection = document.querySelector('.selected');

      if (selection != null) {
        const previous = this.getCardFromId(selection.id) as Task;
        // stop any running timer
        this.stopTimerOn(previous);
        // set the events properties
        this.eventArgs.previousActiveCard = previous;
      }

      card.isSelected = true;

      if (updateNowValue) {
        this.timer.startCounting = Date.now();
      }

      this.timer.current = setInterval(() => {
        const now = Date.now();
        card.time += (now - this.timer.startCounting);

        this.timer.startCounting = now;
      }, this.timer.delay);
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

      if (card.createdAt !== new Date().toISOString().split('T')[0]) {
        this.duplicateCard(card);
        return;
      }

      if (this.eventArgs.senderCard.isSelected) {
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
          timeString = field.innerHTML.match(/\d\d:\d\d:\d\d/);
        }

        if (!cardIdForTimer) return;
        const card = this.getCardFromId(cardIdForTimer) as Task;

        // if it was editing and has a valid time string
        if (timer.wasTimer && timeString != null) {
          card.time = new Date(`1970-01-01T${timeString}`).getTime() - this.timeOffset();
        }
        if (timer.wasEta && timeString != null) {
          card.eta = new Date(`1970-01-01T${timeString}`).getTime() - this.timeOffset();
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

    addCard() {
      this.idOrigin += 1;

      this.cards.push({
        id: `card-${this.idOrigin}`,
        title: 'Task description',
        project: 'Project name',
        description: 'Full description',
        time: 0,
        eta: 0,
        taskState: 0,
        percentage: 0,
        isSelected: false,
        isHidden: false,
        createdAt: new Date().toISOString().split('T')[0]
      });

      this.saveStorage(); // Save when adding a new card
      analyticsTrack('task_create', { count: this.idOrigin });
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
    closeContextMenu() {
      this.context.isActive = false;
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

    formatDate(dateStr: string): string {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (dateStr === today.toISOString().split('T')[0]) {
        return 'Today';
      }
      if (dateStr === yesterday.toISOString().split('T')[0]) {
        return 'Yesterday';
      }

      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    duplicateCard(card: Task) {
      // Only duplicate if it's not from today
      if (card.createdAt === new Date().toISOString().split('T')[0]) {
        return;
      }

      this.idOrigin += 1;
      const newCard: Task = {
        ...card,
        id: `card-${this.idOrigin}`,
        time: 0,
        isSelected: false,
        createdAt: new Date().toISOString().split('T')[0]
      };

      this.cards.push(newCard);
      analyticsTrack('task_duplicate');
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
        transform: translateY(-1px); /* Fine-tune vertical position */
      }
    }
  }

  &:hover .plus-btn {
    background: #e9ecef;
    border-color: #6c757d;
    color: #495057;
  }
}
</style>
