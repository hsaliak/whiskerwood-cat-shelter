import Phaser from 'phaser';
import { catBehaviorThought, chooseCatThought } from './catThoughts.js';

const CAT_WALK_ANIMATION = 'cat-walk-cycle';
const WALK_MIN_X = 70;
const WALK_Y_MIN = 375;
const WALK_Y_MAX = 495;
const SPRITE_FOOT_OFFSET = 39;

const WANDER_ACTIONS = {
  shy: [[30, 'sit'], [26, 'groom'], [20, 'bed'], [14, 'perch'], [10, 'walk']],
  playful: [[25, 'stretch'], [20, 'walk'], [20, 'perch'], [15, 'groom'], [10, 'bed'], [10, 'sit']],
  curious: [[25, 'perch'], [25, 'walk'], [20, 'stretch'], [10, 'groom'], [10, 'sit'], [10, 'bed']],
  cuddly: [[30, 'bed'], [22, 'groom'], [20, 'sit'], [10, 'stretch'], [8, 'perch'], [10, 'walk']],
};

export class CatView {
  constructor(scene, cat, x, y, onSelect) {
    this.scene = scene;
    this.cat = cat;
    this.personality = cat.personality ?? 'curious';
    this.y = y;
    this.onSelect = onSelect;
    this.isActing = false;
    this.animationOffset = Array.from(cat.id).reduce((sum, character) => sum + character.charCodeAt(0), 0);
    this.scaleFactor = cat.size === 'small' ? 0.38 : cat.size === 'fat' ? 0.46 : 0.42;
    const build = cat.build ?? 'average';
    this.buildScaleX = build === 'slim' ? 0.86 : build === 'round' ? 1.14 : 1;
    this.buildScaleY = build === 'slim' ? 1.04 : build === 'round' ? 0.96 : 1;
    this.spriteScaleX = this.scaleFactor * this.buildScaleX;
    this.spriteScaleY = this.scaleFactor * this.buildScaleY;
    this.lastFactIndex = -1;
    this.lastNeedThought = null;
    this.activeToy = null;
    this.motionQuery = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    this.reducedMotion = this.motionQuery?.matches ?? false;
    this.onMotionPreferenceChange = (event) => this.setReducedMotion(event.matches);
    this.motionQuery?.addEventListener?.('change', this.onMotionPreferenceChange);

    this.container = scene.add.container(x, y).setDepth(1);
    this.container.setSize(128, 128).setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-64, -120, 128, 128),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    this.container.on('pointerdown', () => this.onSelect(cat.id));

    this.selectionRing = scene.add.ellipse(0, 2, 116, 18, 0xf1c989, 0.18);
    this.selectionRing.setStrokeStyle(2, 0xf1c989, 0.85);
    this.shadowScaleX = 62 * (this.spriteScaleX / 0.42);
    this.shadow = scene.add.ellipse(x, y + 1, this.shadowScaleX, 9, 0x403b35, 0.12).setDepth(0);
    this.curlTail = scene.add.graphics();
    this.curlTail.lineStyle(7, cat.color ?? 0xc98270, 0.9);
    this.curlTail.beginPath();
    this.curlTail.arc(0, -13, 29, Math.PI * 0.24, Math.PI * 1.76, false);
    this.curlTail.strokePath();
    this.curlTail.setVisible(false);
    this.spriteBaseY = SPRITE_FOOT_OFFSET * this.spriteScaleY;
    this.sprite = scene.add.sprite(0, this.spriteBaseY, 'smooth-cat-walk');
    this.sprite.setOrigin(0.5, 1).setScale(this.spriteScaleX, this.spriteScaleY);
    this.sprite.setTint(cat.color ?? 0xffffff);
    this.patternOverlay = scene.add.graphics();
    this.patternOverlay.setPosition(-128 * this.spriteScaleX, -217 * this.spriteScaleY);
    this.patternOverlay.setScale(this.spriteScaleX, this.spriteScaleY);
    this.container.add([this.selectionRing, this.curlTail, this.sprite, this.patternOverlay]);
    this.patternOverlay.setMask(this.sprite.createBitmapMask());
    this.updatePattern(cat);
    this.setSelected(false);
    this.scheduleThoughtBubble();

    if (this.reducedMotion) this.sprite.setFrame(0);
    else {
      this.startIdleAnimation();
      this.scheduleWander();
    }
  }

  updatePattern(cat) {
    const pattern = cat.pattern ?? cat.markings ?? 'solid';
    const color = cat.patternColor ?? cat.accent ?? 0xfff0d7;
    this.patternOverlay.clear();
    this.patternOverlay.fillStyle(color, 0.88);
    if (pattern === 'tabby') {
      this.patternOverlay.fillRoundedRect(78, 128, 12, 58, 6);
      this.patternOverlay.fillRoundedRect(101, 119, 12, 66, 6);
      this.patternOverlay.fillRoundedRect(124, 119, 12, 66, 6);
      this.patternOverlay.fillRoundedRect(147, 128, 12, 58, 6);
    } else if (pattern === 'tuxedo') {
      this.patternOverlay.fillEllipse(78, 154, 43, 58);
      this.patternOverlay.fillEllipse(70, 202, 32, 16);
      this.patternOverlay.fillEllipse(180, 202, 32, 16);
    } else if (pattern === 'calico') {
      this.patternOverlay.fillEllipse(79, 130, 42, 30);
      this.patternOverlay.fillEllipse(157, 147, 48, 34);
      this.patternOverlay.fillEllipse(112, 187, 43, 23);
    }
  }

  setPatternFacing(direction) {
    const facing = direction < 0 ? -1 : 1;
    this.sprite.setFlipX(facing < 0);
    this.patternOverlay.setPosition(
      (facing < 0 ? 128 : -128) * this.spriteScaleX,
      -217 * this.spriteScaleY,
    );
    this.patternOverlay.setScale(facing * this.spriteScaleX, this.spriteScaleY);
  }

  clearThoughtBubble() {
    this.bubbleTimer?.remove();
    this.bubbleTimer = null;
    if (!this.thoughtBubble) return;
    this.scene.tweens.killTweensOf(this.thoughtBubble);
    this.thoughtBubble.destroy();
    this.thoughtBubble = null;
  }

  showThoughtBubble(text, source = null) {
    this.clearThoughtBubble();
    const label = this.scene.add.text(0, 0, text, {
      color: '#5a5147',
      fontFamily: 'sans-serif',
      fontSize: '12px',
      align: 'center',
      lineSpacing: 1,
      wordWrap: { width: 150 },
    }).setOrigin(0.5);
    const credit = source
      ? this.scene.add.text(0, 0, `— ${source}`, {
        color: '#8a7b68', fontFamily: 'sans-serif', fontSize: '9px', align: 'center',
      }).setOrigin(0.5)
      : null;
    const width = Math.min(174, Math.max(116, label.width + 22, (credit?.width ?? 0) + 22));
    const height = label.height + (credit ? credit.height + 5 : 0) + 20;
    const bubble = this.scene.add.container(0, -126);
    const background = this.scene.add.graphics();
    background.fillStyle(0xfffdf7, 0.98);
    background.fillRoundedRect(-width / 2, -height / 2, width, height, 13);
    background.lineStyle(1, 0xd9cbb9, 0.95);
    background.strokeRoundedRect(-width / 2, -height / 2, width, height, 13);
    background.fillStyle(0xfffdf7, 0.98);
    background.fillTriangle(-6, height / 2 - 2, 6, height / 2 - 2, 0, height / 2 + 8);
    bubble.add(background);
    label.setPosition(0, credit ? -credit.height / 2 - 2 : 0);
    bubble.add(label);
    if (credit) {
      credit.setPosition(0, height / 2 - credit.height / 2 - 7);
      bubble.add(credit);
    }
    this.container.add(bubble);
    this.thoughtBubble = bubble;
    if (!this.reducedMotion) {
      bubble.setAlpha(0).setScale(0.92);
      this.scene.tweens.add({ targets: bubble, alpha: 1, scale: 1, duration: 180, ease: 'Sine.Out' });
    }
    this.bubbleTimer = this.scene.time.delayedCall(this.reducedMotion ? 3000 : 3400, () => {
      if (!this.thoughtBubble) {
        this.bubbleTimer = null;
        return;
      }
      if (this.reducedMotion) {
        this.clearThoughtBubble();
        return;
      }
      const visibleBubble = this.thoughtBubble;
      this.bubbleTimer = this.scene.time.delayedCall(240, () => {
        this.bubbleTimer = null;
        if (this.thoughtBubble === visibleBubble) this.clearThoughtBubble();
      });
      this.scene.tweens.add({
        targets: visibleBubble,
        alpha: 0,
        y: visibleBubble.y - 5,
        duration: 180,
        onComplete: () => {
          if (this.thoughtBubble === visibleBubble) this.clearThoughtBubble();
        },
      });
    });
  }

  thought(action) {
    return catBehaviorThought(action, this.personality, this.cat.bond ?? 0);
  }

  scheduleThoughtBubble() {
    if (!this.scene.scene.isActive()) return;
    this.thoughtTimer?.remove();
    this.thoughtTimer = this.scene.time.delayedCall(9000 + Phaser.Math.Between(0, 7000), () => {
      this.thoughtTimer = null;
      if (!this.scene.scene.isActive()) return;
      if (this.isActing) {
        this.scheduleThoughtBubble();
        return;
      }
      const thought = chooseCatThought(this.cat, Math.random, this.lastFactIndex, this.lastNeedThought);
      if (thought.kind === 'fact') this.lastFactIndex = thought.factIndex;
      if (thought.kind === 'need') this.lastNeedThought = thought.text;
      this.showThoughtBubble(thought.text, thought.source);
      this.scheduleThoughtBubble();
    });
  }

  setPatternFacing(direction) {
    const facing = direction < 0 ? -1 : 1;
    this.sprite.setFlipX(facing < 0);
    this.patternOverlay.setPosition(
      (facing < 0 ? 128 : -128) * this.spriteScaleX,
      -217 * this.spriteScaleY,
    );
    this.patternOverlay.setScale(facing * this.spriteScaleX, this.spriteScaleY);
  }

  noticeBird(birdX) {
    if (this.isActing) return;
    this.showThoughtBubble(this.thought('bird'));
    if (this.reducedMotion) return;

    this.birdLookTimer?.remove();
    this.setPatternFacing(birdX < this.container.x ? -1 : 1);
    this.birdLookTimer = this.scene.time.delayedCall(1100, () => {
      this.birdLookTimer = null;
      if (!this.isActing) this.setPatternFacing(1);
    });
  }

  setReducedMotion(reducedMotion) {
    if (this.reducedMotion === reducedMotion) return;
    this.reducedMotion = reducedMotion;
    if (reducedMotion) {
      this.wanderTimer?.remove();
      this.wanderTimer = null;
      this.actionTimer?.remove();
      this.actionTimer = null;
      this.birdLookTimer?.remove();
      this.birdLookTimer = null;
      this.cleanupActiveToy();
      this.curlTail.setVisible(false);
      if (this.discoActive) {
        this.scene.stopDiscoMoment();
        this.discoActive = false;
      }
      this.scene.tweens.killTweensOf(this.container);
      this.scene.tweens.killTweensOf(this.sprite);
      this.scene.tweens.killTweensOf(this.shadow);
      this.shadow.setPosition(this.container.x, this.y + 1).setScale(1).setAlpha(0.12);
      if (this.thoughtBubble) {
        this.scene.tweens.killTweensOf(this.thoughtBubble);
        this.thoughtBubble.setAlpha(1).setScale(1);
      }
      this.sprite.anims.stop();
      this.sprite.setFrame(0).setPosition(0, this.spriteBaseY).setScale(this.spriteScaleX, this.spriteScaleY).setFlipX(false).setAngle(0);
      this.setPatternFacing(1);
      this.container.setPosition(this.container.x, this.y).setScale(1);
      this.isActing = false;
      return;
    }
    this.startIdleAnimation();
    this.scheduleWander();
  }

  startIdleAnimation() {
    if (this.reducedMotion) return;
    this.sprite.anims.stop();
    this.sprite.setFrame(0).setPosition(0, this.spriteBaseY).setScale(this.spriteScaleX, this.spriteScaleY);
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.spriteBaseY - 1.5,
      scaleY: this.spriteScaleY * 1.012,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  scheduleWander() {
    if (this.reducedMotion || !this.scene.scene.isActive()) return;
    this.wanderTimer?.remove();
    this.wanderTimer = this.scene.time.delayedCall(
      4500 + Phaser.Math.Between(0, 5200) + (this.animationOffset % 1200),
      () => {
        this.wanderTimer = null;
        if (this.reducedMotion || !this.scene.scene.isActive()) return;
        if (this.isActing) {
          this.scheduleWander();
          return;
        }
        let choice = Phaser.Math.Between(0, 99);
        let activity = 'walk';
        for (const [weight, name] of WANDER_ACTIONS[this.personality] ?? WANDER_ACTIONS.curious) {
          if (choice < weight) {
            activity = name;
            break;
          }
          choice -= weight;
        }
        if (activity === 'sit') this.sitAndStand();
        else if (activity === 'stretch') this.stretchAndRelax();
        else if (activity === 'groom') this.groom();
        else if (activity === 'perch') this.visitStool();
        else if (activity === 'bed') this.visitBed();
        else this.startWalk(true);
      },
    );
  }

  setSelected(selected) {
    this.selectionRing.setAlpha(selected ? 0.82 : 0.18);
    this.selectionRing.setScale(selected ? 1 : 0.88);
  }

  walkTo(x, y, onArrival, duration = 1150) {
    const direction = x < this.container.x ? -1 : 1;
    this.scene.tweens.killTweensOf(this.sprite);
    this.scene.tweens.killTweensOf(this.shadow);
    this.shadow.setScale(1).setAlpha(0.12);
    this.sprite.setPosition(0, this.spriteBaseY).setScale(this.spriteScaleX, this.spriteScaleY).setAngle(0);
    this.setPatternFacing(direction);
    this.sprite.play(CAT_WALK_ANIMATION, true);
    this.scene.tweens.killTweensOf(this.shadow);
    this.scene.tweens.add({
      targets: this.shadow,
      x,
      y: y + 1,
      duration,
      ease: 'Sine.InOut',
    });
    this.scene.tweens.add({
      targets: this.container,
      x,
      y,
      duration,
      ease: 'Sine.InOut',
      onComplete: () => {
        this.y = y;
        this.setPatternFacing(1);
        onArrival?.();
      },
    });
  }

  playJump() {
    const target = this.scene.interactionPoints.trampoline;
    const groundY = this.y;
    this.walkTo(target.x, target.y, () => {
      this.discoActive = true;
      this.scene.startDiscoMoment(3200);
      this.showThoughtBubble(this.thought('play'));
      this.scene.tweens.add({
        targets: this.shadow,
        scaleX: 0.68,
        alpha: 0.06,
        duration: 240,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.InOut',
      });
      this.sprite.play(CAT_WALK_ANIMATION, true);
      this.scene.tweens.add({
        targets: this.container,
        y: target.y - 46,
        duration: 240,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.Out',
        onComplete: () => this.walkTo(target.x, groundY, () => this.finishAction(), 500),
      });
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: this.spriteScaleX * 1.08,
        scaleY: this.spriteScaleY * 0.92,
        duration: 220,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.InOut',
      });
    });
  }

  stretchAndRelax() {
    this.isActing = true;
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.anims.stop().setFrame(0);
    this.showThoughtBubble(this.thought('stretch'));
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.spriteBaseY + 3,
      scaleX: this.spriteScaleX * 1.14,
      scaleY: this.spriteScaleY * 0.92,
      angle: -4,
      duration: 520,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.InOut',
      onComplete: () => this.finishAction(),
    });
  }

  groom() {
    this.isActing = true;
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.anims.stop().setFrame(0);
    this.showThoughtBubble(this.thought('groom'));
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.spriteBaseY + 7,
      scaleY: this.spriteScaleY * 0.9,
      angle: -5,
      duration: 190,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.InOut',
      onComplete: () => this.finishAction(),
    });
  }

  visitWater() {
    const target = this.scene.interactionPoints.water;
    this.walkTo(target.x, target.y, () => {
      this.sprite.anims.stop().setFrame(0);
      this.showThoughtBubble(this.thought('water'));
      this.scene.tweens.add({
        targets: this.sprite,
        y: this.spriteBaseY + 5,
        scaleY: this.spriteScaleY * 0.96,
        duration: 240,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.InOut',
        onComplete: () => this.finishAction(),
      });
    });
  }

  sitAndStand() {
    this.isActing = true;
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.anims.stop().setFrame(0);
    this.showThoughtBubble(this.thought('sit'));
    this.sprite.setPosition(0, this.spriteBaseY + 5).setScale(this.spriteScaleX * 1.04, this.spriteScaleY * 0.84);
    this.actionTimer = this.scene.time.delayedCall(1550, () => {
      this.scene.tweens.add({
        targets: this.sprite,
        y: this.spriteBaseY,
        scaleX: this.spriteScaleX,
        scaleY: this.spriteScaleY,
        duration: 380,
        ease: 'Sine.Out',
        onComplete: () => this.finishAction(),
      });
    });
  }

  visitStool() {
    this.isActing = true;
    const target = this.scene.interactionPoints.stool;
    const groundY = this.y;
    this.walkTo(target.x, target.y, () => {
      this.sprite.anims.stop().setFrame(0);
      this.showThoughtBubble(this.thought('perch'));
      this.sprite.setPosition(0, this.spriteBaseY + 3).setScale(this.spriteScaleX * 1.04, this.spriteScaleY * 0.86);
      this.actionTimer = this.scene.time.delayedCall(2300, () => {
        this.sprite.setScale(this.spriteScaleX, this.spriteScaleY).setPosition(0, this.spriteBaseY);
        this.walkTo(target.x, groundY, () => this.finishAction(), 500);
      });
    });
  }

  visitBed(holdDuration = 2800) {
    this.isActing = true;
    const target = this.scene.interactionPoints.bed;
    const groundY = this.y;
    this.walkTo(target.x, target.y, () => {
      this.sprite.anims.stop().setFrame(0);
      this.curlTail.setVisible(true);
      this.sprite.setPosition(0, this.spriteBaseY + 5).setScale(this.spriteScaleX * 1.16, this.spriteScaleY * 0.72);
      this.showThoughtBubble(this.thought(holdDuration > 2800 ? 'rest' : 'bed'));
      this.actionTimer = this.scene.time.delayedCall(holdDuration, () => {
        this.sprite.setScale(this.spriteScaleX, this.spriteScaleY).setPosition(0, this.spriteBaseY);
        this.walkTo(target.x, groundY, () => this.finishAction(), 650);
      });
    });
  }

  react(action) {
    if (this.reducedMotion) {
      if (['pet', 'treat', 'brush', 'toy'].includes(action)) this.showThoughtBubble(this.thought(action));
      return;
    }
    this.cancelCurrentAction();
    if (action === 'walk') {
      this.showThoughtBubble(this.thought('walk'));
      this.startWalk(false);
      return;
    }
    this.isActing = true;
    if (action === 'pet') this.pet();
    else if (action === 'treat') this.playTreatAnimation();
    else if (action === 'brush') this.playBrushAnimation();
    else if (action === 'toy') this.playWithToy();
    else if (action === 'play') this.playJump();
    else if (action === 'water') this.visitWater();
    else if (action === 'rest') this.visitBed(5000);
    else if (action === 'food') this.playCareAnimation();
  }

  pet() {
    this.showThoughtBubble(this.thought('pet'));
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.spriteBaseY - 4,
      scaleX: this.spriteScaleX * 1.04,
      scaleY: this.spriteScaleY * 1.04,
      angle: 2,
      duration: 220,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.InOut',
      onComplete: () => this.finishAction(),
    });
  }

  playTreatAnimation() {
    this.showThoughtBubble(this.thought('treat'));
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.spriteBaseY + 3,
      scaleX: this.spriteScaleX * 1.03,
      scaleY: this.spriteScaleY * 0.97,
      duration: 190,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.InOut',
      onComplete: () => this.finishAction(),
    });
  }

  playBrushAnimation() {
    this.showThoughtBubble(this.thought('brush'));
    this.scene.tweens.add({
      targets: this.sprite,
      angle: 3,
      y: this.spriteBaseY + 2,
      duration: 220,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.InOut',
      onComplete: () => this.finishAction(),
    });
  }

  playWithToy() {
    this.showThoughtBubble(this.thought('toy'));
    const direction = this.container.x < this.scene.scale.width / 2 ? 1 : -1;
    const toy = this.scene.add.container(this.container.x, this.y - 42).setDepth(3);
    const feather = this.scene.add.graphics();
    feather.lineStyle(3, 0x9a765d, 1);
    feather.lineBetween(0, 7, 0, -16);
    feather.fillStyle(0xd88eb0, 0.95);
    feather.fillEllipse(-5, -14, 10, 17);
    feather.fillStyle(0x8dc2b1, 0.95);
    feather.fillEllipse(5, -18, 9, 16);
    feather.fillStyle(0xf0c779, 0.95);
    feather.fillEllipse(0, -23, 8, 14);
    toy.add(feather);
    this.activeToy = toy;
    this.scene.tweens.add({
      targets: toy,
      x: Phaser.Math.Clamp(this.container.x + direction * 70, 35, this.scene.scale.width - 35),
      y: this.y - 55,
      angle: direction * 35,
      duration: 360,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.InOut',
      onComplete: () => {
        this.cleanupActiveToy();
        this.finishAction();
      },
    });
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.spriteBaseY - 5,
      scaleY: this.spriteScaleY * 1.04,
      duration: 180,
      yoyo: true,
      repeat: 5,
      ease: 'Sine.InOut',
    });
  }

  cleanupActiveToy() {
    if (!this.activeToy) return;
    this.scene.tweens.killTweensOf(this.activeToy);
    this.activeToy.destroy();
    this.activeToy = null;
  }

  playCareAnimation() {
    this.showThoughtBubble(this.thought('food'));
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.spriteBaseY + 4,
      scaleY: this.spriteScaleY * 0.95,
      duration: 180,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.InOut',
      onComplete: () => this.finishAction(),
    });
  }

  cancelCurrentAction() {
    this.cleanupActiveToy();
    this.birdLookTimer?.remove();
    this.birdLookTimer = null;
    this.curlTail.setVisible(false);
    if (this.discoActive) {
      this.scene.stopDiscoMoment();
      this.discoActive = false;
    }
    this.actionTimer?.remove();
    this.actionTimer = null;
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.killTweensOf(this.sprite);
    this.scene.tweens.killTweensOf(this.shadow);
    this.shadow.setPosition(this.container.x, this.y + 1).setScale(1).setAlpha(0.12);
    this.sprite.anims.stop();
    this.sprite.setFrame(0).setPosition(0, this.spriteBaseY).setScale(this.spriteScaleX, this.spriteScaleY).setFlipX(false).setAngle(0);
    this.setPatternFacing(1);
    this.container.setPosition(this.container.x, this.y);
    this.isActing = false;
  }

  startWalk(isWandering) {
    if (this.reducedMotion || this.isActing) return;
    this.isActing = true;
    const maxX = this.scene.scale.width - WALK_MIN_X;
    let destinationX;
    if (isWandering) {
      destinationX = Phaser.Math.Between(WALK_MIN_X, maxX);
      if (Math.abs(destinationX - this.container.x) < 72) {
        const direction = this.container.x < this.scene.scale.width / 2 ? 1 : -1;
        destinationX = Phaser.Math.Clamp(this.container.x + direction * 96, WALK_MIN_X, maxX);
      }
    } else {
      const direction = this.container.x < this.scene.scale.width / 2 ? 1 : -1;
      destinationX = Phaser.Math.Clamp(this.container.x + direction * 96, WALK_MIN_X, maxX);
    }
    const destinationY = isWandering
      ? Phaser.Math.Clamp(this.y + Phaser.Math.Between(-22, 22), WALK_Y_MIN, WALK_Y_MAX)
      : this.y;
    this.walkTo(destinationX, destinationY, () => this.finishAction(), isWandering ? 1500 : 1150);
  }

  finishAction() {
    this.cleanupActiveToy();
    if (this.discoActive) {
      this.scene.stopDiscoMoment();
      this.discoActive = false;
    }
    this.actionTimer?.remove();
    this.actionTimer = null;
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.killTweensOf(this.sprite);
    this.scene.tweens.killTweensOf(this.shadow);
    this.shadow.setPosition(this.container.x, this.y + 1).setScale(1).setAlpha(0.12);
    this.sprite.anims.stop();
    this.sprite.setFrame(0).setPosition(0, this.spriteBaseY).setScale(this.spriteScaleX, this.spriteScaleY).setFlipX(false).setAngle(0);
    this.setPatternFacing(1);
    this.curlTail.setVisible(false);
    this.container.y = this.y;
    this.isActing = false;
    if (!this.reducedMotion && this.scene.scene.isActive()) {
      this.startIdleAnimation();
      this.scheduleWander();
    }
  }

  destroy() {
    this.cleanupActiveToy();
    if (this.discoActive) this.scene.stopDiscoMoment();
    this.motionQuery?.removeEventListener?.('change', this.onMotionPreferenceChange);
    this.wanderTimer?.remove();
    this.birdLookTimer?.remove();
    this.thoughtTimer?.remove();
    this.actionTimer?.remove();
    this.clearThoughtBubble();
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.killTweensOf(this.sprite);
    this.scene.tweens.killTweensOf(this.shadow);
    this.shadow.destroy();
    this.container.destroy();
  }
}
