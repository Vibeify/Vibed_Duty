-- Vibed_Duty client.lua (ox_lib only, secure, best practices)

-- Register the /duty command
RegisterCommand('duty', function()
    -- Request allowed departments from the server
    TriggerServerEvent('Vibed_Duty:requestDepartments')
end)

-- Receive allowed departments from the server
RegisterNetEvent('Vibed_Duty:showDutyMenu', function(departments)
    if not departments or #departments == 0 then
        TriggerEvent('ox_lib:notify', {
            title = 'Duty System',
            description = 'You do not have access to any departments.',
            type = 'error',
        })
        return
    end

    local options = {}
    for _, dept in ipairs(departments) do
        table.insert(options, { value = dept.name, label = dept.name })
    end

    -- Step 1: Choose department
    lib.inputDialog('Select Duty Department', {
        { type = 'select', label = 'Choose your department', options = options },
    }, function(input)
        if not input then return end
        local department = input[1]
        if not department or department == '' then return end

        -- Step 2: Enter details
        lib.inputDialog('Enter Details', {
            { type = 'input', label = 'Enter your name (e.g. Mike S.)' },
            { type = 'input', label = 'Enter your callsign (e.g. 1B-01 or 101)' }
        }, function(details)
            if not details then return end
            local name = details[1]
            local callsign = details[2]
            if department == '' or name == '' or callsign == '' then
                TriggerEvent('ox_lib:notify', {
                    title = 'Duty System',
                    description = 'All fields must be filled!',
                    type = 'error',
                })
                return
            end
            -- Send duty details to server for ace check, toggling, and webhook
            TriggerServerEvent('Vibed_Duty:toggleDuty', department, name, callsign)
        end)
    end)
end)

-- AFK ping thread (if needed for AFK detection)
Citizen.CreateThread(function()
    while true do
        TriggerServerEvent('Vibed_Duty:afkPing')
        Citizen.Wait(60000) -- 1 minute
    end
end)