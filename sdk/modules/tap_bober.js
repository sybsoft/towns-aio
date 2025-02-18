import TownsClient from '../core/towns_client.js'
import { Database } from '../database/database.js'
import { getAccountBrowserSession } from '../core/browser.js'

import { consola } from 'consola'

import config from '../config.js'
export default class TabBoberModule {
    async run() {
        consola.info('[Tap bober] Started...')

        const database = Database.read()
        const db = Database.getAccountsForBoberTap()

        const townsClient = new TownsClient()

        let index = 1

        for (const account of db) {
            consola.log('\n')
            consola.start(
                `[${index}/${db.length}]. Working with ${account.email_username}`
            )

            const browserData = await getAccountBrowserSession(
                account.id,
                !config.SHOW_BROWSER,
                account.proxy,
                account.user_agent
            )

            const isTapped = await townsClient.tapBober(browserData)
            if (isTapped) {
                const currentTimestamp = Number(new Date())
                database.updateItemById(
                    account.id,
                    'last_bober_tapped_time',
                    currentTimestamp
                )

                database.save()
            }

            index++
        }

        consola.success('[Tap bober] All accounts processed')
    }
}
