<template>
  <div>
    <Transition leave-active-class="fade-out-top">
      <div
        v-if="step > 0"
        class="is-flex particles-container"
        :style="[
          step > 0
            ? { bottom: 'unset', top: '25%', left: '1%' }
            : { top: '0px' },
        ]"
      >
        <div class="square-particles bounce-in-top"></div>
        <div class="square-particles-2 bounce-in-top-2"></div>
      </div>
    </Transition>
    <Transition leave-active-class="fade-out-top">
      <div
        v-if="step > 1"
        class="is-flex-column particles-container"
        :style="[
          step > 1
            ? {
                bottom: '10%',
                top: 'unset',
                left: '5%',
                transform: 'rotate(90deg)',
              }
            : { top: '0px' },
        ]"
      >
        <div class="square-particles bounce-in-top"></div>
        <div class="square-particles-2 bounce-in-top-2"></div>
      </div>
    </Transition>
    <Transition leave-active-class="fade-out-top">
      <div
        v-if="step > 2"
        class="is-flex particles-container"
        :style="[
          step > 2
            ? { bottom: '40%', top: 'unset', left: 'unset', right: '10%' }
            : { top: '0px' },
        ]"
      >
        <div class="square-particles bounce-in-top"></div>
        <div
          class="square-particles-2 bounce-in-top-2"
          style="margin-top: 12px"
        ></div>
      </div>
    </Transition>
    <Transition leave-active-class="fade-out-top">
      <div
        v-if="step > 3"
        class="particles-container"
        :style="[
          step > 3
            ? { top: '22%', left: 'unset', right: '35%' }
            : { top: '0px' },
        ]"
      >
        <div class="square-particles bounce-in-top"></div>
        <div
          class="square-particles-2 bounce-in-top-2"
          style="margin-left: 12px"
        ></div>
      </div>
    </Transition>
    <Transition leave-active-class="fade-out-top">
      <div
        v-if="step > 4"
        class="is-flex particles-container"
        :style="[
          step > 4
            ? { bottom: '45%', top: 'unset', left: '18%' }
            : { top: '0px' },
        ]"
      >
        <div class="square-particles bounce-in-top"></div>
        <div class="square-particles-2 bounce-in-top-2"></div>
      </div>
    </Transition>
    <Transition leave-active-class="fade-out-top">
      <div
        v-if="step > 5"
        :style="[
          step > 5
            ? { top: '25%', left: 'unset', right: '1%' }
            : { top: '0px' },
        ]"
        class="is-flex-row particles-container"
      >
        <div class="square-particles bounce-in-top"></div>
        <div
          class="square-particles-2 bounce-in-top-2"
          style="margin-left: 12px"
        ></div>
      </div>
    </Transition>
    <Transition leave-active-class="fade-out-top">
      <div
        v-if="step > 6"
        :style="[
          step > 6
            ? { bottom: '5%', top: 'unset', left: 'calc(50% - 12px)' }
            : { top: '0px' },
        ]"
        class="is-flex particles-container"
      >
        <div class="square-particles bounce-in-top"></div>
        <div
          class="square-particles-2 bounce-in-top-2"
          style="margin-top: 12px"
        ></div>
      </div>
    </Transition>
    <Transition leave-active-class="fade-out-top">
      <div
        v-if="step > 7"
        :style="[
          step > 7
            ? { bottom: '25%', top: 'unset', left: '30%' }
            : { top: '0px' },
        ]"
        class="is-flex-column particles-container"
      >
        <div class="square-particles bounce-in-top"></div>
        <div class="square-particles-2 bounce-in-top-2"></div>
      </div>
    </Transition>
    <Transition leave-active-class="fade-out-top">
      <div
        v-if="step > 8"
        :style="[step > 8 ? { left: '30%', top: '12%' } : { top: '0px' }]"
        class="is-flex particles-container"
      >
        <div class="square-particles bounce-in-top"></div>
        <div
          class="square-particles-2 bounce-in-top-2"
          style="margin-top: 12px"
        ></div>
      </div>
    </Transition>
    <Transition leave-active-class="fade-out-top">
      <div
        v-if="step > 9"
        :style="[
          step > 9
            ? { bottom: '27%', top: 'unset', left: ' unset', right: '50%' }
            : { top: '0px' },
        ]"
        class="is-flex-column particles-container"
      >
        <div class="square-particles bounce-in-top"></div>
        <div class="square-particles-2 bounce-in-top-2"></div>
      </div>
    </Transition>
    <Transition leave-active-class="fade-out-top">
      <div
        v-if="step > 10"
        :style="[step > 10 ? { top: '30%', left: '50%' } : { top: '0px' }]"
        class="is-flex particles-container"
      >
        <div class="square-particles bounce-in-top"></div>
        <div class="square-particles-2 bounce-in-top-2"></div>
      </div>
    </Transition>
  </div>
</template>

<script>
export default {
  name: "particles",
  data() {
    return {
      step: 0,
    };
  },
  watch: {
    step: {
      handler() {
        const app = this;
        if (app.step === 11) {
          clearInterval(app.increasingID);
          app.decreasingStep();
        } else if (app.step === 0) {
          clearInterval(app.decreasingID);
          app.incrementStep();
        }
      },
    },
  },
  mounted() {
    const app = this;
    setTimeout(function () {
      app.incrementStep();
    }, 100);
  },
  methods: {
    incrementStep() {
      const app = this;
      app.increasingID = setInterval(function () {
        app.step++;
      }, 500);
    },
    decreasingStep() {
      const app = this;
      app.decreasingID = setInterval(function () {
        app.step--;
      }, 50);
    },
  },
};
</script>

<style lang="scss" scoped>
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
}
.square-particles {
  width: 12px;
  height: 12px;
  background-color: #9a77ff;
}
.square-particles-2 {
  width: 12px;
  height: 12px;
  background-color: #1eeffd;
}

.bounce-in-top {
  -webkit-animation: bounce-in-top 0.5s both;
  animation: bounce-in-top 0.5s both;
}

.bounce-in-top-2 {
  -webkit-animation: bounce-in-top 1.1s both;
  animation: bounce-in-top 1.1s both;
}

@-webkit-keyframes bounce-in-top {
  0% {
    -webkit-transform: translateY(-500px);
    transform: translateY(-500px);
    -webkit-animation-timing-function: ease-in;
    animation-timing-function: ease-in;
    opacity: 0;
  }
  38% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
    -webkit-animation-timing-function: ease-out;
    animation-timing-function: ease-out;
    opacity: 1;
  }
  55% {
    -webkit-transform: translateY(-65px);
    transform: translateY(-65px);
    -webkit-animation-timing-function: ease-in;
    animation-timing-function: ease-in;
  }
  72% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
    -webkit-animation-timing-function: ease-out;
    animation-timing-function: ease-out;
  }
  81% {
    -webkit-transform: translateY(-28px);
    transform: translateY(-28px);
    -webkit-animation-timing-function: ease-in;
    animation-timing-function: ease-in;
  }
  90% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
    -webkit-animation-timing-function: ease-out;
    animation-timing-function: ease-out;
  }
  95% {
    -webkit-transform: translateY(-8px);
    transform: translateY(-8px);
    -webkit-animation-timing-function: ease-in;
    animation-timing-function: ease-in;
  }
  100% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
    -webkit-animation-timing-function: ease-out;
    animation-timing-function: ease-out;
  }
}
@keyframes bounce-in-top {
  0% {
    -webkit-transform: translateY(-500px);
    transform: translateY(-500px);
    -webkit-animation-timing-function: ease-in;
    animation-timing-function: ease-in;
    opacity: 0;
  }
  38% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
    -webkit-animation-timing-function: ease-out;
    animation-timing-function: ease-out;
    opacity: 1;
  }
  55% {
    -webkit-transform: translateY(-65px);
    transform: translateY(-65px);
    -webkit-animation-timing-function: ease-in;
    animation-timing-function: ease-in;
  }
  72% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
    -webkit-animation-timing-function: ease-out;
    animation-timing-function: ease-out;
  }
  81% {
    -webkit-transform: translateY(-28px);
    transform: translateY(-28px);
    -webkit-animation-timing-function: ease-in;
    animation-timing-function: ease-in;
  }
  90% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
    -webkit-animation-timing-function: ease-out;
    animation-timing-function: ease-out;
  }
  95% {
    -webkit-transform: translateY(-8px);
    transform: translateY(-8px);
    -webkit-animation-timing-function: ease-in;
    animation-timing-function: ease-in;
  }
  100% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
    -webkit-animation-timing-function: ease-out;
    animation-timing-function: ease-out;
  }
}
</style>
