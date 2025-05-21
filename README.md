# Mivrabots Duty Menu (Ghostline Style)

This resource is now structured and themed exactly like the [Ghostline Duty Menu](https://github.com/Ghostline-Network/Ghostline-Duty-Menu), but branded for Mivrabots.

## Features
- Modern, minimal React NUI (no build step, no Tailwind, no static/js)
- Loads React and ReactDOM from CDN
- Uses a single `main.js` for the UI logic
- Clean, centered modal with Ghostline/Mivrabots branding
- All configuration and backend logic remains in Lua

## Usage
1. Place the `Vibed_Duty` folder in your server's `resources` directory.
2. Configure `config.lua` as needed (see comments in file).
3. Add `ensure Vibed_Duty` to your `server.cfg`.
4. The NUI will now look and behave exactly like Ghostline's, but with your branding.

## File Structure
- `html/index.html` — Minimal HTML, loads React/ReactDOM from CDN, loads `main.js`.
- `html/main.js` — All React UI logic, no JSX, no build step.
- `html/ghostline.css` — Minimal CSS for background and font.
- No `App.jsx`, no `style.css`, no `static/js`.

## Customization
- Change the logo in `main.js` and `index.html` if you want your own branding.
- Adjust modal styles in `main.js` for further tweaks.

## Credits
- UI and structure based on [Ghostline Duty Menu](https://github.com/Ghostline-Network/Ghostline-Duty-Menu).
- Backend logic and configuration by Mivrabots authors.
