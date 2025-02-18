import { Database } from '../database/database.js'
import { sleep } from '../utils.js'
import TownsClient from '../core/towns_client.js'
import { getAccountBrowserSession } from '../core/browser.js'

import config from '../config.js'
import { consola } from 'consola'

export default class ReloginModule {
    async run() {
        consola.info('[Relogin] Started...')

        const db = Database.read()

        const townsClient = new TownsClient()

        for (const account of db) {
            try {
                consola.log('\n')
                consola.start(
                    `[${account.id + 1}/${db.length}]. Working with ${account.email_username}`
                )

                const browserData = await getAccountBrowserSession(
                    account.id,
                    !config.SHOW_BROWSER,
                    account.proxy,
                    account.user_agent
                )

                const [isAccountRegistered, wallet_address] = await townsClient.register(
                    browserData,
                    account,
                    false
                )
                if (isAccountRegistered) {
                    await sleep(
                        config.REGISTRATION_DELAY_SEC[0],
                        config.REGISTRATION_DELAY_SEC[1]
                    )
                }
            } catch (e) {
                consola.error('[Relogin] Failed to proccess account')
                consola.error(e)
            }
        }
    }
}
