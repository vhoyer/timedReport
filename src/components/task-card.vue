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
      :style="{
        '--project-color': projectColor,
      }"
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
          class="card-title h4"
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

        <div class="card-actions d-flex justify-content-between align-items-center mb-2" @click.self="$emit('card-clicked')">
          <div class="d-flex align-items-center">
            <button
              type="button"
              class="btn btn-sm btn-link px-2 state-button"
              @click.stop="$emit('change-state')"
            >
              {{ taskStateString }}
            </button>
            <button
              type="button"
              class="btn btn-sm btn-link px-2 billable-button"
              :class="{ 'text-success': billable }"
              :title="billable ? 'Task is billable' : 'Task is not billable'"
              @click.stop="$emit('toggle-billable')"
            >
              $
            </button>
          </div>

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
    billable: {
      type: Boolean,
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

    projectColor: {
      type: String,
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
    'toggle-billable': () => true,
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
      const totalSeconds = Math.floor(this.time / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    etaString() {
      const totalSeconds = Math.floor(this.eta / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    progressColorCss() {
      if (this.progressColor === undefined) {
        return '';
      }

      return `${this.progressColor}!important`;
    },
    projectColorRGB() {
      // Convert HSL to RGB for the fallback shadow
      const color = this.projectColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (!color) return '0, 0, 0';
      
      const h = parseInt(color[1]) / 360;
      const s = parseInt(color[2]) / 100;
      const l = parseInt(color[3]) / 100;

      let r, g, b;

      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }

      return `${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}`;
    }
  },
  watch: {
    projectColorRGB: {
      immediate: true,
      handler(rgb: string) {
        if (this.$refs.card) {
          (this.$refs.card as HTMLElement).style.setProperty('--project-color-rgb', rgb);
        }
      }
    }
  },
  mounted() {
    const card = this.$refs.card as HTMLDivElement;

    const elements = [
      card.querySelector('.card-title'),
      card.querySelector('.card-subtitle'),
      card.querySelector('.card-text'),
      card.querySelector('.card-header.eta'),
      card.querySelector('.card-footer.timer'),
    ].filter((identity) => Boolean(identity)) as HTMLDivElement[];

    elements.forEach((element) => {
      // Remove any existing paste handlers first
      element.removeEventListener('paste', this.pastePureText);
      // Add the paste handler
      element.addEventListener('paste', this.pastePureText);
    });
  },
  beforeUnmount() {
    // Clean up paste event listeners
    const card = this.$refs.card as HTMLDivElement;
    if (!card) return;

    const elements = [
      card.querySelector('.card-title'),
      card.querySelector('.card-subtitle'),
      card.querySelector('.card-text'),
      card.querySelector('.card-header.eta'),
      card.querySelector('.card-footer.timer'),
    ].filter((identity) => Boolean(identity)) as HTMLDivElement[];

    elements.forEach((element) => {
      element.removeEventListener('paste', this.pastePureText);
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
      document.execCommand('insertText', false, text);
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
  margin-top: 0.5rem;
}

.card-text {
  margin-bottom: 0;
  padding-bottom: 0.75rem;
  flex-grow: 1;
  min-height: 3em;
}

.card-subtitle {
  position: relative;
  line-height: 1.2;
}

.task-card {
  transition: box-shadow .3s ease-out, border-color .3s ease-out;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.125);

  &.selected {
    // Fallback for browsers that don't support color-mix
    box-shadow: 0 0 0 8px rgba(var(--project-color-rgb), 0.4),
                0 0 0 3px rgba(var(--project-color-rgb), 0.5);
    // Modern browsers
    box-shadow: 0 0 0 8px color-mix(in srgb, var(--project-color) 40%, transparent),
                0 0 0 3px color-mix(in srgb, var(--project-color) 50%, transparent);
  }

  .card-header.eta,
  .card-footer.timer {
    cursor: pointer;
    padding: 0.2em 0.4em;
    margin: -0.2em -0.4em;
    border-radius: 4px;
    font-size: 1rem;
    line-height: 2;
    font-weight: 500;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    &[contenteditable="true"] {
      outline: 2px solid var(--primary);
      background-color: white;
    }
  }

  .card-header.eta {
    margin-top: 0;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-footer.timer {
    margin-bottom: 0;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-title,
  .card-subtitle,
  .card-text {
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
}

.card-title.h4 {
  font-size: 1.125rem;
  margin-bottom: 1.25rem;
  font-weight: 500;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -0.75rem;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 2px;
    background-color: var(--project-color);
    border-radius: 1px;
  }
}

.card-subtitle {
  line-height: 1.2;
}

.billable-button {
  font-weight: 600;
  opacity: 0.5;
  transition: opacity 0.2s ease, color 0.2s ease, background-color 0.2s ease;
  aspect-ratio: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin-left: 4px;

  &:hover {
    opacity: 0.8;
    background-color: rgba(0, 0, 0, 0.05);
  }

  &.text-success {
    opacity: 1;
    background-color: rgba(40, 167, 69, 0.1);

    &:hover {
      background-color: rgba(40, 167, 69, 0.15);
    }
  }
}
</style>
