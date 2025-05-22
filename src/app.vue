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
              @click="exportToExcel()"
            >
              To Excel
            </button>
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
        <h5 class="mb-2">Project Breakdown</h5>
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
        <div class="mb-4 col-12 col-sm-6 col-md-4 col-lg-3 order-last">
          <div
            id="add-new"
            class="card h-100 add-card"
            aria-label="Add Task"
            @click="addCard()"
          >
            <div class="card-body text-center d-flex flex-column justify-content-center">
              <div class="plus-wrapper">
                <span class="plus-btn rounded-circle">+</span>
              </div>
            </div>
          </div>
        </div>

        <task-card
          v-for="card in cardList"
          :key="card.id"
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
          @card-closed="removeCard(card.id)"
          @card-clicked="cardClicked(card)"
          @edit-title="editField($event, card.id)"
          @edit-project="editField($event, card.id)"
          @edit-description="editField($event, card.id)"
          @edit-time="editField($event, card.id)"
          @edit-eta="editField($event, card.id)"
          @contextmenu="contextmenu($event, card.id)"
        />
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
        class="dropdown-item"
        @click="toExcel()"
      >
        to excel
      </div>

      <div
        v-if="showPercentageOption()"
        class="dropdown-item"
        @click="changePercentage()"
      >
        {{ getCardFromId(context.cardId)?.percentage }}% - change it
      </div>

      <div class="dropdown-divider"></div>

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

    <div
      id="config-modal"
      class="modal"
      tabindex="-1"
      role="dialog"
    >
      <div
        class="modal-dialog modal-lg modal-dialog-centered"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Your custom configuragions
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Insert valid JavaScript here, or else, face the consequences.</p>
            <textarea
              id="config-entry"
              v-model="configEntry"
              class="form-control"
              @keyup.ctrl.enter="updateConfig()"
            ></textarea>
          </div>
          <div class="modal-footer">
            <div class="input-group">
              <div class="custom-file">
                <input
                  id="inputGroupFile04"
                  type="file"
                  class="custom-file-input"
                  @change="loadFileToConfig"
                >
                <label
                  class="custom-file-label"
                  for="inputGroupFile04"
                >Load a file</label>
              </div>
            </div>

            <button
              type="button"
              class="btn btn-primary"
              data-dismiss="modal"
              @click="updateConfig()"
            >
              <i class="fas fa-play d-inline d-sm-none d-lg-inline"></i>
              <span class="d-none d-sm-inline">Run code</span>
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="saveConfigFile()"
            >
              <i class="fas fa-download d-inline d-md-none d-lg-inline"></i>
              <span class="d-none d-md-inline">Download file</span>
            </button>
            <button
              type="button"
              class="btn d-none d-sm-block"
              data-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <my-footer />
  </div>
</template>

<script lang="ts">
import type { Task } from './global';
import { defineComponent } from 'vue';
import $ from 'jquery';
import autosize from 'autosize';
import { copy } from './utils/copy';
import TaskCard from './components/task-card.vue';
import ContextMenu from './components/context-menu.vue';
import MyFooter from './components/my-footer.vue';
import { analyticsTrack } from './services/analytics';

export default defineComponent({
  components: {
    TaskCard,
    ContextMenu,
    MyFooter,
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
  },
  mounted() {
    this.loadStorage();
    
    // Start auto save timer
    this.autoSaver = setInterval(
      () => this.saveStorage(),
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
        // estimated time of completion
        eta: 0,
        taskState: 0,
        percentage: 0,
        isSelected: false,
        isHidden: false,
      });

      analyticsTrack('task_create', { count: this.idOrigin });
    },
    removeCard(cardId: string) {
      this.cards = this.cards.filter((element) => element.id !== cardId);

      analyticsTrack('task_delete');
    },
    clearCards() {
      clearInterval(this.timer.current);
      this.idOrigin = 0;
      this.cards = [];

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

    excelBase(card: Task) {
      const time = (t: number) => {
        const sign = (t > 0 ? '' : '-');
        const date = new Date(Math.abs(t) + this.timeOffset());

        return sign + date.toTimeString().match(/\d\d:\d\d:\d\d/)?.[0];
      };
      const stateString = this.taskStates[card.taskState];

      const regexLineBreak = /\n/g;
      const cleanLineBreaks = (value: string) => value.replace(regexLineBreak, ' ');

      return [
        cleanLineBreaks(card.project),
        cleanLineBreaks(card.title),
        cleanLineBreaks(card.description),
        stateString,
        '',
        card.percentage + '%',
        '',
        time(card.time),
        time(card.eta - card.time)
      ].join('\t') + '\n';
    },
    toExcel() {
      const card = this.getCardFromId(this.context.cardId) as Task;
      const excel = this.excelBase(card);
      copy(excel);

      analyticsTrack('contextmenu', {
        event: 'select',
        name: 'to excel',
        type: 'builtin',
      });
    },
    exportToExcel() {
      let excel = '';
      this.cards.forEach((card) => {
        excel += this.excelBase(card);
      });
      copy(excel);

      analyticsTrack('navbar', {
        name: 'To Excel',
      });
    },
    loadFileToConfig(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file == null) return;

      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (evt) => {
        this.configEntry = String(evt.target?.result);

        analyticsTrack('custom_config', {
          event: 'load',
        });
      };
      reader.onerror = (_evt) => {
        // eslint-disable-next-line no-alert
        alert("Couldn't load file's content");
      };
    },
    toggleCompleted() {
      this.hideCompletedCards = !this.hideCompletedCards;

      analyticsTrack('navbar', {
        name: 'Hide Completed',
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
</style>
