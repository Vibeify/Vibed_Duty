fx_version 'cerulean'
game 'gta5'

author 'YourName'
description 'Comprehensive Duty Management System for Emergency Services'
version '1.0.0'

shared_scripts {
    'config.lua'
}

server_scripts {
    'server/main.lua'
}

client_scripts {
    'client/main.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/static/js/*.js',
    'html/static/css/*.css',
    'html/static/media/*',
    'html/favicon.ico',
    'html/style.css'
}

dependencies {
    -- 'es_extended', -- Uncomment if using ESX
    -- 'qb-core',     -- Uncomment if using QBCore
}
