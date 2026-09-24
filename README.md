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

## Password

The whole site sits behind a password, checked on Vercel's servers by `middleware.js` before any file is sent. Visitors see a Deep Clean sign-in page, and their browser stays signed in for 30 days.

1. In Vercel, open the project, then Settings, then Environment Variables.
2. Add `APP_PASSWORD` with the password as its value, for Production and Preview. Mark it Sensitive.
3. Redeploy (Deployments, then the latest one, then Redeploy). A new password only applies to new deployments.

If `APP_PASSWORD` is missing, the site stays locked rather than opening up. Changing the password signs everyone out. Opening `/logout` signs out the current browser.

The password only applies on Vercel. Opening `index.html` directly or running `npx serve .` has no password.

## Notes

- Best in Chrome on a laptop or desktop with a graphics card. It also runs on phones, with touch controls.
- The best score and the sound setting are saved in the browser's local storage.
- The page needs an internet connection the first time it loads, to fetch Three.js and the fonts.
