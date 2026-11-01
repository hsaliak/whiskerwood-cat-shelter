import Phaser from 'phaser';
import { CatView } from '../cats/CatView.js';
import { getSeasonForLocale } from '../state/season.js';
import {
  createInitialState,
  applyCareAction,
  assessVisitor,
  adoptCat,
  customizeIncomingCat,
  endDay,
  welcomeIncomingCat,
  resolveDailyEvent,
} from '../state/gameState.js';

export class ShelterScene extends Phaser.Scene {
  constructor() {
    super('shelter');
    this.state = createInitialState();
    this.catViews = new Map();
    this.interactionPoints = {
      water: { x: 160, y: 435 },
      stool: { x: 315, y: 370 },
      bed: { x: 630, y: 394 },
      trampoline: { x: 450, y: 428 },
    };
  }

  preload() {
    this.load.spritesheet('smooth-cat-walk', '/assets/cats/frolicforge/cat-walk-256.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
  }

  createCatAnimations() {
    if (!this.anims.exists('cat-walk-cycle')) {
      this.anims.create({
        key: 'cat-walk-cycle',
        frames: this.anims.generateFrameNumbers('smooth-cat-walk', { start: 0, end: 11 }),
        frameRate: 12,
        repeat: -1,
      });
    }
  }

  create() {
    this.createCatAnimations();
    this.hemispherePreference = typeof window !== 'undefined'
      ? window.whiskerwoodSeasonHemisphere ?? 'auto'
      : 'auto';
    this.motionPreferenceQuery = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    this.onMotionPreferenceChange = (event) => this.handleMotionPreferenceChange(event.matches);
    this.motionPreferenceQuery?.addEventListener?.('change', this.onMotionPreferenceChange);
    this.drawShelter();
    this.createSeasonalWeather();
    this.state.cats.forEach((cat, index) => this.addCat(cat, index));
    this.game.events.on('select-cat', this.selectCat, this);
    this.game.events.on('care-action', this.careForCat, this);
    this.game.events.on('assess-visitor', this.handleAssessment, this);
    this.game.events.on('adopt-cat', this.handleAdoption, this);
    this.game.events.on('end-day', this.handleEndDay, this);
    this.game.events.on('customize-arrival', this.handleCustomizeArrival, this);
    this.game.events.on('welcome-arrival', this.handleWelcomeArrival, this);
    this.game.events.on('resolve-daily-event', this.handleDailyEvent, this);
    this.game.events.on('season-hemisphere', this.handleSeasonHemisphere, this);
    this.scheduleBirdFlyby();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.removeGameListeners, this);
    this.publishState();
  }

  drawShelter() {
    const room = this.add.graphics().setDepth(-10);
    room.fillGradientStyle(0xf7efe3, 0xf7efe3, 0xf1e3d1, 0xf1e3d1, 1);
    room.fillRect(0, 0, 800, 350);
    room.fillGradientStyle(0xd8c09e, 0xd8c09e, 0xc7aa82, 0xc7aa82, 1);
    room.fillRect(0, 350, 800, 210);
    room.fillStyle(0xb89b76, 0.32);
    room.fillRect(0, 347, 800, 7);
    room.fillStyle(0xf8f1e7, 0.85);
    room.fillRect(0, 354, 800, 5);

    this.drawWindow();
    this.createWindowBird();

    const art = this.add.graphics().setDepth(-8);
    art.fillStyle(0xc98f7e, 0.2);
    art.fillRoundedRect(85, 78, 112, 128, 12);
    art.fillStyle(0xfffbf3, 1);
    art.fillRoundedRect(79, 72, 112, 128, 12);
    art.fillStyle(0xe6ede1, 1);
    art.fillRoundedRect(88, 81, 94, 110, 8);
    art.fillStyle(0x789679, 1);
    art.fillEllipse(135, 136, 43, 62);
    art.fillStyle(0xe6bd84, 1);
    art.fillEllipse(135, 154, 58, 24);

    const rug = this.add.graphics().setDepth(-3);
    rug.fillStyle(0x85694f, 0.13);
    rug.fillRoundedRect(225, 408, 420, 116, 54);
    rug.fillStyle(0xe5cdb0, 1);
    rug.fillRoundedRect(218, 395, 420, 116, 54);
    rug.lineStyle(2, 0xc79e79, 0.62);
    rug.strokeRoundedRect(231, 408, 394, 90, 43);
    rug.lineStyle(1, 0xc79e79, 0.42);
    rug.strokeRoundedRect(242, 418, 372, 70, 34);

    this.drawWaterCup(124, 435);
    this.drawStool(315, 418);
    this.drawBed(630, 431);
    this.drawTrampoline(450, 442);
    this.createDiscoEffects();

    this.add.text(400, 26, 'THE SUNROOM', {
      color: '#795f4b',
      fontFamily: 'Georgia, serif',
      fontSize: '15px',
      fontStyle: 'bold',
      letterSpacing: 3,
      backgroundColor: '#fff8e9dd',
      padding: { x: 11, y: 5 },
    }).setOrigin(0.5).setDepth(5);
  }

  drawWindow() {
    this.windowGraphics ??= this.add.graphics().setDepth(-8);
    const window = this.windowGraphics;
    window.clear();
    window.fillStyle(0xbba68d, 0.16);
    window.fillRoundedRect(275, 61, 292, 190, 18);
    window.fillStyle(0xfffcf5, 1);
    window.fillRoundedRect(268, 54, 292, 190, 16);
    window.fillStyle(0xc9e5e6, 1);
    window.fillRoundedRect(278, 64, 272, 170, 11);
    this.drawSeasonalWindow(window);
    window.fillStyle(0xffffff, 0.33);
    window.fillTriangle(290, 72, 405, 72, 340, 228);
    window.fillStyle(0xfaf4e8, 1);
    window.fillRoundedRect(399, 64, 7, 170, 3);
    window.fillRoundedRect(278, 145, 272, 7, 3);
    window.fillStyle(0xfaf4e8, 1);
    window.fillRoundedRect(250, 239, 330, 18, 8);
    window.fillStyle(0xd5b993, 0.45);
    window.fillRoundedRect(260, 252, 310, 9, 4);
  }

  currentSeason() {
    const locale = typeof navigator !== 'undefined' ? navigator.language : 'en';
    return getSeasonForLocale(new Date(), locale, this.hemispherePreference);
  }

  handleSeasonHemisphere(hemisphere) {
    if (!['auto', 'north', 'south'].includes(hemisphere) || hemisphere === this.hemispherePreference) return;
    this.hemispherePreference = hemisphere;
    this.stopSeasonalWeather();
    this.weatherParticles?.forEach((particle) => particle.destroy());
    this.weatherParticles = [];
    this.drawWindow();
    this.createSeasonalWeather();
  }
  drawSeasonalWindow(window) {
    this.season = this.currentSeason();
    const palette = {
      winter: { sky: 0xc9dce7, hill: 0x9fb8b4, ground: 0xe5ece8, tree: 0x80918d },
      spring: { sky: 0xd4e8e2, hill: 0x91b79a, ground: 0xb8d1a7, tree: 0x7da77f },
      summer: { sky: 0xb9dfea, hill: 0x70a87c, ground: 0x92bb79, tree: 0x54885f },
      autumn: { sky: 0xeacfae, hill: 0x9f9a68, ground: 0xb58c5d, tree: 0xa9684e },
    }[this.season];

    window.fillStyle(palette.sky, 1);
    window.fillRoundedRect(281, 67, 266, 164, 9);
    window.fillStyle(this.season === 'winter' ? 0xfaf8e9 : 0xffdf91, 0.9);
    window.fillCircle(505, 98, this.season === 'summer' ? 17 : 13);
    window.fillStyle(0xffffff, this.season === 'autumn' ? 0.42 : 0.58);
    window.fillEllipse(342, 105, 58, 17);
    window.fillEllipse(360, 100, 32, 15);
    window.fillStyle(palette.hill, 1);
    window.fillEllipse(340, 185, 118, 83);
    window.fillEllipse(488, 178, 118, 100);
    window.fillStyle(palette.ground, 1);
    window.fillRect(281, 185, 266, 46);

    window.fillStyle(0x725f4d, 1);
    window.fillRoundedRect(300, 143, 8, 53, 3);
    window.fillRoundedRect(520, 137, 9, 61, 3);
    window.fillStyle(palette.tree, 1);
    if (this.season === 'winter') {
      window.fillTriangle(284, 159, 306, 104, 328, 159);
      window.fillTriangle(288, 145, 306, 91, 324, 145);
      window.fillTriangle(500, 153, 522, 95, 544, 153);
      window.fillTriangle(503, 139, 522, 83, 541, 139);
      window.fillStyle(0xf8fbf8, 0.95);
      window.fillEllipse(415, 197, 260, 16);
      window.fillCircle(350, 113, 2);
      window.fillCircle(390, 145, 2);
      window.fillCircle(462, 119, 2);
    } else {
      window.fillCircle(310, 128, 23);
      window.fillCircle(518, 120, 25);
      if (this.season === 'spring') {
        [289, 304, 318, 511, 527, 538].forEach((x, index) => {
          window.fillStyle(index % 2 ? 0xf2c1c0 : 0xffe6a4, 0.95);
          window.fillCircle(x, 184 + (index % 3) * 8, 3);
        });
      } else if (this.season === 'autumn') {
        window.fillStyle(0xdca66a, 1);
        window.fillCircle(292, 112, 5);
        window.fillCircle(321, 133, 4);
        window.fillCircle(510, 102, 4);
        window.fillCircle(538, 132, 5);
      }
    }
  }

  createWindowBird() {
    this.bird = this.add.container(410, 115).setDepth(-7).setVisible(false);
    const birdShape = this.add.graphics();
    birdShape.fillStyle(0x4c514d, 1);
    birdShape.fillEllipse(0, 2, 12, 6);
    birdShape.fillTriangle(4, 0, 10, 2, 4, 4);
    birdShape.lineStyle(2, 0x4c514d, 1);
    birdShape.beginPath();
    birdShape.moveTo(-7, 1);
    birdShape.lineTo(-3, -4);
    birdShape.lineTo(0, 0);
    birdShape.lineTo(4, -5);
    birdShape.lineTo(8, 1);
    birdShape.strokePath();
    this.bird.add(birdShape);
  }

  createSeasonalWeather() {
    this.weatherParticles = [];
    const particleCount = this.season === 'summer' ? 2 : 7;
    for (let index = 0; index < particleCount; index += 1) {
      const x = Phaser.Math.Between(295, 533);
      const y = Phaser.Math.Between(78, 205);
      const particle = this.add.graphics().setDepth(-7.5).setPosition(x, y);
      if (this.season === 'winter') {
        particle.fillStyle(0xffffff, 0.9);
        particle.fillCircle(0, 0, Phaser.Math.Between(2, 4));
      } else if (this.season === 'spring') {
        particle.lineStyle(2, 0x9dbfce, 0.62);
        particle.lineBetween(-1, -5, 1, 5);
      } else if (this.season === 'autumn') {
        particle.fillStyle(index % 2 ? 0xd79a58 : 0xb46d52, 0.92);
        particle.fillEllipse(0, 0, 9, 5);
      } else {
        particle.fillStyle(index % 2 ? 0xf2c1c0 : 0xffe6a4, 0.9);
        particle.fillEllipse(-4, 0, 8, 5);
        particle.fillEllipse(4, 0, 8, 5);
        particle.fillCircle(0, 0, 2);
      }
      this.weatherParticles.push(particle);
    }
    if (!this.motionPreferenceQuery?.matches) this.startSeasonalWeather();
  }

  startSeasonalWeather() {
    if (!this.weatherParticles?.length || this.weatherAnimationEnabled) return;
    this.weatherAnimationEnabled = true;
    this.weatherParticles.forEach((particle, index) => {
      const startX = particle.x;
      const duration = 3600 + index * 270;
      if (this.season === 'summer') {
        this.tweens.add({
          targets: particle,
          x: Phaser.Math.Clamp(startX + (index % 2 ? -35 : 35), 298, 530),
          y: particle.y + 18,
          angle: index % 2 ? -20 : 20,
          duration,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.InOut',
        });
        return;
      }
      const drift = this.season === 'autumn' ? (index % 2 ? -24 : 24) : (index % 2 ? -7 : 7);
      this.tweens.add({
        targets: particle,
        x: Phaser.Math.Clamp(startX + drift, 291, 537),
        y: 220,
        angle: this.season === 'autumn' ? (index % 2 ? -90 : 90) : 0,
        duration,
        repeat: -1,
        ease: 'Linear',
        onRepeat: () => particle.setPosition(startX, 76),
      });
    });
  }

  stopSeasonalWeather() {
    if (!this.weatherParticles) return;
    this.weatherParticles.forEach((particle) => this.tweens.killTweensOf(particle));
    this.weatherAnimationEnabled = false;
  }

  handleMotionPreferenceChange(reducedMotion) {
    if (reducedMotion) this.stopSeasonalWeather();
    else this.startSeasonalWeather();
    if (!reducedMotion || !this.bird?.visible) return;
    this.tweens.killTweensOf(this.bird);
    this.bird.setPosition(410, this.bird.y);
    this.birdTimer?.remove();
    this.birdTimer = this.time.delayedCall(2800, () => {
      this.birdTimer = null;
      this.bird.setVisible(false);
      this.scheduleBirdFlyby();
    });
  }

  scheduleBirdFlyby() {
    this.birdTimer?.remove();
    this.birdTimer = this.time.delayedCall(16000 + Phaser.Math.Between(0, 14000), () => {
      this.birdTimer = null;
      if (!this.scene.isActive()) return;

      const reducedMotion = typeof window !== 'undefined'
        && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const startX = reducedMotion ? 410 : (Math.random() < 0.5 ? 290 : 538);
      const endX = reducedMotion ? startX : (startX < 400 ? 538 : 290);
      const birdY = Phaser.Math.Between(93, 132);
      this.bird.setPosition(startX, birdY).setVisible(true);
      this.catViews.forEach((view) => view.noticeBird(410));

      const finishFlyby = () => {
        this.bird.setVisible(false);
        this.scheduleBirdFlyby();
      };
      if (reducedMotion) {
        this.birdTimer = this.time.delayedCall(2800, finishFlyby);
      } else {
        this.tweens.add({
          targets: this.bird,
          x: endX,
          y: birdY + Phaser.Math.Between(-12, 12),
          duration: 4300,
          ease: 'Sine.InOut',
          onComplete: finishFlyby,
        });
      }
    });
  }

  drawWaterCup(x, y) {
    const art = this.add.graphics().setDepth(-1);
    art.fillStyle(0x594c3e, 0.12);
    art.fillEllipse(x, y + 12, 78, 16);
    art.fillStyle(0xfaf8f0, 1);
    art.fillRoundedRect(x - 21, y - 25, 42, 34, 10);
    art.fillStyle(0x9bcbd0, 1);
    art.fillEllipse(x, y - 22, 42, 12);
    art.fillStyle(0x74b2ba, 0.75);
    art.fillEllipse(x, y - 20, 30, 6);
    art.lineStyle(2, 0xe2d6c4, 1);
    art.strokeRoundedRect(x - 21, y - 25, 42, 34, 10);
    this.add.text(x, y + 20, 'WATER', {
      color: '#796f61', fontFamily: 'sans-serif', fontSize: '9px', fontStyle: 'bold', letterSpacing: 1,
    }).setOrigin(0.5).setDepth(1);
  }

  drawStool(x, y) {
    const art = this.add.graphics().setDepth(-1);
    art.fillStyle(0x594c3e, 0.12);
    art.fillEllipse(x, y + 7, 102, 18);
    art.fillStyle(0x9c7957, 1);
    art.fillRoundedRect(x - 31, y - 36, 10, 42, 4);
    art.fillRoundedRect(x + 21, y - 36, 10, 42, 4);
    art.fillRoundedRect(x - 39, y - 4, 78, 8, 4);
    art.fillStyle(0xb88b62, 1);
    art.fillRoundedRect(x - 53, y - 48, 106, 18, 8);
    art.fillStyle(0xd7ad7a, 1);
    art.fillRoundedRect(x - 49, y - 47, 98, 12, 6);
    this.add.text(x, y + 14, 'PERCH', {
      color: '#796f61', fontFamily: 'sans-serif', fontSize: '9px', fontStyle: 'bold', letterSpacing: 1,
    }).setOrigin(0.5).setDepth(2);
  }

  drawTrampoline(x, y) {
    const art = this.add.graphics().setDepth(-1);
    art.fillStyle(0x594c3e, 0.15);
    art.fillEllipse(x, y + 19, 166, 21);
    art.fillStyle(0x7f6650, 1);
    art.fillRoundedRect(x - 55, y - 11, 9, 27, 4);
    art.fillRoundedRect(x + 46, y - 11, 9, 27, 4);
    art.fillStyle(0x486c68, 1);
    art.fillEllipse(x, y - 12, 152, 34);
    art.fillStyle(0xc1ded5, 1);
    art.fillEllipse(x, y - 18, 138, 28);
    art.lineStyle(3, 0x709b91, 1);
    art.strokeEllipse(x, y - 18, 138, 28);
    art.lineStyle(1, 0x8bb3a8, 0.7);
    art.lineBetween(x - 56, y - 18, x + 56, y - 18);
    art.lineBetween(x, y - 29, x, y - 7);
    this.add.text(x, y + 25, 'BOUNCE', {
      color: '#6c675b', fontFamily: 'sans-serif', fontSize: '9px', fontStyle: 'bold', letterSpacing: 1,
    }).setOrigin(0.5).setDepth(1);
  }

  createDiscoEffects() {
    this.discoLights = this.add.graphics().setDepth(-2).setAlpha(0).setVisible(false);
    this.discoBall = this.add.container(450, -30).setDepth(6).setVisible(false);
    const ball = this.add.graphics();
    ball.lineStyle(3, 0x806e90, 1);
    ball.lineBetween(0, -44, 0, 8);
    ball.fillStyle(0xd9dce8, 1);
    ball.fillCircle(0, 32, 25);
    ball.lineStyle(2, 0xffffff, 0.8);
    ball.strokeCircle(0, 32, 25);
    ball.fillStyle(0xffffff, 0.72);
    ball.fillEllipse(-9, 22, 13, 8);
    ball.fillStyle(0x8792aa, 0.8);
    ball.fillEllipse(0, 41, 42, 7);
    ball.lineStyle(1, 0xffffff, 0.65);
    ball.lineBetween(-19, 23, 19, 41);
    ball.lineBetween(19, 23, -19, 41);
    ball.lineBetween(-24, 32, 24, 32);
    this.discoBall.add(ball);
  }

  startDiscoMoment(duration = 3200) {
    this.stopDiscoMoment();
    this.discoActive = true;
    this.discoLights.clear();
    this.discoLights.fillStyle(0xff5bb7, 0.16);
    this.discoLights.fillTriangle(450, 140, 60, 560, 350, 560);
    this.discoLights.fillStyle(0x63d8ef, 0.13);
    this.discoLights.fillTriangle(450, 140, 290, 560, 715, 560);
    this.discoLights.fillStyle(0xffd66d, 0.12);
    this.discoLights.fillTriangle(450, 140, 510, 560, 800, 560);
    this.discoLights.setPosition(0, 0).setAlpha(0.55).setVisible(true);
    this.discoBall.setPosition(450, -30).setAngle(0).setAlpha(1).setVisible(true);
    this.tweens.add({ targets: this.discoBall, y: 67, duration: 520, ease: 'Bounce.Out' });
    this.tweens.add({ targets: this.discoBall, angle: 360, duration: 1800, repeat: -1, ease: 'Linear' });
    this.tweens.add({ targets: this.discoLights, alpha: 0.28, duration: 440, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.tweens.add({ targets: this.discoLights, x: 24, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.game.events.emit('disco-start');
    this.discoTimer = this.time.delayedCall(duration, () => this.stopDiscoMoment());
  }

  stopDiscoMoment() {
    if (!this.discoActive) return;
    this.discoActive = false;
    this.discoTimer?.remove();
    this.discoTimer = null;
    this.tweens.killTweensOf(this.discoLights);
    this.tweens.killTweensOf(this.discoBall);
    this.discoLights.setAlpha(0).setVisible(false).setPosition(0, 0);
    this.tweens.add({
      targets: this.discoBall,
      y: -30,
      alpha: 0,
      duration: 360,
      ease: 'Sine.In',
      onComplete: () => this.discoBall.setVisible(false),
    });
    this.game.events.emit('disco-end');
  }

  drawBed(x, y) {
    const art = this.add.graphics().setDepth(-1);
    art.fillStyle(0x594c3e, 0.14);
    art.fillEllipse(x, y + 19, 190, 23);
    art.fillStyle(0x9b7658, 1);
    art.fillRoundedRect(x - 82, y - 12, 11, 35, 4);
    art.fillRoundedRect(x + 71, y - 12, 11, 35, 4);
    art.fillStyle(0xc39372, 1);
    art.fillRoundedRect(x - 91, y - 40, 182, 54, 25);
    art.fillStyle(0xe5b89c, 1);
    art.fillRoundedRect(x - 82, y - 38, 164, 42, 21);
    art.fillStyle(0xfff3e7, 1);
    art.fillEllipse(x + 43, y - 21, 48, 24);
    art.fillStyle(0xdcae92, 0.72);
    art.fillEllipse(x - 42, y - 10, 30, 13);
    this.add.text(x, y + 27, 'NAP SPOT', {
      color: '#796f61', fontFamily: 'sans-serif', fontSize: '9px', fontStyle: 'bold', letterSpacing: 1,
    }).setOrigin(0.5).setDepth(1);
  }

  addCat(cat, index) {
    const positions = [208, 494, 95, 395, 704];
    const startX = positions[index % positions.length];
    const startY = [453, 468, 423, 478, 438][index % positions.length];
    const view = new CatView(this, cat, startX, startY, (catId) => {
      this.handleCatClick(catId);
    }, index);
    view.setSelected(cat.id === this.state.selectedCatId);
    this.catViews.set(cat.id, view);
  }

  handleCatClick(catId) {
    if (!this.state.cats.some((cat) => cat.id === catId)) return;
    this.state.selectedCatId = catId;
    this.syncSelection();
    this.careForCat('pet');
  }

  selectCat(catId) {
    if (!this.state.cats.some((cat) => cat.id === catId)) return;
    this.state.selectedCatId = catId;
    this.syncSelection();
    this.publishState();
  }

  careForCat(action) {
    const selectedId = this.state.selectedCatId;
    if (!applyCareAction(this.state, action)) return;
    this.catViews.get(selectedId)?.react(action);
    this.game.events.emit('cat-action-sound', action);
    this.publishState();
  }

  handleAssessment(decision) {
    if (!assessVisitor(this.state, decision)) return;
    this.publishState();
  }

  handleAdoption(catId) {
    if (!adoptCat(this.state, catId)) return;
    this.catViews.get(catId)?.destroy();
    this.catViews.delete(catId);
    this.syncSelection();
    this.publishState();
  }

  handleEndDay() {
    endDay(this.state);
    this.publishState();
  }

  handleCustomizeArrival(appearance) {
    if (!customizeIncomingCat(this.state, appearance)) return;
    this.publishState();
  }

  handleDailyEvent(accept) {
    const selectedId = this.state.selectedCatId;
    const action = this.state.dailyEvent?.action;
    if (!resolveDailyEvent(this.state, accept)) return;
    if (accept) this.catViews.get(selectedId)?.react(action);
    this.publishState();
  }

  handleWelcomeArrival() {
    if (!welcomeIncomingCat(this.state)) return;
    this.addCat(this.state.lastArrival, this.state.cats.length - 1);
    this.syncSelection();
    this.publishState();
  }

  syncSelection() {
    this.catViews.forEach((view, id) => view.setSelected(id === this.state.selectedCatId));
  }

  publishState() {
    this.game.events.emit('state-update', this.state);
  }

  removeGameListeners() {
    this.stopDiscoMoment();
    this.stopSeasonalWeather();
    this.motionPreferenceQuery?.removeEventListener?.('change', this.onMotionPreferenceChange);
    this.birdTimer?.remove();
    this.birdTimer = null;
    if (this.bird) this.tweens.killTweensOf(this.bird);
    this.catViews.forEach((view) => view.destroy());
    this.catViews.clear();
    this.game.events.off('select-cat', this.selectCat, this);
    this.game.events.off('care-action', this.careForCat, this);
    this.game.events.off('assess-visitor', this.handleAssessment, this);
    this.game.events.off('adopt-cat', this.handleAdoption, this);
    this.game.events.off('end-day', this.handleEndDay, this);
    this.game.events.off('customize-arrival', this.handleCustomizeArrival, this);
    this.game.events.off('welcome-arrival', this.handleWelcomeArrival, this);
    this.game.events.off('resolve-daily-event', this.handleDailyEvent, this);
    this.game.events.off('season-hemisphere', this.handleSeasonHemisphere, this);
  }
}
