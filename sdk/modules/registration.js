import { consola } from 'consola'

import TownsClient from '../core/towns_client.js'
import { EmailClient } from '../core/email_client.js'

import { getDefaultBrowserSession } from '../core/browser.js'

import { Database } from '../database/database.js'
import { sleep } from '../utils.js'

import config from '../config.js'



export default class RegistrationModule {
    async run() {
        consola.start('[Registration] Started...')
        
        const townsClient = new TownsClient()
        const emailClient = new EmailClient(
            config.EMAIL_SERVICE_URL,
            config.EMAIL_SERVICE_IMAP_HOST,
            config.EMAIL_SERVICE_IMAP_PORT
        )
        await emailClient.ping()

        const db = Database.read()
        const database = Database.getAccountsForRegistration()

        let index = 1
        for (const account of database) {
            const browserData = await getDefaultBrowserSession(
                !config.SHOW_BROWSER,
                account.proxy,
                account.user_agent
            )
            try {
                consola.start(
                    `[Registration] [${index}/${database.length}]. Working with ${account.email_username}`
                )

                const [isAccountRegistered, wallet_address] = await townsClient.register(
                    emailClient,
                    browserData,
                    account
                )
                if (isAccountRegistered) {
                    db.updateItemById(account.id, 'created_at', Date.now())
                    db.updateItemById(
                        account.id,
                        'tawns_wallet_address',
                        wallet_address
                    )
                    db.save()

                    await sleep(
                        config.REGISTRATION_DELAY_SEC[0],
                        config.REGISTRATION_DELAY_SEC[1]
                    )
                } else {
                    throw new Error('false res')
                }

                await browserData.browser.close()
            } catch (e) {
                consola.error('[Registration] Failed to proccess account')
                consola.error(e.message)

                await browserData.browser.close()
            }
            index++
        }

        consola.success('[Registration] All accounts processed')
    }
}
