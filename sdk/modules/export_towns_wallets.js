import { EXPORT_TOWNS_WALLETS_FILE_PATH } from '../constants.js'
import { Database } from '../database/database.js'
import { consola } from 'consola'
import { exportJson } from '../utils.js'

export default class ExportTownsWalletsModule {
    async run() {
        consola.info('[Export towns wallets] Started...')

        const db = Database.read()

        const result = {}
        db.data.forEach((x) => {
            const emailString = `${x.email_username}:${x.email_password}`
            result[emailString] = x.tawns_wallet_address
        })

        exportJson(result, EXPORT_TOWNS_WALLETS_FILE_PATH, [
            ['Email', 'Wallet address']
        ])

        consola.success(
            `${db.data.length} wallets exported to ${EXPORT_TOWNS_WALLETS_FILE_PATH}`
        )
    }
}
