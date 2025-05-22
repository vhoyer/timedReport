<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    class="mb-4 col-12 col-sm-6 col-md-4 col-lg-3"
    data-hj-whitelist
  >
    <div
      ref="card"
      :id="id"
      class="card task-card text-center h-100"
      :class="{ selected: isSelected }"
      :aria-selected="isSelected"
      :aria-labelledby="`${id}-title`"
      role="button"
      tabindex="0"
      @contextmenu="$emit('contextmenu', $event)"
    >
      <div class="close-wrapper">
        <button
          type="button"
          class="close close-card"
          aria-label="Delete Task"
          title="Delete Task"
          @click="$emit('card-closed')"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div
        class="card-header eta"
        data-bound-property="eta"
        @click="cardClickedOr('edit-eta', $event)"
        v-html="etaString"
      ></div>

      <div
        class="card-body d-flex flex-column"
        @click.self="$emit('card-clicked')"
      >
        <div
          :id="`${id}-title`"
          class="card-title h5"
          data-bound-property="title"
          @click="cardClickedOr('edit-title', $event)"
        >
          {{ title }}
        </div>

        <div
          class="card-subtitle mb-2 text-muted"
          data-bound-property="project"
          @click="cardClickedOr('edit-project', $event)"
        >
          {{ project }}
        </div>

        <p
          class="card-text"
          style="flex-grow:inherit"
          data-bound-property="description"
          @click="cardClickedOr('edit-description', $event)"
        >
          {{ description }}
        </p>

        <div class="card-actions d-flex justify-content-between align-items-center mb-2">
          <button
            type="button"
            class="btn btn-sm btn-link px-2"
            @click.stop="$emit('change-state')"
          >
            {{ taskStateString }}
          </button>

          <button
            type="button"
            class="btn btn-sm btn-link px-2"
            @click.stop="$emit('change-percentage')"
          >
            {{ progress }}%
          </button>
        </div>

        <div
          class="progress"
          style="height: 2px;"
        >
          <div
            class="progress-bar bg-secondary"
            role="progressbar"
            :style="{ width: progress+'%', 'background-color': progressColorCss }"
            :aria-valuenow="progress"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>

        <div
          class="card-status"
          @click="$emit('card-clicked')"
        >
          <small class="text-muted">click to {{ isSelected ? 'stop' : 'start' }} timer</small>
        </div>
      </div>

      <div
        class="card-footer timer"
        data-bound-property="time"
        @click="cardClickedOr('edit-time', $event)"
        v-html="timeString"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    project: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    progressColor: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      required: true,
    },
    taskStateString: {
      type: String,
      required: true,
    },

    time: {
      type: Number,
      required: true,
    },
    eta: {
      type: Number,
      required: true,
    },

    isSelected: Boolean,
    isEditing: Boolean,
  },
  emits: {
    'card-closed': () => true,
    'card-clicked': () => true,
    'contextmenu': (_: MouseEvent) => true,
    'change-state': () => true,
    'change-percentage': () => true,
    'edit-eta': (_: HTMLElement) => true,
    'edit-title': (_: HTMLElement) => true,
    'edit-project': (_: HTMLElement) => true,
    'edit-description': (_: HTMLElement) => true,
    'edit-time': (_: HTMLElement) => true,
  },
  data() {
    return {
      delay: 200,
      clicks: 0,
      timer: undefined as number|undefined,
    };
  },
  computed: {
    timeString() {
      return new Date(
        this.time + this.timeOffset()).toTimeString().match(/\d\d:\d\d:\d\d/
      )?.[0];
    },
    etaString() {
      return new Date(
        this.eta + this.timeOffset()).toTimeString().match(/\d\d:\d\d:\d\d/
      )?.[0];
    },
    progressColorCss() {
      if (this.progressColor === undefined) {
        return '';
      }

      return `${this.progressColor}!important`;
    },
  },
  mounted() {
    const card = this.$refs.card as HTMLDivElement;

    const elements = [
      card.querySelector('.card-title'),
      card.querySelector('.card-subtitle'),
      card.querySelector('.card-text'),
    ].filter((identity) => Boolean(identity)) as HTMLDivElement[];

    elements.forEach((element) => {
      element.addEventListener('paste', this.pastePureText);
    });
  },
  methods: {
    timeOffset() {
      return new Date(0).getTimezoneOffset() * 60000;
    },
    cardClickedOr(
      eventName: 'edit-eta'|'edit-title'|'edit-project'|'edit-description'|'edit-time',
      event: MouseEvent,
    ) {
      this.clicks += 1;

      if (this.clicks === 1) {
        const self = this;

        this.timer = setTimeout(() => {
          self.$emit('card-clicked');
          self.clicks = 0;
        }, this.delay);
      } else {
        clearTimeout(this.timer);

        const elementToEdit = event.target as HTMLElement;

        // @ts-ignore -- I don't know how this is an error
        this.$emit(eventName, elementToEdit);
        this.clicks = 0;
      }
    },
    pastePureText(e: ClipboardEvent) {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') ?? '';
      const temp = document.createElement('div');
      temp.innerHTML = text;
      document.execCommand('insertHTML', false, temp.textContent ?? undefined);
    },
  },
});
</script>

<style lang="scss">
.btn-icon {
  padding: 0.25rem;
  line-height: 1;
  color: #6c757d;
  background: transparent;
  border: none;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #495057;
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25);
  }

  svg {
    display: block;
  }
}

.btn-link {
  color: #6c757d;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.875rem;

  &:hover {
    color: #495057;
    text-decoration: none;
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:focus {
    text-decoration: none;
    box-shadow: none;
  }
}

.card-actions {
  margin-left: -0.5rem;
  margin-right: -0.5rem;
}
</style>
