# Cat Shelter Game Design

## High concept

Manage a welcoming shelter for cats. Care for the cats, learn what they need, and make thoughtful decisions about the people who visit. The cats are the heart of the game: they must be beautiful, easy to see, and fun to watch as they move and behave.

## Cats

- Begin with one or two sample cats; the first playable version should use two distinct cats.
- Support up to 10 cats in the shelter.
- Cats can be customized by breed, color, size (including small or fat), and fur length.
- Each cat has needs and a mood. Cats can become hungry, thirsty, playful, tired, or content.
- The player can provide food, water, play time, and walks.
- Cats should move and animate continuously, even while the game waits for the player. Their behavior can include wandering, grooming, playing, eating, drinking, and sleeping.
- Movement and animation should feel graceful and expressive. Care actions should cause visible reactions.

## Turns and daily play

- The game is turn-based, organized into days.
- During a day, the player can care for cats and assess visitors.
- Selecting **End Day** advances cat needs and moods and starts the next day.
- Cat animations continue while the player makes decisions; only needs and game progression advance by day.

## Visitors and adoption

- Visitors arrive at the shelter and must be assessed before they can interact with the cats.
- An assessment screen shows clues about the visitor. The player chooses to accept or reject the visitor, who is then revealed as trustworthy or shifty.
- A correct assessment earns 1 point. An incorrect assessment loses 1 point.
- A trustworthy accepted visitor may adopt a cat that is in a good mood.
- Each completed adoption earns an additional 2 points.
- After an adoption, a new cat arrives when the player ends the day, so the replacement is there the following day.

## First playable version

The initial playable version should focus on two animated sample cats, daily care and needs, visitor assessment, and adoption. Add the full 10-cat capacity and broader customization after this core loop is fun and clear.
