# YouTuber Simulator

A browser-based **YouTuber simulator game** built with separate **HTML**, **CSS**, and **JavaScript** files. Upload videos, generate titles, chase trends, buy upgrades, unlock achievements, and grow your channel from scratch.

## Features

* Separate files for structure, styling, and game logic
* Upload system with randomized video results
* AI-style title generator
* Trending topic system with bonus rewards
* Thumbnail preview cards
* Upgrade shop with multiple upgrade paths
* Passive income system
* Save/load using `localStorage`
* Achievement system
* Channel dashboard UI

## Files

```text
index.html
styles.css
script.js
```

## How to Run

1. Put all three files in the same folder.
2. Open `index.html` in your browser.
3. Start generating titles and uploading videos.

## Gameplay

### Main actions

* **AI Title**: Generates a title based on the selected video type.
* **Upload Video**: Publishes a video and awards views, likes, subscribers, money, and XP.
* **Upgrades**: Spend money on better tools to improve your channel.
* **Reset Save**: Deletes your saved progress and starts over.

### Stats

* **Views**: Total channel views
* **Likes**: Total likes
* **Subs**: Total subscribers
* **Money**: Currency for upgrades
* **Level**: Increases as you gain XP

## Upgrade Types

* **Better Camera**: Increases passive views
* **Hire Editor**: Increases passive likes
* **Run Ads**: Increases passive subscribers
* **Thumbnail Boost**: Improves upload performance
* **Channel Manager**: Adds passive money income

## Save System

The game automatically saves to your browser using `localStorage`. Your progress stays on the same device and browser until you reset it.

## Notes

* This game is fully offline once loaded.
* No external libraries are required.
* Icons are made with inline SVG `<path>` elements.

## Possible Next Additions

* Sound effects
* More video genres
* Comments and dislikes
* Livestream mode
* Better analytics dashboard
* More achievements and prestige resets

## License

Free to use, edit, and expand for personal projects.
