Config = {}

-- Discord Webhook URLs
Config.DiscordWebhookUrls = {
    OnDuty = "https://discord.com/api/webhooks/ON_DUTY_WEBHOOK",
    OffDuty = "https://discord.com/api/webhooks/OFF_DUTY_WEBHOOK"
}

-- Department Mapping: [Discord Role ID] = Department Name
Config.Departments = {
    ['123456789012345678'] = 'Law Enforcement',
    ['234567890123456789'] = 'Fire Department',
    ['345678901234567890'] = 'EMS',
    ['456789012345678901'] = 'Dispatch'
}

-- (Optional) Default Callsign Prefix
Config.DefaultCallsignPrefix = "U"

-- (Optional) Events to trigger on duty state change
Config.DutyStateChangeEvents = {
    OnDuty = "my_job_script:setOnDuty",   -- (source, department, callsign)
    OffDuty = "my_job_script:setOffDuty"  -- (source)
}

-- Discord Bot Token (for direct Discord API calls)
Config.DiscordBotToken = "YOUR_DISCORD_BOT_TOKEN_HERE"
Config.DiscordGuildId = "YOUR_DISCORD_GUILD_ID_HERE"

-- Extra polish and usability options
Config.Debug = true -- Print debug info to server console
Config.Locale = "en" -- For future translation support
Config.LogToConsole = true -- Log all duty changes to server console
Config.AllowedDepartments = { -- Restrict selectable departments (optional, leave empty for all)
    'Law Enforcement', 'Fire Department', 'EMS', 'Dispatch'
}
