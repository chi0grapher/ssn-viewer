# Sawmill TV for Hermes

An unofficial Hermes Webapp plug-in for Plank’s original [Sawmill Shopping Network](https://reserve.plank.love/channel). It opens the official station beside your chat, with the station’s own controls and picture. No build step, dependencies, gateway restart, or plug-in account.

## Install from Git

In an **HTTPS Hermes Webapp** whose **Install from Git** supports Desktop UI plug-ins:

1. Open **Capabilities → Plugins → Install from Git**.
2. Paste `https://github.com/chi0grapher/ssn-viewer` and select **Review repository**. Hermes should show **Desktop UI**, not an agent plug-in. Review the code and choose **Install**.
3. Return to chat and click **Sawmill TV** in the bottom-right status bar, or use **Open Sawmill TV** in Hermes’s command palette. If the button hasn’t appeared yet, refresh the tab. Click the record for sound.

The Webapp installs on the Hermes server for you. You need permission to install plug-ins in that instance, not shell access or a GitHub account for a public repo.

**Compatibility:** The viewer requires the HTTPS Webapp (verified in Chromium). It doesn’t add a viewer to stock native Electron Desktop, the legacy dashboard, HTTP-only Webapp, terminal, or Telegram. Do not use the agent plug-in CLI to install this UI-only package. If your Webapp cannot install desktop plug-ins from Git, an administrator can use the manual method below.

## Watch and open links

- Click a market link in the station. **Open in Hermes** shows Plank’s read-only preview when available. **Open externally** opens the original market page in a new tab. Browsing in Hermes keeps the station playing.
- **Remember** saves the choice locally in this browser for this Hermes site. Revert to asking with **Reset Sawmill link choice** in the command palette.
- Close the Sawmill TV dock to stop playback. Use **Capabilities → Plugins** to disable or remove the plug-in.

## Manual install

Download the repository ZIP, extract it, and place `plugin.js` in `~/.hermes/desktop-plugins/ssn-viewer/` on the **Hermes server** (or its configured app-level Hermes home). Do not copy the ZIP itself or put the entry under a chat profile. Back up an existing `ssn-viewer` folder first. Refresh the Webapp. `SHA256SUMS` identifies the shipped entry.

## What it accesses

The plug-in has no Python, backend routes, third-party library downloads, analytics, or wallet access. The browser loads the official station and read-only previews directly from Plank. Visiting the full market opens Plank’s own site in another tab. The plug-in itself stores only the optional link-opening preference in Hermes’s local browser storage.

Not an official Hermes or Plank plug-in. Plank’s station, market content, and artwork are not included in this repository.
