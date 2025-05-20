# Quickstart

1. **Drag and Drop**
   - Place the entire `Vibed_Duty` folder into your server's `resources` directory.

2. **Configure**
   - Open `config.lua` and set your Discord bot token (`Config.DiscordBotToken`), guild ID (`Config.DiscordGuildId`), webhook URLs, and department role IDs.
   - (Optional) Adjust AFK timeout, admin groups, and webhook embed options.

3. **Add to Server Config**
   - Add `ensure Vibed_Duty` to your `server.cfg`.

4. **Invite Your Bot**
   - Make sure your Discord bot is in your server with the `View Members` permission.

5. **Done!**
   - Use `/duty` in-game to open the menu.
   - Admins can use `/dutycheck` to see who is on duty.

---

# Vibed_Duty - Simple & Robust Duty Management for FiveM Emergency Services

## Overview

Vibed_Duty is a drag-and-drop FiveM resource for emergency services (LEO, Fire, EMS, Dispatch) that is easy to set up, requires no database, and is fully integrated with Discord for department selection and logging. All duty state is saved in a local file—no Firestore, no SQL, no hassle.

---

## Features

- **/duty Command**: Players clock on/off duty via an in-game command and a modern NUI panel.
- **Discord Role-Based Departments**: Only departments matching the player's Discord roles are selectable.
- **Callsign Input**: Players enter their callsign when going on duty.
- **Persistent Duty State**: All data is saved in a local file and survives restarts.
- **Discord Webhook Logging**: All clock-on/off events are logged to Discord webhooks.
- **No Database Required**: No SQL, no Firestore, no cloud setup—just works.
- **Modern NUI**: Clean, responsive React UI with Tailwind CSS.

---

## Installation

1. **Drag and Drop**
   - Place the entire `Vibed_Duty` folder into your server's `resources` directory.

2. **Add to Server Config**
   - Add `ensure Vibed_Duty` to your `server.cfg`.

3. **Dependencies**
   - You must run a simple Discord bot with an API endpoint for role fetching (see below).
   - No database or build step required.

---

## Configuration

Edit `config.lua` to match your server's setup:

- **Discord Webhook URLs**: Set your on-duty and off-duty webhook URLs.
- **Departments**: Map Discord Role IDs to department names.
- **Default Callsign Prefix**: (Optional) Used for auto-generating callsigns.
- **Duty State Change Events**: (Optional) Trigger events in other scripts (e.g., for uniforms, radio access).
- **Discord Bot Token & Guild ID**: Set your Discord bot token (`Config.DiscordBotToken`) and your Discord server's guild ID (`Config.DiscordGuildId`).

Example:
```lua
Config.DiscordWebhookUrls = {
    OnDuty = "https://discord.com/api/webhooks/ON_DUTY_WEBHOOK",
    OffDuty = "https://discord.com/api/webhooks/OFF_DUTY_WEBHOOK"
}
Config.Departments = {
    ['123456789012345678'] = 'Law Enforcement',
    ['234567890123456789'] = 'Fire Department',
    ['345678901234567890'] = 'EMS',
    ['456789012345678901'] = 'Dispatch'
}
Config.DiscordBotToken = "YOUR_DISCORD_BOT_TOKEN_HERE"
Config.DiscordGuildId = "YOUR_DISCORD_GUILD_ID_HERE"
```

---

## Discord Role Integration

FiveM does **not** natively provide Discord roles. This resource uses your Discord bot token and guild ID to fetch a user's roles directly from Discord's API.

- The server will use `Config.DiscordBotToken` and `Config.DiscordGuildId` to get an array of role IDs for each player.
- The bot must be in your Discord server and have permission to read member roles.

---

## Duty State Persistence (No Database Required!)

- Duty state is stored in a simple local file: `data/duty_status.json`.
- All on-duty/off-duty actions are saved and loaded automatically.
- No external database or cloud service is required.
- The file is human-readable and easy to back up or edit.

---

## Usage

- **/duty**: Opens the NUI panel. If off-duty, shows the "Go On Duty" form. If on-duty, shows the "Clock Off" confirmation.
- **Department Selection**: Only shows departments matching the player's Discord roles.
- **Callsign**: Enter your callsign when going on duty.
- **Clock Off**: When clocking off, the shift duration is calculated and logged.

---

## NUI (React App)

- Clean, responsive UI with Tailwind CSS.
- Loading indicators and error messages for user feedback.
- Seamless focus handling for immersive experience.
- No build step required—just drag and drop.

---

## Customization & Extensibility

- **Framework Hooks**: Use `Config.DutyStateChangeEvents` to trigger events in your job/uniform/radio scripts.
- **UI**: Edit `html/App.jsx` and re-bundle if you want to customize the NUI.
- **Logging**: Webhook payloads are easily customizable in `server/main.lua`.

---

## Troubleshooting

- **NUI Not Opening**: Ensure all files are present and `ui_page` is set correctly in `fxmanifest.lua`.
- **Discord Roles Not Detected**: Check your Discord bot API and ensure the bot is in your server.
- **Duty State Not Saving**: Ensure the `data/` folder exists and is writable by the server.
- **Webhooks Not Sending**: Double-check your webhook URLs and Discord permissions.

---

## Credits

- Developed by YourName
- React, Tailwind CSS, and FiveM community

---

## License

MIT or your preferred license.

---

## Need Help?

Open an issue or contact the author for support or customizations.
