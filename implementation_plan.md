# Implementation Plan

## Goal

Build a polished, turn-based cat shelter game with Phaser. The cats and their graceful behavior are the main attraction. Implement and playtest the smallest complete loop first: two cats, care, a visitor decision, adoption, and scoring.

## Agreed design rules

- Start with two sample cats; keep the model and UI ready for a shelter limit of 10.
- Days are game turns. Players can take care actions and assess visitors during a day. **End Day** advances needs and moods and opens the next day.
- Cat movement and idle animations run continuously, independent of day advancement.
- Every visitor has a hidden type (trustworthy or shifty) and fair clues shown on an assessment screen. Accept or reject the visitor, then reveal the type.
- Correct visitor decision: +1 point. Incorrect decision: -1 point.
- Each adoption schedules a distinct replacement cat to arrive the next day, while respecting the 10-cat limit.
- A trustworthy accepted visitor can adopt a cat in a good mood. Each completed adoption awards a separate +2 points.
- Exact need decay, care effects, visitor arrival frequency, and the threshold for a good mood are tuning values. Keep them in one rules module and tune through playtests.

## Suggested project structure

```text
src/
  main.js                     # Phaser bootstrap
  game/
    config.js                 # Canvas, scale, and scene registration
    scenes/
      ShelterScene.js         # Shelter, cats, HUD, care controls, day flow
    ui/
      VisitorAssessmentPanel.js # Visitor clues, accept/reject, outcome
    data/
      sampleCats.js           # Two initial cat definitions
      visitorPool.js          # Visitor profiles and fair assessment clues
    state/
      GameState.js            # Cats, day, score, current visitor, actions
    systems/
      catRules.js             # Need changes, mood, care effects, adoption eligibility
      daySystem.js            # End-day transition and next-day setup
      visitorSystem.js        # Visitor selection, assessment, scoring
    cats/
      CatView.js              # Cat rendering, animation, interaction
      catAnimations.js        # Idle and action animation behavior
  assets/
    cats/                     # Approved sprite sheets or layered cat art
    ui/
```

Keep gameplay rules separate from Phaser rendering where practical. `GameState` is the source of truth; scene and UI code display state and dispatch player actions. Start with data-driven cat and visitor definitions so adding variants does not require rewriting the scene.

## Milestones

### 1. Art and interaction prototype

- Replace the click-counter starter with a shelter scene.
- Establish a warm, elegant art direction and readable shelter layout.
- Show two distinct sample cats. Use deliberately temporary art only until an approved cat asset is ready; do not let placeholder geometry define the final look.
- Add continuous idle behaviors (subtle breathing, tail/ear motion, grooming, and graceful wandering). Use smooth transitions and keep cats within the visible room.
- Make cat selection and a simple information panel work.

**Validate:** Run `npm run dev` and check the scene at desktop and narrow viewport sizes. Verify both cats remain visible, animation continues without input, and selection targets the correct cat.

### 2. Cat needs, care, and day turns

- Define a cat state with stable ID, appearance, needs, mood, and current behavior.
- Keep need values within a documented range and centralize thresholds and action effects in `catRules.js`.
- Add food, water, play, and walk actions. Each action updates the selected cat and triggers a matching visible reaction/animation.
- Add a day indicator and **End Day** action. Apply daily need changes once per day, update mood, and then allow care in the new day.
- Make idle behavior respond to state: for example, a tired cat can settle to sleep and a playful cat can wander or play.

**Validate:** Unit-test need bounds, care effects, mood calculation, and one-time day advancement. Manually verify visual feedback for each care action and confirm that merely waiting does not advance the day.

### 3. Visitor assessment and scoring

- Add a visitor panel with a short profile and clues. Provide clear **Accept** and **Reject** controls.
- Use data-driven visitor records with a true type and matching clues. Keep the true type hidden until the player decides.
- On decision, reveal the result, award +1 for a correct decision or -1 for an incorrect decision, and prevent the same visitor from being assessed twice.
- Begin with a small authored visitor pool; ensure clues are understandable and not purely random.

**Validate:** Unit-test all four combinations (trustworthy accepted/rejected and shifty accepted/rejected), score changes, and duplicate-decision prevention. Check that the assessment can be completed by keyboard and pointer.

### 4. Adoption and complete MVP loop

- Only a trustworthy accepted visitor can proceed to adoption.
- Show cats that meet the good-mood rule and let the player select one for adoption.
- Award +2 only when adoption completes. Remove that cat from the shelter and update the visitor/cat UI.
- Queue a distinct replacement cat at adoption time and add it after the next End Day transition; give it a unique ID and starting needs.
- Do not allow adoption when no cat is eligible. Keep the visitor-decision score separate from the adoption reward.
- Support the two starting cats and enforce the 10-cat maximum in the state layer, even though intake/adding cats can be a later feature.

**Validate:** Unit-test eligibility, adoption points, removal, next-day arrival, unique IDs, and the no-eligible-cat case. Play through several days to confirm care, visitors, and adoptions form a complete loop.

### 5. Polish, content, and persistence

- Replace temporary visuals with the selected cat art. Add distinct walk, idle, play, eat, drink, groom, and sleep animations as suitable assets become available.
- Expand cat appearance combinations and visitor profiles. Keep the shelter readable at the 10-cat limit.
- Tune daily need changes, visitor frequency, clue difficulty, and score pace through playtests.
- Add local save/load only after the game state shape is stable; version saved data and handle invalid or old saves safely.
- Check responsive scaling, text contrast, sound/animation preferences, and reduced-motion options.

**Validate:** Run the production build (`npm run build`), test a fresh game and a saved game, and do a full browser playthrough through multiple days.

## Working implementation notes

- Keep visual animation time separate from turn-based simulation time. Phaser's scene update/tweens can animate continuously; needs only change in the explicit End Day transition.
- Prefer authored animation assets or layered sprites for the final cats. Use Phaser tweens for subtle movement and transitions, not as a replacement for expressive cat art.
- Add automated tests for pure rules first. If a test runner is introduced, add it as a development dependency and document the command in `package.json`.
- Keep scoring and action feedback visible, and provide a short explanation when an action is unavailable (for example, no cat is currently eligible for adoption).

## Completion criteria for the MVP

- Two visibly distinct cats move and animate gracefully without requiring player input.
- The player can perform all four care actions and see their effect.
- Needs and moods change only when the player ends a day.
- Visitor decisions reveal trustworthy/shifty status and score +1 or -1 correctly.
- Trustworthy visitors can adopt an eligible cat, scoring +2; ineligible cats cannot be adopted.
- The shelter remains usable with up to 10 cat records, and the production build succeeds.
