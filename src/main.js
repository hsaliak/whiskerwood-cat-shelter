import Phaser from 'phaser';

class StarterScene extends Phaser.Scene {
  constructor() {
    super('starter');
    this.clicks = 0;
  }

  create() {
    this.add
      .text(400, 250, 'Hello, Phaser!', {
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontSize: '36px',
      })
      .setOrigin(0.5);

    this.counter = this.add
      .text(400, 310, 'Click or tap to play · 0', {
        color: '#b8c7dc',
        fontFamily: 'sans-serif',
        fontSize: '20px',
      })
      .setOrigin(0.5);

    this.input.on('pointerdown', () => {
      this.clicks += 1;
      this.counter.setText(`Click or tap to play · ${this.clicks}`);
    });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 500,
  backgroundColor: '#101827',
  scene: StarterScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
