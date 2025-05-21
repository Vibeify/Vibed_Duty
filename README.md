# Vibed_Duty (ox_lib Minimal Duty Menu)

A simple, minimal FiveM duty management system for emergency services, using ox_lib for all UI and notifications. No React, no NUI HTML, no build step—just pure Lua and ox_lib context menus.

---

## Quickstart

1. **Drag and Drop**
   - Place the entire `Vibed_Duty` folder into your server's `resources` directory.

2. **Configure**
   - Edit `config.lua` to set up your departments and ace permissions.

3. **Add to Server Config**
   - Add `ensure ox_lib` (required dependency)
   - Add `ensure Vibed_Duty` to your `server.cfg`.

4. **Done!**
   - Use `/duty` in-game to open the ox_lib context menu.

---

## Features

- **/duty Command**: Players open a context menu to go on/off duty for allowed departments.
- **Ace Permissions**: Department access is controlled by ace permissions (see `config.lua`).
- **ox_lib UI**: All menus and notifications use ox_lib—no NUI, no HTML, no React.
- **Minimal, Fast, Reliable**: No database, no webhooks, no Discord integration by default (add your own if needed).
- **Webhook Logging**: If `Config.WebhookUrl` is set, all duty toggles are logged to Discord with a simple embed.
- **AFK/Disconnect Handling**: Players are automatically clocked off (with webhook logging) if they disconnect or are AFK for 30 minutes.

---

## File Structure

- `config.lua` — Department and ace permission configuration.
- `client.lua` — Handles `/duty` command and shows ox_lib context menu.
- `server.lua` — Checks ace permissions and handles duty toggling.
- `fxmanifest.lua` — Resource manifest, includes ox_lib as a dependency.

---

## Configuration

Edit `config.lua` to define your departments, ace permissions, and (optionally) your webhook URL:

```lua
Config.Departments = {
    { name = "LSPD", ace = "duty.lspd" },
    { name = "BCSO", ace = "duty.bcso" },
    { name = "EMS", ace = "duty.ems" }
}
Config.WebhookUrl = "https://discord.com/api/webhooks/your_webhook_here"
```
- Each department has a `name` (shown in the menu) and an `ace` permission (required to access).
- Set up your ace permissions in your server.cfg or permissions.cfg.
- If `Config.WebhookUrl` is set, all duty toggles are logged to Discord.

---

## Usage

- **/duty**: Opens the ox_lib context menu. Only departments for which the player has ace permission are shown.
- **Go On/Off Duty**: Select a department to toggle duty status (server prints to console; expand as needed).

---

## Customization & Extensibility

- Add Discord/webhook/DB logic in `server.lua` if needed.
- Change menu titles, add notifications, or extend logic using ox_lib's API.

---

## Troubleshooting

- **Menu Not Opening**: Ensure `ox_lib` is installed and started before this resource.
- **No Departments Shown**: Check your ace permissions and department config.

---

## Credits

- Built with [ox_lib](https://github.com/overextended/ox_lib).
- Minimal logic and config by Vibed_Duty authors.

---

## License

MIT License

Copyright (c) 2025 Vibed Development

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Need Help?

Open an issue or ask in https://discord.gg/7AcwrDfuPv
