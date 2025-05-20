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

-- Firestore/Firebase
Config.Firebase = {
    AppId = "__app_id",
    ApiKey = "__firebase_config",
    AuthToken = "__initial_auth_token"
}

-- Discord Bot API Endpoint (for role fetching)
Config.DiscordBotApi = "http://localhost:3000/api/roles" -- Example endpoint
