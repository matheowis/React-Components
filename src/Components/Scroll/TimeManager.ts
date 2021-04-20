import { clamp, lerp } from './calc';

type ICallback = (alpha: number) => void;

class TimeManager {
  private frameID = 0;
  private length = 0;
  public alpha = 0;
  public isStartContinue = false;

  constructor(lengthInSeconds: number) {
    this.length = lengthInSeconds * 1000;
  }

  public start(animCallback: ICallback, endCallback: ICallback) {
    cancelAnimationFrame(this.frameID);
    const startTime = new Date().getTime() - (this.alpha * this.length);
    const requestFunc = () => {
      const currentTime = new Date().getTime();
      this.alpha = clamp((currentTime - startTime) / this.length, 0.0, 1.0);
      animCallback(this.alpha);
      if (this.alpha >= 1.0) {
        endCallback(this.alpha);
        cancelAnimationFrame(this.frameID);
      } else {
        this.frameID = requestAnimationFrame(requestFunc);
      }
    }
    this.frameID = requestAnimationFrame(requestFunc);
  }

  public startContinous(animCallback: ICallback, endCallback: ICallback) {
    cancelAnimationFrame(this.frameID);
    this.isStartContinue = true;

    this.alpha = 0;

    const startTime = new Date().getTime();
    const requestFunc = () => {
      const currentTime = new Date().getTime();
      this.alpha = clamp((currentTime - startTime) / this.length, 0.0, 1.0);
      animCallback(this.alpha);
      if (this.alpha >= 1.0) {
        endCallback(this.alpha);
        this.isStartContinue = false;
        cancelAnimationFrame(this.frameID);
      } else {
        this.frameID = requestAnimationFrame(requestFunc);
      }
    }
    this.frameID = requestAnimationFrame(requestFunc);
  }

  public cancelAnimation() {
    cancelAnimationFrame(this.frameID);
    this.isStartContinue = false;
  }

  public startFromBeginning = (animCallback: ICallback, endCallback: ICallback) => {
    cancelAnimationFrame(this.frameID);
    this.alpha = 0;

    const startTime = new Date().getTime();
    const requestFunc = () => {
      const currentTime = new Date().getTime();
      this.alpha = clamp((currentTime - startTime) / this.length, 0.0, 1.0);
      animCallback(this.alpha);
      if (this.alpha >= 1.0) {
        endCallback(this.alpha);
        cancelAnimationFrame(this.frameID);
      } else {
        this.frameID = requestAnimationFrame(requestFunc);
      }
    }
    this.frameID = requestAnimationFrame(requestFunc);
  }

  public reverse(animCallback: ICallback, endCallback: ICallback) {
    cancelAnimationFrame(this.frameID);

    const startTime = new Date().getTime() - ((1 - this.alpha) * this.length);
    const requestFunc = () => {
      const currentTime = new Date().getTime();
      this.alpha = lerp(1.0, 0.0, clamp((currentTime - startTime) / this.length, 0.0, 1.0));
      animCallback(this.alpha);
      if (this.alpha <= 0.0) {
        endCallback(this.alpha);
        cancelAnimationFrame(this.frameID);
      } else {
        this.frameID = requestAnimationFrame(requestFunc);
      }
    }
    this.frameID = requestAnimationFrame(requestFunc);
  }

  public reverseFromEnd = (animCallback: ICallback, endCallback: ICallback) => {
    cancelAnimationFrame(this.frameID);
    this.alpha = 1;

    const startTime = new Date().getTime() - ((1 - this.alpha) * this.length);
    const requestFunc = () => {
      const currentTime = new Date().getTime();
      this.alpha = lerp(1.0, 0.0, clamp((currentTime - startTime) / this.length, 0.0, 1.0));
      animCallback(this.alpha);
      if (this.alpha <= 0.0) {
        endCallback(this.alpha);
        cancelAnimationFrame(this.frameID);
      } else {
        this.frameID = requestAnimationFrame(requestFunc);
      }
    }
    this.frameID = requestAnimationFrame(requestFunc);
  }
}

export default TimeManager;