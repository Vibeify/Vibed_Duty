-- client/main.lua
-- Handles NUI toggling, focus, and communication with server

RegisterCommand('duty', function()
    SetNuiFocus(true, true)
    SendNUIMessage({ type = 'toggleDutyUI' })
    TriggerServerEvent('duty:requestDutyData')
end)

RegisterNUICallback('setNuiFocus', function(data, cb)
    SetNuiFocus(data.focus, data.cursor)
    cb('ok')
end)

RegisterNUICallback('goOnDuty', function(data, cb)
    TriggerServerEvent('duty:goOnDuty', data)
    cb('ok')
end)

RegisterNUICallback('clockOff', function(_, cb)
    TriggerServerEvent('duty:clockOff')
    cb('ok')
end)

RegisterNUICallback('cancelDutyUI', function(_, cb)
    SetNuiFocus(false, false)
    SendNUIMessage({ type = 'closeDutyUI' })
    cb('ok')
end)

RegisterNetEvent('duty:setDutyUI', function(data)
    SendNUIMessage({ type = 'setDutyUI', data = data })
    if data and not data.error then
        SetNuiFocus(true, true)
    end
end)

RegisterNetEvent('duty:goOnDutyResult', function(result)
    SendNUIMessage({ type = 'goOnDutyResult', data = result })
    if result.success then
        SetNuiFocus(false, false)
    end
end)

RegisterNetEvent('duty:clockOffResult', function(result)
    SendNUIMessage({ type = 'clockOffResult', data = result })
    if result.success then
        SetNuiFocus(false, false)
    end
end)
