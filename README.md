# Deep Clean

A first-person browser game for Oral-B Horizon. You hold a glowing tube of toothpaste, search a dark mouth for plaque, clear it, and go deeper while bacteria close in.

The whole game is one static file, `index.html`. There is no build step and nothing to install. Three.js, the post-processing scripts and the fonts load from public CDNs at runtime. The Oral-B logo is embedded in the file.

## Controls

| Action | Keyboard | Mouse | Touch |
| --- | --- | --- | --- |
| Move | Up and Down arrows, Shift to hurry | | Left thumb |
| Turn | Left and Right arrows | Mouse | Right thumb |
| Squeeze | Hold Space | Hold left click | Squeeze button |
| Burst | B | Right click | Burst button |
| Pause | Esc or P | | Pause button |
| Sound | M | | |

## Run it locally

Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Put it on GitHub

1. Create a new repository on GitHub. Make it private, because the file contains the Oral-B logo and unreleased client work.
2. From this folder:

```
git init
git add .
git commit -m "Deep Clean prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/deep-clean.git
git push -u origin main
```

## Deploy on Vercel

1. In Vercel, choose Add New, then Project, and import the repository.
2. Set Framework Preset to Other. Leave Build Command and Output Directory empty.
3. Deploy. Every push to `main` will redeploy automatically.

To keep the link private to your team, turn on Deployment Protection under Project Settings.

## Notes

- Best in Chrome on a laptop or desktop with a graphics card. It also runs on phones, with touch controls.
- The best score and the sound setting are saved in the browser's local storage.
- The page needs an internet connection the first time it loads, to fetch Three.js and the fonts.
