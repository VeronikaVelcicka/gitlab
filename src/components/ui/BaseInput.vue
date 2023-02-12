<template>
  <div class="input" :class="hidePlaceholder">
    <input
      class="input__field"
      v-bind="$attrs"
      :value="modelValue ? modelValue : null"
      @input="
        $emit('update:modelValue', $event.target.value);
        handleInput($event);
      "
    />
    <span
      v-if="modelValue"
      class="input__clear"
      @click="$emit('update:modelValue', '')"
    >
      <!-- eslint-disable -->
      <svg xmlns="http://www.w3.org/2000/svg" width="14.367" height="14.406"><path fill="#339989" d="M14.014 12.567a1.078 1.078 0 0 1-1.524 1.524L7.184 8.746l-5.343 5.343a1.078 1.078 0 0 1-1.524-1.522l5.345-5.342L.316 1.839A1.078 1.078 0 0 1 1.84.315l5.345 5.386L12.528.358a1.078 1.078 0 0 1 1.524 1.524L8.707 7.224Z"/></svg>
      <!-- eslint-enable -->
    </span>
    <span v-if="!modelValue" class="input__placeholder">
      {{ $attrs.title }}
    </span>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },

  emits: ["update:modelValue", "input"],

  data() {
    return {
      inputLength: 0,
    };
  },

  computed: {
    hidePlaceholder() {
      return this.modelValue ? "active" : "";
    },
  },

  methods: {
    handleInput(e) {
      this.$emit("input", e.target.value);
      this.inputLength = e.target.value.length;
    },
  },
};
</script>

<style lang="scss" scoped>
.input {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  line-height: 2.2rem;
}

.input__field {
  padding: 1.8rem 2rem;
  font-size: 1.5rem;
  line-height: 1.6rem;
  color: $c-text;
  border: 2px solid transparent;
  border-radius: 5px;
  transition: border-color 0.2s ease;

  &:hover,
  &:focus {
    border-color: $c-primary;
    outline: none;
  }

  &::placeholder {
    opacity: 1;
    color: $c-text;
  }

  /* stylelint-disable */
  &:input-placeholder {
    color: $c-text;
  }

  &::input-placeholder {
    color: $c-text;
  }
  /* stylelint-enable */
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}

.input__clear {
  position: absolute;
  top: 1.8rem;
  right: 2rem;
  cursor: pointer;
}

.input__placeholder {
  position: absolute;
  top: 1.8rem;
  left: 2rem;
  opacity: 0.5;
  font-size: 1.5rem;
  line-height: 1.6rem;
  color: $c-text;
  pointer-events: none;
  transition: all 0.2s linear;
}
</style>
