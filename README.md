# Whiskerwood Cat Shelter

A small Phaser game about caring for shelter cats, meeting visitors, and finding cats a home.

## Run locally

```sh
npm install
npm run dev
```

Run checks with `npm test` and make a production build with `npm run build`.

## Deploy to Cloudflare Pages

Connect the public GitHub repository `hsaliak/whiskerwood-cat-shelter` to Cloudflare Pages. Use the Vite preset, build command `npm run build`, and build output directory `dist`. Cloudflare will deploy pushes to `main` and provide a `*.pages.dev` URL.

## Art assets

- [Cat Animation: High-Res 2d](https://frolicforge.itch.io/cat-animation-high-res) by FrolicForge supplies the smooth 12-frame walk cycle in `public/assets/cats/frolicforge/cat-walk-256.png`. The free download allows personal/commercial use and modification; the creator requests credit when possible.
- The sunroom, water cup, stool, and bed are drawn as smooth Phaser vector graphics so they match the high-resolution cat art. The old pixel-art room is retained only as an unused reference asset.
- The current game uses the high-resolution FrolicForge sheet. Unused legacy Pochi and Mochi demo art is excluded from the public repository.

## Cat behaviors and intake

Cats jump on the trampoline during play, with a descending disco ball, soft moving lights, and a temporary synthesized disco beat when music is enabled. They can drink at the cup, sit, stretch, groom, perch, and react to pets, treats, brushing, and a feather toy. Clicking a cat pets it and builds bond. Each cat has a personality that affects idle behavior and responses. Need thoughts reflect levels: at 45–69 they make a gentle request, and at 70 or higher they use urgent words such as “I’m hungry” or “I’m tired.” Care and play build a bond; close bonds unlock warmer reactions. A small event appears every other day and offers an optional care choice. The window changes with the season and adds gentle weather or butterfly effects; birds sometimes fly past and catch idle cats’ attention. Season selection can follow the browser locale’s region or be set to North or South with the Season selector; locales without a region default to North. New arrivals get a live appearance card for size, body build, coat color, pattern, and pattern color. Reduced-motion preferences keep bubbles static and stop moving weather, birds, and room animations.

Visitors now come from a larger set of distinct profiles, with different names, avatars, styles, and clues. Judge them by their care plans and actions, not by appearance.

Thought-bubble facts are paraphrased from [PetMD on cat sleep and activity](https://www.petmd.com/cat/behavior/why-do-cats-sleep-so-much), [Seattle Humane on interactive play](https://www.seattlehumane.org/resource-library/play-with-your-cat/), and [Blue Cross on whiskers](https://www.bluecross.org.uk/advice/cat/wellbeing-and-care/why-do-cats-have-whiskers).

## Cat action sounds

Food, water, treat, brush, play, feather-toy, and walk effects use clips from [Cat Purr & Meow](https://opengameart.org/content/cat-purr-meow) by Kerzoven, released under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Files are in `public/assets/audio/`; action sounds vary and the **SFX on/off** button controls them.


