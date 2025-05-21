Config = {}

Config.WebhookUrl = "" -- Set your Discord webhook URL here, or leave blank to disable webhook logging

Config.AFKTimeoutMinutes = 30 -- Minutes before auto clock-off (set 0 to disable)

Config.Departments = {
    {
        name = "LSPD",
        ace = "duty.lspd"
    },
    {
        name = "BCSO",
        ace = "duty.bcso"
    },
    {
        name = "EMS",
        ace = "duty.ems"
    }
}