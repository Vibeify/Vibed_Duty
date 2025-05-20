-- server/main.lua
-- Handles duty management, framework integration, Firestore, Discord webhooks, and NUI communication

local ESX, QBCore = nil, nil

-- Framework detection
CreateThread(function()
    if GetResourceState('es_extended') == 'started' then
        TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
    elseif GetResourceState('qb-core') == 'started' then
        QBCore = exports['qb-core']:GetCoreObject()
    end
end)

-- Utility: Get Discord ID from identifiers
local function GetDiscordId(src)
    for _, v in ipairs(GetPlayerIdentifiers(src)) do
        if v:find('discord:') then
            return v:gsub('discord:', '')
        end
    end
    return nil
end

-- Utility: HTTP request to Discord bot API for roles
local function FetchDiscordRoles(discordId, cb)
    PerformHttpRequest(Config.DiscordBotApi .. '/' .. discordId, function(status, data)
        if status == 200 and data then
            local roles = json.decode(data)
            cb(roles)
        else
            cb({})
        end
    end, 'GET')
end

-- Utility: Filter departments by roles
local function GetAvailableDepartments(roles)
    local available = {}
    for roleId, dept in pairs(Config.Departments) do
        for _, r in ipairs(roles) do
            if tostring(roleId) == tostring(r) then
                table.insert(available, { id = roleId, name = dept })
            end
        end
    end
    return available
end

-- Utility: Send Discord webhook
local function SendWebhook(type, embed)
    local url = Config.DiscordWebhookUrls[type]
    if not url then return end
    PerformHttpRequest(url, function() end, 'POST', json.encode({ embeds = {embed} }), { ['Content-Type'] = 'application/json' })
end

-- Utility: Firestore REST API (placeholder, implement with your preferred method)
local function SetDutyStatus(userId, data, cb)
    -- Implement Firestore REST API call here
    cb(true)
end
local function GetDutyStatus(userId, cb)
    -- Implement Firestore REST API call here
    cb(nil)
end

-- /duty command
RegisterCommand('duty', function(source)
    local src = source
    local name = GetPlayerName(src)
    local discordId = GetDiscordId(src)
    if not discordId then
        TriggerClientEvent('duty:setDutyUI', src, { error = 'Discord not found.' })
        return
    end
    FetchDiscordRoles(discordId, function(roles)
        local availableDepartments = GetAvailableDepartments(roles)
        GetDutyStatus(discordId, function(dutyData)
            TriggerClientEvent('duty:setDutyUI', src, {
                onDuty = dutyData and dutyData.onDuty or false,
                playerName = name,
                availableDepartments = availableDepartments,
                department = dutyData and dutyData.department or nil,
                callsign = dutyData and dutyData.callsign or nil
            })
        end)
    end)
end)

-- NUI Callbacks (using RegisterNetEvent for FiveM Lua)
RegisterNetEvent('duty:goOnDuty', function(data)
    local src = source
    local name = GetPlayerName(src)
    local discordId = GetDiscordId(src)
    if not discordId then return end
    local department, callsign = data.department, data.callsign
    if not department or not callsign then return end
    local startTime = os.time()
    SetDutyStatus(discordId, { onDuty = true, department = department, callsign = callsign, startTime = startTime }, function(success)
        if success then
            SendWebhook('OnDuty', {
                title = 'Player On Duty',
                description = (name or 'Unknown') .. ' is now on duty.',
                fields = {
                    { name = 'Discord ID', value = discordId, inline = true },
                    { name = 'Department', value = department, inline = true },
                    { name = 'Callsign', value = callsign, inline = true },
                    { name = 'Clock On', value = os.date('!%Y-%m-%d %H:%M:%S', startTime), inline = false }
                },
                color = 65280
            })
            if Config.DutyStateChangeEvents.OnDuty then
                TriggerEvent(Config.DutyStateChangeEvents.OnDuty, src, department, callsign)
            end
            TriggerClientEvent('duty:goOnDutyResult', src, { success = true })
        else
            TriggerClientEvent('duty:goOnDutyResult', src, { success = false, error = 'Failed to update Firestore.' })
        end
    end)
end)

RegisterNetEvent('duty:clockOff', function()
    local src = source
    local name = GetPlayerName(src)
    local discordId = GetDiscordId(src)
    if not discordId then return end
    GetDutyStatus(discordId, function(dutyData)
        if not dutyData or not dutyData.onDuty then
            TriggerClientEvent('duty:clockOffResult', src, { success = false, error = 'Not on duty.' })
            return
        end
        local endTime = os.time()
        local duration = endTime - (dutyData.startTime or endTime)
        SetDutyStatus(discordId, { onDuty = false }, function(success)
            if success then
                SendWebhook('OffDuty', {
                    title = 'Player Off Duty',
                    description = (name or 'Unknown') .. ' is now off duty.',
                    fields = {
                        { name = 'Discord ID', value = discordId, inline = true },
                        { name = 'Department', value = dutyData.department or 'N/A', inline = true },
                        { name = 'Callsign', value = dutyData.callsign or 'N/A', inline = true },
                        { name = 'Clock Off', value = os.date('!%Y-%m-%d %H:%M:%S', endTime), inline = false },
                        { name = 'Shift Duration', value = string.format('%02dh %02dm %02ds', math.floor(duration/3600), math.floor((duration%3600)/60), duration%60), inline = false }
                    },
                    color = 16711680
                })
                if Config.DutyStateChangeEvents.OffDuty then
                    TriggerEvent(Config.DutyStateChangeEvents.OffDuty, src)
                end
                TriggerClientEvent('duty:clockOffResult', src, { success = true })
            else
                TriggerClientEvent('duty:clockOffResult', src, { success = false, error = 'Failed to update Firestore.' })
            end
        end)
    end)
end)
