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
              @click="showConfigModal()"
            >
              Load configs
            </button>
            <button
              type="button"
              class="btn my-2 mr-2 my-sm-0"
              @click="exportToExcel()"
            >
              To Excel
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
      <div
        id="container"
        class="row"
      >
        <div class="mb-4 col-12 col-sm-6 col-md-4 col-lg-3 order-last">
          <div
            id="add-new"
            class="card h-100 add-card"
            @click="addCard()"
          >
            <div class="card-body text-center d-flex flex-column justify-content-center">
              <div class="plus-wrapper">
                <span class="plus-btn rounded-circle">+</span>
              </div>
            </div>
          </div>
        </div>

        <card
          v-for="card in cards"
          :key="card.id"
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
          @card-clicked="cardClicked(card.id)"
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
        {{ getCardFromId(context.cardId).percentage }}% - change it
      </div>

      <template v-if="customActions.length > 0">
        <div class="dropdown-divider"></div>

        <div
          v-for="(custom, index) in customActions"
          :key="`${custom.name}${index}`"
          class="dropdown-item"
          @click="call(custom.action)"
        >
          {{ custom.name }}
        </div>
      </template>

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
              @keyup.ctrl.enter="runConfig()"
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
              @click="runConfig()"
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

    <aside
      v-if="displayNotCookieAlert"
      class="container fixed-bottom"
    >
      <div
        class="alert alert-warning alert-dismissible fade show mx-3"
        role="alert"
      >
        <strong>Holy guacamole!</strong>
        This site uses your <s>cookies</s> <code>window.localStorage</code>.
        Deal with it!
        <small>— The cool kids now use <code>window.localStorage</code></small>
        <button
          type="button"
          class="close"
          data-dismiss="alert"
          aria-label="Close"
          @click="displayNotCookieAlert = false"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </aside>

    <my-footer />
  </div>
</template>

<script>
import { copy } from './utils/copy';
import Card from './components/card.vue';
import ContextMenu from './components/context.vue';
import MyFooter from './components/my-footer.vue';

export default {
  components: {
    Card,
    ContextMenu,
    MyFooter,
  },
  data() {
    return {
      autoSaver: null,
      displayNotCookieAlert: true,
      beta: false,
      configEntry: '',

      isEditing: false,

      timer: {
        startCounting: 0,
        current: null,
        delay: 200,
      },

      idOrigin: 0,
      cards: [],

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

      customActions: [
        {
          name: 'Now with custom actions',
          action: "(function(){vm.showConfigModal();vm.configEntry=\"vm.customActions[0]=({\\n    name: 'Increment It!',\\n    action: '( function(){\\\\\\n    let card=vm.getCardFromId(vm.context.cardId);\\\\\\n    if( card.percentage == 0 ) { card.taskState = 1; }\\\\\\n    if( card.percentage == 100 ) { return; }\\\\\\n    let n = vm.incrementWithRandom(card);\\\\\\n    if( n == 100 ) { card.taskState = 3; }\\\\\\n    card.percentage=n;\\\\\\n})'});\";setTimeout(()=>{autosize.update(document.querySelector('#config-entry'))},0)})",
        },
      ],

      // event args
      ev: {
        previousActiveCard: null,
        senderCard: null,
      },
      on: {
        cardCliking: '()=>{}',
        cardClicked: '()=>{}',
      },
    };
  },
  computed: {
    storage() {
      return [
        'displayNotCookieAlert',
        'taskStateCustom',
        'customActions',
        'configEntry',
        'taskStates',
        'idOrigin',
        'timer',
        'cards',
        'beta',
      ].reduce((exports, propertyName) => ({
        ...exports,
        [propertyName]: this[propertyName],
      }), {});
    },
  },
  mounted() {
    this.loadStorage();
    // Run config when start
    this.$nextTick(() => {
      // eslint-disable-next-line no-eval
      eval(this.configEntry);
    });
    // Start auto save timer
    this.autoSaver = setInterval(
      () => this.saveStorage(),
      this.timer.delay,
    );

    const selectedCard = this.cards.find((card) => card.isSelected);
    if (selectedCard) {
      // restart any selected card's timer
      this.startTimerOn(selectedCard.id, false);
    }

    window.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;

      this.closeContextMenu();
    });
  },
  methods: {
    getCardFromId(cardId) {
      return this.cards.find((card) => card.id === cardId);
    },

    stopTimerOn(cardId) {
      this.getCardFromId(cardId).isSelected = false;

      clearInterval(this.timer.current);
    },
    startTimerOn(cardId, updateNowValue = true) {
      const selection = document.querySelector('.selected');
      if (selection != null) {
        // stop any running timer
        this.stopTimerOn(selection.id);
        // set the events properties
        this.ev.previousActiveCard = this.getCardFromId(selection.id);
      }

      this.getCardFromId(cardId).isSelected = true;

      if (updateNowValue) {
        this.timer.startCounting = Date.now();
      }

      this.timer.current = setInterval(() => {
        const now = Date.now();
        this.getCardFromId(cardId).time += (now - this.timer.startCounting);

        this.timer.startCounting = now;
      }, this.timer.delay);
    },

    getProgressColor(card) {
      const matchingTaskState = (element) => element.index === card.taskState;
      const newState = this.taskStateCustom.find(matchingTaskState);
      if (newState === undefined) { return ''; }

      return newState.color;
    },
    getStateString(card) {
      return this.taskStates[card.taskState];
    },

    cardClicked(cardId) {
      this.ev.senderCard = this.getCardFromId(cardId);

      this.call(this.on.cardCliking, this.ev);

      if (this.isEditing) {
        return;
      }

      if (this.ev.senderCard.isSelected) {
        this.stopTimerOn(cardId);
        return;
      }

      this.startTimerOn(cardId);

      this.call(this.on.cardClicked, this.ev);
    },

    ifEditingTime(field) {
      const card = field.parentNode;
      const isEta = field.classList.contains('eta');

      if (card.classList.contains('selected') && !isEta) {
        // because if editing title..description the parentNode == card-body
        this.stopTimerOn(card.id);
      }

      return {
        wasEta: isEta,
        wasTimer: field.classList.contains('timer'),
        wasRunning: card.classList.contains('selected'),
      };
    },
    timeOffset() {
      return new Date(0).getTimezoneOffset() * 60000;
    },
    editField(field, cardId) {
      const timer = this.ifEditingTime(field);

      const callback = () => {
        const property = field.dataset.boundProperty;
        if (property === undefined) {
          return;
        }

        this.getCardFromId(cardId)[property] = field.innerHTML.trim() || '-';
        this.$forceUpdate();
      };

      const outOfFocusBehaviour = () => {
        this.isEditing = false;
        field.setAttribute('contenteditable', 'false');

        callback();

        let cardIdForTimer = 0;
        let timeString;
        if (timer.wasTimer || timer.wasEta) {
          cardIdForTimer = field.parentNode.id;
          timeString = field.innerHTML.match(/\d\d:\d\d:\d\d/);
        }
        // if it was editing and has a valid time string
        if (timer.wasTimer && timeString != null) {
          this.getCardFromId(cardIdForTimer).time = new Date(`1970-01-01T${timeString}`).getTime() - this.timeOffset();
        }
        if (timer.wasEta && timeString != null) {
          this.getCardFromId(cardIdForTimer).eta = new Date(`1970-01-01T${timeString}`).getTime() - this.timeOffset();
        }
        if (timer.wasTimer && timer.wasRunning) {
          this.startTimerOn(cardIdForTimer);
          // was triggering outOfFocusBehaviour multiple times, this is a workaround
          timer.wasTimer = false;
        }
      };

      this.isEditing = true;
      field.setAttribute('contenteditable', 'true');
      field.focus();
      document.execCommand('selectAll', false, null);

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

    getRandomPercentage() {
      return Math.floor(
        Math.random() * 100,
      );
    },
    incrementWithRandom(card) {
      const increment = Math.floor(Math.random() * 10);
      let newValue = increment + card.percentage;
      if (newValue > 100) {
        newValue = 100;
      }
      return newValue;
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
    },
    removeCard(cardId) {
      this.cards = this.cards.filter((element) => element.id !== cardId);
    },
    clearCards() {
      clearInterval(this.timer.current);
      this.idOrigin = 0;
      this.cards = [];
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
          this[loadedProperty] = loaded;
        }
      });
    },
    clearStorage() {
      clearInterval(this.timer.current);
      clearInterval(this.autoSaver);

      this.displayCookieAlert = true;
      this.timer.current = null;
      this.beta = false;
      this.clearCards();

      window.localStorage.clear();
    },

    contextmenu(event, cardId) {
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
    switchCardState(statesIndex) {
      const card = this.getCardFromId(this.context.cardId);
      card.taskState = statesIndex;

      const matchingTaskState = (element) => element.index === statesIndex;
      const newState = this.taskStateCustom.find(matchingTaskState);
      if (newState === undefined) { return; }

      const callIt = typeof newState.percentage === 'string';
      // eslint-disable-next-line no-eval
      card.percentage = callIt ? eval(newState.percentage)(card) : newState.percentage;
    },
    checkTaskState(taskIndex) {
      const card = this.getCardFromId(this.context.cardId);
      if (card === undefined) { return false; }

      return card.taskState === taskIndex;
    },
    showPercentageOption() {
      const card = this.getCardFromId(this.context.cardId);
      if (card === undefined) { return false; }

      const matchingTaskState = (element) => element.index === card.taskState;
      const hasMatchingPercentage = this.taskStateCustom.find(matchingTaskState) !== undefined;

      return !hasMatchingPercentage;
    },
    changePercentage() {
      const card = this.getCardFromId(this.context.cardId);
      // eslint-disable-next-line no-alert
      let newValue = prompt('Change task percentage:', card.percentage);

      // convert to Number
      newValue = Number(newValue);

      if (Number.isNaN(newValue)) { return; }

      card.percentage = newValue;
    },

    call(code, handler) {
      // eslint-disable-next-line no-eval
      eval(`(${code})`)(handler);
    },

    showConfigModal() {
      const modal = $('#config-modal');
      modal.on('shown.bs.modal', () => {
        const textarea = $('#config-entry');
        textarea.trigger('focus');

        autosize(textarea);
        textarea.on('autosize:resized', () => {
          modal.modal('handleUpdate');
        });
      });
      modal.modal('show');
    },
    saveConfigFile() {
      const sourceText = this.configEntry; const
        fileIdentity = 'MyTimedReport.config.js';
      const workElement = document.createElement('a');
      if ('download' in workElement) {
        workElement.href = `data:text/plaincharset=utf-8,${escape(sourceText)}`;
        workElement.setAttribute('download', fileIdentity);
        document.body.appendChild(workElement);
        const eventMouse = document.createEvent('MouseEvents');
        eventMouse.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        workElement.dispatchEvent(eventMouse);
        document.body.removeChild(workElement);
      } else throw new DOMException('File saving not supported for this browser');
    },
    runConfig() {
      // eslint-disable-next-line no-eval
      eval(this.configEntry);

      document.querySelector('#config-modal button.btn.d-none.d-sm-block').click();
    },

    excelBase(cardParam) {
      const card = cardParam;
      const time = (t) => (t > 0 ? '' : '-') + new Date((t > 0 ? 1 : -1) * t + this.timeOffset()).toTimeString().match(/\d\d:\d\d:\d\d/)[0];
      const stateString = this.taskStates[card.taskState];

      // removing line breaks
      card.title = card.title.replace(/\n/g, ' ');
      card.project = card.project.replace(/\n/g, ' ');
      card.description = card.description.replace(/\n/g, ' ');

      return `${card.project}\t${card.title}\t${card.description}\t${stateString}\t\t${card.percentage}%\t\t${time(card.time)}\t${time(card.eta - card.time)}\n`;
    },
    toExcel() {
      const card = this.getCardFromId(this.context.cardId);
      const excel = this.excelBase(card);
      copy(excel);
    },
    exportToExcel() {
      let excel = '';
      this.cards.forEach((card) => {
        excel += this.excelBase(card);
      });
      copy(excel);
    },
    loadFileToConfig(event) {
      const file = event.target.files[0];
      if (file == null) return;

      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (evt) => {
        this.configEntry = evt.target.result;
      };
      reader.onerror = (_evt) => {
        // eslint-disable-next-line no-alert
        alert("Couldn't load file's content");
      };
    },
  },
};
</script>
