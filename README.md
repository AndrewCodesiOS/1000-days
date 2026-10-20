# 1000 days

A lightweight, mobile-first personal growth tracker built with HTML, CSS, and vanilla JavaScript. Designed to run as a Progressive Web App (PWA) on iPhone.

## The rules

- Goal: **1,000 successful days**.
- Each successful day adds **0.1 percentage points** toward the goal.
- A missed day does not erase progress; it adds one day to the projected journey.
- A past calendar day with no check-in is automatically marked as missed the next time the app is opened.
- Projected journey length = **1,000 + missed days**.
- Successful days remaining = **1,000 − successful days**.

This keeps progress tied to the number of successful days, while missed days extend the timeline. Example: 100 successful days and 3 misses means 10.0% progress, 900 successful days remaining, and a projected journey of 1,003 days.

## Publish with GitHub Pages

1. Create a **public** repository on GitHub, for example `1000-days`.
2. Upload all files from this folder to the repository root.
3. In the repository, open **Settings → Pages**.
4. Under the build/deployment source, choose **Deploy from a branch**.
5. Choose branch `main` and folder `/(root)`, then save.
6. Wait for GitHub Pages to publish. The URL will look like `https://YOUR-USERNAME.github.io/1000-days/`.

## Add it to an iPhone

1. Open the published URL in **Safari**.
2. Tap **Share**.
3. Choose **Add to Home Screen**. If offered, enable **Open as Web App**.
4. Tap **Add** and launch 1000 days from your Home Screen.

## Data and privacy

- Check-ins are saved in `localStorage` on the device/browser where the app is used.
- A public GitHub repository exposes the source code, not your local check-in data.
- Local data does not automatically sync across devices and can be lost if website data is cleared. Use **Settings → Export check-ins** for a JSON backup.
- There is no account system or server-side database in this starter version.

## Notes

This starter begins counting missed days from the first day you log. If you open it after a day has passed without a check-in, that past day is marked as missed. Use a single primary device/browser for the most consistent history until cloud sync is added.
