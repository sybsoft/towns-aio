import { consola } from 'consola'

import {
    RegistrationModule,
    GetTownsAddressModule,
    TabBoberModule,
    ReloginModule,
    ExportTownsWalletsModule,
    StatsReportModule
} from './sdk/modules/index.js'

import { printGreetingMessage } from './sdk/utils.js'
import { promptOptions } from './sdk/constants.js'
import { Database } from './sdk/database/database.js'


printGreetingMessage()
const input = await consola.prompt('Choose module', {
    type: 'select',
    options: promptOptions,
})

switch (input) {
    case '01': {
        const shouldCreateDatabase = await consola.prompt(
            'Do u wanna really create a database?',
            {
                type: 'confirm'
            }
        )
        if (shouldCreateDatabase) {
            Database.create()
        }
        break
    }
    case '02': {
        const registrationModule = new RegistrationModule()
        registrationModule.run()
        break
    }
    case '03': {
        const getTownsAddressModule = new GetTownsAddressModule()
        getTownsAddressModule.run()
        break
    }
    case '04': {
        const tpb = new TabBoberModule()
        tpb.run()
        break
    }
    case '05': {
        const rl = new ReloginModule()
        rl.run()
        break
    }
    case '06': {
        const ew = new ExportTownsWalletsModule()
        ew.run()
        break
    }
    case '07': {
        StatsReportModule.run()
        break
    }
    case '08': {
        Database.seed()
        break
    }
}
