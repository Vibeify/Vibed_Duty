RegisterServerEvent("duty:requestDepartments")
AddEventHandler("duty:requestDepartments", function()
    local src = source
    local allowed = {}

    for _, dept in ipairs(Config.Departments) do
        if IsPlayerAceAllowed(src, dept.ace) then
            table.insert(allowed, dept)
        end
    end

    TriggerClientEvent("duty:openMenu", src, allowed)
end)

local dutyState = {}
local lastActive = {}
local AFK_TIMEOUT = (Config.AFKTimeoutMinutes or 30) * 60 -- Minutes to seconds

AddEventHandler('playerDropped', function(reason)
    local src = source
    if dutyState[src] and dutyState[src].onDuty then
        -- Clock off on disconnect
        local now = os.time()
        local state = dutyState[src]
        local startTime = state.startTime or now
        local duration = now - startTime
        local total = (state.total or 0) + duration
        dutyState[src] = {onDuty = false, dept = state.dept, total = total}
        print(("Player %d auto clocked OFF (disconnect) for department: %s (Session: %ds, Total: %ds)"):format(src, state.dept or '?', duration, total))
        local webhook = Config.WebhookUrl or nil
        if webhook then
            local embed = {
                {
                    title = "Auto Clocked Off (Disconnect)",
                    description = (GetPlayerName(src) or ("ID %d"):format(src)) .. " disconnected and was clocked OFF for department: " .. (state.dept or '?'),
                    color = 16711680,
                    fields = {
                        { name = "Session Duration", value = string.format("%02d:%02d:%02d", math.floor(duration/3600), math.floor((duration%3600)/60), duration%60), inline = true },
                        { name = "Total Time", value = string.format("%02d:%02d:%02d", math.floor(total/3600), math.floor((total%3600)/60), total%60), inline = true }
                    },
                    footer = { text = os.date("%Y-%m-%d %H:%M:%S") }
                }
            }
            PerformHttpRequest(webhook, function() end, 'POST', json.encode({embeds = embeds}), { ['Content-Type'] = 'application/json' })
        end
    end
    dutyState[src] = nil
    lastActive[src] = nil
end)

RegisterNetEvent('duty:playerActive')
AddEventHandler('duty:playerActive', function()
    lastActive[source] = os.time()
end)

CreateThread(function()
    while true do
        Wait(60000)
        local now = os.time()
        for src, state in pairs(dutyState) do
            if state.onDuty and lastActive[src] and (now - lastActive[src] > AFK_TIMEOUT) then
                -- Clock off for AFK
                local startTime = state.startTime or now
                local duration = now - startTime
                local total = (state.total or 0) + duration
                dutyState[src] = {onDuty = false, dept = state.dept, total = total}
                print(("Player %d auto clocked OFF (AFK) for department: %s (Session: %ds, Total: %ds)"):format(src, state.dept or '?', duration, total))
                local webhook = Config.WebhookUrl or nil
                if webhook then
                    local embed = {
                        {
                            title = "Auto Clocked Off (AFK)",
                            description = (GetPlayerName(src) or ("ID %d"):format(src)) .. " was clocked OFF for being AFK in department: " .. (state.dept or '?'),
                            color = 16711680,
                            fields = {
                                { name = "Session Duration", value = string.format("%02d:%02d:%02d", math.floor(duration/3600), math.floor((duration%3600)/60), duration%60), inline = true },
                                { name = "Total Time", value = string.format("%02d:%02d:%02d", math.floor(total/3600), math.floor((total%3600)/60), total%60), inline = true }
                            },
                            footer = { text = os.date("%Y-%m-%d %H:%M:%S") }
                        }
                    }
                    PerformHttpRequest(webhook, function() end, 'POST', json.encode({embeds = embed}), { ['Content-Type'] = 'application/json' })
                end
            end
        end
    end
end)

RegisterServerEvent("duty:toggle")
AddEventHandler("duty:toggle", function(deptName)
    local src = source
    local playerName = GetPlayerName(src)
    local now = os.time()
    dutyState[src] = dutyState[src] or {}
    local state = dutyState[src]
    if state.onDuty and state.dept == deptName then
        -- Clocking off
        local startTime = state.startTime or now
        local duration = now - startTime
        local total = (state.total or 0) + duration
        dutyState[src] = {onDuty = false, dept = deptName, total = total}
        print(("Player %d clocked OFF for department: %s (Session: %ds, Total: %ds)"):format(src, deptName, duration, total))
        -- Webhook logic
        local webhook = Config.WebhookUrl or nil
        if webhook then
            local embed = {
                {
                    title = "Clocked Off Duty",
                    description = (playerName or ("ID %d"):format(src)) .. " clocked OFF for department: " .. deptName,
                    color = 16711680,
                    fields = {
                        { name = "Session Duration", value = string.format("%02d:%02d:%02d", math.floor(duration/3600), math.floor((duration%3600)/60), duration%60), inline = true },
                        { name = "Total Time", value = string.format("%02d:%02d:%02d", math.floor(total/3600), math.floor((total%3600)/60), total%60), inline = true }
                    },
                    footer = { text = os.date("%Y-%m-%d %H:%M:%S") }
                }
            }
            PerformHttpRequest(webhook, function(err, text, headers) end, 'POST', json.encode({embeds = embed}), { ['Content-Type'] = 'application/json' })
        end
    else
        -- Clocking on
        dutyState[src] = {onDuty = true, dept = deptName, startTime = now, total = state.total or 0}
        print(("Player %d clocked ON for department: %s"):format(src, deptName))
        -- Webhook logic
        local webhook = Config.WebhookUrl or nil
        if webhook then
            local embed = {
                {
                    title = "Clocked On Duty",
                    description = (playerName or ("ID %d"):format(src)) .. " clocked ON for department: " .. deptName,
                    color = 65280,
                    footer = { text = os.date("%Y-%m-%d %H:%M:%S") }
                }
            }
            PerformHttpRequest(webhook, function(err, text, headers) end, 'POST', json.encode({embeds = embed}), { ['Content-Type'] = 'application/json' })
        end
    end
end)