import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  debugEl : HTMLElement | null = null;
  btnColor = "#DBB637";
  // Mapping of indexes to icons: start from banana in middle of initial position and then upwards
  iconMap = ["Mint Menthol", "Supa Grape" ,"Lemon Menthol", "Supa Black Cherry" ,  "Supa Mint", "Supa Mango"];
  // Width of the icons
  icon_width = 79;
  // Height of one icon in the strip
  icon_height = 79;
  // Number of icons in the strip
  num_icons = 6;
  // Max-speed in ms for animating one icon down
  time_per_icon = 100;
  // Holds icon indexes
  indexes = [0, 0, 0];
  constructor() {}


  /**
   * Roll one reel
   */
  roll = (reel: any, offset = 0): Promise<number> => {
    // Minimum of 2 + the reel offset rounds
    const delta = (offset + 2) * this.num_icons + Math.round(Math.random() * this.num_icons);

    // Return promise so we can wait for all reels to finish
    return new Promise((resolve, reject) => {

      const style = getComputedStyle(reel),
        // Current background position
        backgroundPositionY = parseFloat(style.backgroundPositionY),
        // Target background position
        targetBackgroundPositionY = backgroundPositionY + delta * this.icon_height,
        // Normalized background position, for reset
        normTargetBackgroundPositionY = targetBackgroundPositionY%(this.num_icons * this.icon_height);

      // Delay animation with timeout, for some reason a delay in the animation property causes stutter
      setTimeout(() => {
        // Set transition properties ==> https://cubic-bezier.com/#.41,-0.01,.63,1.09
        reel.style.transition = `background-position-y ${(8 + delta) * this.time_per_icon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
        // Set background position
        reel.style.backgroundPositionY = `${backgroundPositionY + delta * this.icon_height}px`;
      }, offset * 150);

      // After animation
      setTimeout(() => {
        // Reset position, so that it doesn't get higher without limit
        reel.style.transition = `none`;
        reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
        // Resolve this promise
        resolve(delta%this.num_icons);
      }, (8 + delta) * this.time_per_icon + offset * 150);

    });
  };


  /**
   * Roll all reels, when promise resolves roll again
   */
  rollAll = ()=> {

    this.debugEl = document.getElementById('debug');
    if (this.debugEl == null)
      return;

    this.debugEl.textContent = 'rolling...';

    const reelsList = document.querySelectorAll('.slots > .reel');
    let reels: Element[] = [];
    reelsList.forEach((reel) => reels.push(reel));

    Promise

      // Activate each reel, must convert NodeList to Array for this with spread operator
      .all( reels.map((reel, i) => this.roll(reel, i)) )

      // When all reels done animating (all promises solve)
      .then((deltas:number[]) => {
        // add up indexes
        deltas.forEach((delta: number, i) => this.indexes[i] = (this.indexes[i] + delta) % this.num_icons);
        if (this.debugEl != null)
          this.debugEl.textContent = this.indexes.map((i) => this.iconMap[i]).join(' - ');

        // Win conditions
        if (
          this.indexes[0] == this.indexes[1]
          || this.indexes[1] == this.indexes[2]
          || this.indexes[0] == this.indexes[2]) {
          const winCls = (
              this.indexes[0] == this.indexes[1]
            && this.indexes[0] == this.indexes[2]
          )? "win2" : "win1";
          let slots =document.querySelector(".slots");
          if (slots == null)
            return;

          slots.classList.add(winCls);
          setTimeout(() => slots.classList.remove(winCls), 2000)
        }

      });
  };

  onSpinClick(event: MouseEvent) {
    this.rollAll();
  }
}
