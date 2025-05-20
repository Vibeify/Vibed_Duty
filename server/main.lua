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

-- Utility: Fetch Discord roles directly using Discord API and bot token
local function FetchDiscordRoles(discordId, cb)
    local endpoint = string.format("https://discord.com/api/guilds/%s/members/%s", Config.DiscordGuildId, discordId)
    PerformHttpRequest(endpoint, function(status, data)
        if status == 200 and data then
            local member = json.decode(data)
            cb(member.roles or {})
        else
            cb({})
        end
    end, 'GET', '', {
        ["Authorization"] = "Bot " .. Config.DiscordBotToken,
        ["Content-Type"] = "application/json"
    })
end

-- Utility: Filter departments by roles and allowed departments
local function GetAvailableDepartments(roles)
    local available = {}
    for roleId, dept in pairs(Config.Departments) do
        for _, r in ipairs(roles) do
            if tostring(roleId) == tostring(r) then
                if not Config.AllowedDepartments or #Config.AllowedDepartments == 0 or table.contains(Config.AllowedDepartments, dept) then
                    table.insert(available, { id = roleId, name = dept })
                end
            end
        end
    end
    return available
end

-- Utility: Table contains helper
function table.contains(tbl, val)
    for _, v in ipairs(tbl) do
        if v == val then return true end
    end
    return false
end

-- Utility: Send Discord webhook
local function SendWebhook(type, embed)
    local url = Config.DiscordWebhookUrls[type]
    if not url then return end
    PerformHttpRequest(url, function() end, 'POST', json.encode({ embeds = {embed} }), { ['Content-Type'] = 'application/json' })
end

-- Local file persistence for duty state
local dutyFile = 'data/duty_status.json'
local dutyState = {}

-- Load duty state from file
local function LoadDutyState()
    local file = LoadResourceFile(GetCurrentResourceName(), dutyFile)
    if file then
        local ok, data = pcall(json.decode, file)
        if ok and type(data) == 'table' then
            dutyState = data
        end
    end
end

-- Save duty state to file
local function SaveDutyState()
    SaveResourceFile(GetCurrentResourceName(), dutyFile, json.encode(dutyState, { indent = true }), -1)
end

LoadDutyState()

local function SetDutyStatus(userId, data, cb)
    dutyState[userId] = dutyState[userId] or {}
    for k, v in pairs(data) do
        dutyState[userId][k] = v
    end
    SaveDutyState()
    cb(true)
end

local function GetDutyStatus(userId, cb)
    cb(dutyState[userId])
end

-- Add debug/logging for all duty changes
local function LogDutyChange(msg)
    if Config.LogToConsole then
        print("[Vibed_Duty] " .. msg)
    end
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
            if Config.Debug then LogDutyChange((name or 'Unknown') .. ' went ON DUTY as ' .. department .. ' (' .. callsign .. ')') end
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
                if Config.Debug then LogDutyChange((name or 'Unknown') .. ' went OFF DUTY from ' .. (dutyData.department or 'N/A') .. ' (' .. (dutyData.callsign or 'N/A') .. ')') end
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
