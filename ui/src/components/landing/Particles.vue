<template>
  <div class="no-overflow">
    <div
      v-if="step > 0"
      class="is-flex particles-container flyingLeft"
      :style="[
        step > 0 ? { bottom: 'unset', top: '25%', left: '1%' } : { top: '0px' },
      ]"
    >
      <div class="square-particles floating"></div>
      <div class="square-particles-2 floating-2"></div>
    </div>

    <div
      v-if="step > 1"
      class="is-flex particles-container flyingLeft"
      :style="[
        step > 1
          ? {
              bottom: '10%',
              top: 'unset',
              left: '5%',
            }
          : { top: '0px' },
      ]"
    >
      <div class="square-particles-4 floating"></div>
      <div class="square-particles-3 floating-2" style="margin-top: 12px"></div>
    </div>

    <div
      v-if="step > 2"
      class="is-flex particles-container flyingRight"
      :style="[
        step > 2
          ? { bottom: '40%', top: 'unset', left: 'unset', right: '10%' }
          : { top: '0px' },
      ]"
    >
      <div class="square-particles floating"></div>
      <div class="square-particles-4 floating-2" style="margin-top: 12px"></div>
    </div>

    <div
      v-if="step > 3 && !isMobile"
      class="particles-container flyingRight"
      :style="[
        step > 3 ? { top: '22%', left: 'unset', right: '35%' } : { top: '0px' },
      ]"
    >
      <div class="square-particles floating-2"></div>
      <div class="square-particles-2 floating" style="margin-left: 12px"></div>
    </div>

    <div
      v-if="step > 4"
      class="is-flex particles-container flyingLeft"
      :style="[
        step > 4
          ? { bottom: '45%', top: 'unset', left: '18%' }
          : { top: '0px' },
      ]"
    >
      <div class="square-particles-3 floating-2"></div>
      <div class="square-particles floating"></div>
    </div>

    <div
      v-if="step > 5"
      :style="[
        step > 5 ? { top: '25%', left: 'unset', right: '1%' } : { top: '0px' },
      ]"
      class="is-flex-row particles-container flyingRight"
    >
      <div class="square-particles-2 floating"></div>
      <div
        class="square-particles-4 floating-2"
        style="margin-left: 12px"
      ></div>
    </div>

    <div
      v-if="step > 6"
      :style="[
        step > 6
          ? { bottom: '5%', top: 'unset', left: 'calc(50% - 12px)' }
          : { top: '0px' },
      ]"
      class="is-flex particles-container flyingLeft"
    >
      <div class="square-particles floating"></div>
      <div class="square-particles-2 floating-2" style="margin-top: 12px"></div>
    </div>

    <div
      v-if="step > 7 && !isMobile"
      :style="[
        step > 7
          ? { bottom: '25%', top: 'unset', left: '30%' }
          : { top: '0px' },
      ]"
      class="is-flex-column particles-container flyingLeft"
    >
      <div class="square-particles-3 floating-2"></div>
      <div class="square-particles floating"></div>
    </div>

    <div
      v-if="step > 8"
      :style="[step > 8 ? { left: '30%', top: '12%' } : { top: '0px' }]"
      class="is-flex particles-container flyingLeft"
    >
      <div class="square-particles floating"></div>
      <div class="square-particles-2 floating-2" style="margin-top: 12px"></div>
    </div>

    <div
      v-if="step > 9"
      :style="[
        step > 9
          ? { bottom: '27%', top: 'unset', left: ' unset', right: '50%' }
          : { top: '0px' },
      ]"
      class="is-flex-column particles-container flyingRight"
    >
      <div class="square-particles floating-2"></div>
      <div class="square-particles-4 floating"></div>
    </div>

    <div
      v-if="step > 10"
      :style="[step > 10 ? { top: '30%', left: '50%' } : { top: '0px' }]"
      class="is-flex particles-container flyingLeft"
    >
      <div class="square-particles floating"></div>
      <div class="square-particles-4 floating-2"></div>
    </div>
  </div>
</template>

<script>
import checkViewport from "@/mixins/checkViewport";
export default {
  name: "particles",
  mixins: [checkViewport],
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
          // app.decreasingStep();
        }
        // else if (app.step === 0) {
        //   clearInterval(app.decreasingID);
        //   app.incrementStep();
        // }
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
.square-particles-3 {
  width: 12px;
  height: 12px;
  background-color: #33ff94;
}
.square-particles-4 {
  width: 12px;
  height: 12px;
  background-color: #fff145;
}

// .bounce-1 {
//   -webkit-animation: flyingLeft 0.5s both;
//   animation: flyingLeft 0.5s both;
// }

// .bounce-2 {
//   -webkit-animation: flyingLeft 1.1s both;
//   animation: flyingLeft 1.1s both;
// }

// @-webkit-keyframes bounce {
//   0% {
//     -webkit-transform: translateX(-600px);
//     transform: translateX(-600px);
//     -webkit-animation-timing-function: ease-in;
//     animation-timing-function: ease-in;
//     opacity: 0;
//   }
//   38% {
//     -webkit-transform: translateX(0);
//     transform: translateX(0);
//     -webkit-animation-timing-function: ease-out;
//     animation-timing-function: ease-out;
//     opacity: 1;
//   }
//   55% {
//     -webkit-transform: translateX(-68px);
//     transform: translateX(-68px);
//     -webkit-animation-timing-function: ease-in;
//     animation-timing-function: ease-in;
//   }
//   72% {
//     -webkit-transform: translateX(0);
//     transform: translateX(0);
//     -webkit-animation-timing-function: ease-out;
//     animation-timing-function: ease-out;
//   }
//   81% {
//     -webkit-transform: translateX(-28px);
//     transform: translateX(-28px);
//     -webkit-animation-timing-function: ease-in;
//     animation-timing-function: ease-in;
//   }
//   90% {
//     -webkit-transform: translateX(0);
//     transform: translateX(0);
//     -webkit-animation-timing-function: ease-out;
//     animation-timing-function: ease-out;
//   }
//   95% {
//     -webkit-transform: translateX(-8px);
//     transform: translateX(-8px);
//     -webkit-animation-timing-function: ease-in;
//     animation-timing-function: ease-in;
//   }
//   100% {
//     -webkit-transform: translateX(0);
//     transform: translateX(0);
//     -webkit-animation-timing-function: ease-out;
//     animation-timing-function: ease-out;
//   }
// }
// @keyframes bounce {
//   0% {
//     -webkit-transform: translateX(-600px);
//     transform: translateX(-600px);
//     -webkit-animation-timing-function: ease-in;
//     animation-timing-function: ease-in;
//     opacity: 0;
//   }
//   38% {
//     -webkit-transform: translateX(0);
//     transform: translateX(0);
//     -webkit-animation-timing-function: ease-out;
//     animation-timing-function: ease-out;
//     opacity: 1;
//   }
//   55% {
//     -webkit-transform: translateX(-68px);
//     transform: translateX(-68px);
//     -webkit-animation-timing-function: ease-in;
//     animation-timing-function: ease-in;
//   }
//   72% {
//     -webkit-transform: translateX(0);
//     transform: translateX(0);
//     -webkit-animation-timing-function: ease-out;
//     animation-timing-function: ease-out;
//   }
//   81% {
//     -webkit-transform: translateX(-28px);
//     transform: translateX(-28px);
//     -webkit-animation-timing-function: ease-in;
//     animation-timing-function: ease-in;
//   }
//   90% {
//     -webkit-transform: translateX(0);
//     transform: translateX(0);
//     -webkit-animation-timing-function: ease-out;
//     animation-timing-function: ease-out;
//   }
//   95% {
//     -webkit-transform: translateX(-8px);
//     transform: translateX(-8px);
//     -webkit-animation-timing-function: ease-in;
//     animation-timing-function: ease-in;
//   }
//   100% {
//     -webkit-transform: translateX(0);
//     transform: translateX(0);
//     -webkit-animation-timing-function: ease-out;
//     animation-timing-function: ease-out;
//   }
// }

.flyingLeft {
  animation: linear infinite;
  animation-name: run;
  animation-duration: 30s;
}

.flyingRight {
  animation: linear infinite;
  animation-name: runRight;
  animation-duration: 30s;
}

.floating {
  animation-name: floating;
  animation-duration: 3s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

.floating-2 {
  animation-name: floating;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

@keyframes run {
  0% {
    left: 0;
  }
  50% {
    left: calc(100% + 100px);
  }
  100% {
    left: -100px;
  }
}

@keyframes runRight {
  0% {
    right: 0;
  }
  50% {
    right: calc(100% + 100px);
  }
  100% {
    right: -100px;
  }
}

@keyframes floating {
  from {
    transform: translate(0, 0px);
  }
  65% {
    transform: translate(0, 15px);
  }
  to {
    transform: translate(0, -0px);
  }
}

@media screen and (max-width: 767px) {
  .flyingLeft {
    animation: linear infinite;
    animation-name: runningLeft;
    animation-duration: 20s;
  }

  .flyingRight {
    animation: linear infinite;
    animation-name: runningRight;
    animation-duration: 20s;
  }
  @keyframes runningLeft {
    0% {
      left: 0;
    }
    50% {
      left: 90%;
    }
    100% {
      left: 0;
    }
  }

  @keyframes runningRight {
    0% {
      right: 0;
    }
    50% {
      right: 90%;
    }
    100% {
      right: 0;
    }
  }
}
</style>
