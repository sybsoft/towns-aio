import { Database } from '../database/database.js'
import { sleep } from '../utils.js'
import consola from 'consola'
import config from '../config.js'

import TownsClient from '../core/towns_client.js'
import { getAccountBrowserSession } from '../core/browser.js'


export default class GetTownsAddressModule {
    async run() {
        consola.start('[Get profile wallet address] Started...')

        const db = Database.read()
        const database = Database.getAccountsForWalletAddressFill()

        const townsClient = new TownsClient()

        let index = 1
        for (const account of database) {
            consola.start(
                `[${index}/${database.length}]. Working with ${account.email_username}`
            )

            try {
                const browserData = await getAccountBrowserSession(
                    account.id,
                    !config.SHOW_BROWSER,
                    account.proxy,
                    account.user_agent
                )

                const walletAddress = await townsClient.getProfileWalletAddress(browserData)

                if (walletAddress) {
                    db.updateItemById(
                        account.id,
                        'tawns_wallet_address',
                        walletAddress
                    )
                    db.save()

                    await sleep(
                        config.REGISTRATION_DELAY_SEC[0],
                        config.REGISTRATION_DELAY_SEC[1]
                    )
                }
            } catch (e) {
                consola.error('[Get profile wallet address] Failed to proccess account')
                consola.error(e)
            }

            index++
        }

        consola.success('[Get profile wallet address] All accounts processed')
    }
}
