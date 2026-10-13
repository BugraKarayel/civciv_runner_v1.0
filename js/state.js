export const States = {
  IDLE: 'IDLE',
  TUTORIAL: 'TUTORIAL',
  RUN: 'RUN',
  FLY: 'FLY',
  GAMEOVER: 'GAMEOVER',
  ENTER_NAME: 'ENTER_NAME'
};

export const StateMachine = {
  current: States.IDLE,
  timeInState: 0,
  lastInputTime: 0,
  paused: false,
  
  change(newState) {
    this.current = newState;
    this.timeInState = 0;
    this.paused = false;
  },

  togglePause() {
    if (this.current === States.RUN || this.current === States.FLY) {
      this.paused = !this.paused;
      return this.paused;
    }
    return false;
  },
  
  update(dtMs) {
    this.timeInState += dtMs;
  },
  
  registerInput() {
    this.lastInputTime = performance.now();
  },
  
  checkIdleTimeout(now) {
    if (this.current !== States.IDLE && (now - this.lastInputTime > 30000)) {
      this.change(States.IDLE);
      return true;
    }
    return false;
  }
};
