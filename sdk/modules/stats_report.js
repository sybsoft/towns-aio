import { Database } from '../database/database.js'
import { consola } from 'consola'
import { EXPORT_TOWNS_STATS_FILE_PATH } from '../constants.js'
import XLSX from 'xlsx'

export default class StatsReportModule {
    static async exportJson(
        data,
        destination,
        headers,
        workbook,
        sheet = 'Sheet1'
    ) {
        try {
            const worksheetData = headers

            for (const [key, value] of Object.entries(data)) {
                worksheetData.push([key, ...value])
            }

            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
            XLSX.utils.book_append_sheet(workbook, worksheet, sheet)
        } catch (error) {
            consola.error(
                `[Stats report] Encountered an error while exporting db to Excel: ${error.message}`
            )
            process.exit(1)
        }
    }

    static async getAccountReport(account) {
        return [
            account.created_at != null ? 'Yes' : 'No',
            account.tawns_wallet_address,
            account.last_bober_tapped_time != 0 ? 'Yes' : 'No',
            account.bober_tap_count,
            account.create_town_left,
            account.join_town_left,
            account.town_msgs_left
        ]
    }

    static async run() {
        consola.start('[Stats report] Started...')

        const db = Database.read()

        let index = 1
        let r = {}

        const workbook = XLSX.utils.book_new()

        const created = db.data.filter((x) => x.created_at != null)
        const boberTapped = db.data.filter((x) => x.last_bober_tapped_time != 0)
        const townsWalletFetched = db.data.filter(
            (x) => x.tawns_wallet_address != null
        )

        // Get all accounts
        for (let i = 0; i < db.data.length; i++) {
            const account = db.data.find((x) => x.id == i)

            try {
                const result = await StatsReportModule.getAccountReport(account)

                r[account.id] = result
            } catch (e) {
                consola.error('Failed to process account... Skipping')
                consola.error(e)
            }

            index++
        }
        let headers = [
            'Id',
            'Registered',
            'Towns wallet address',
            'Bober tapped',
            'Bober tap count',
            'Create town left',
            'Join town left',
            'Town msgs left'
        ]

        r['counter'] = [
            `${created.length} / ${db.data.length}`,
            `${townsWalletFetched.length} / ${db.data.length}`,
            `${boberTapped.length} / ${db.data.length}`,
            '-',
            '-',
            '-',
            '-'
        ]
        await StatsReportModule.exportJson(
            r,
            EXPORT_TOWNS_STATS_FILE_PATH,
            [headers],
            workbook,
            'Statistics'
        )

        // Get all bober failed wallets
        r = {}
        index = 1
        for (let i = 0; i < db.data.length; i++) {
            const account = db.data.find((x) => x.id == i)

            try {
                if (account.last_bober_tapped_time == 0) {
                    r[account.id] = ['yes']
                }
            } catch (e) {
                consola.error('Failed to process account... Skipping')
                consola.error(e)
            }

            index++
        }
        headers = ['Id', 'Bober failed']
        await StatsReportModule.exportJson(
            r,
            EXPORT_TOWNS_STATS_FILE_PATH,
            [headers],
            workbook,
            'Bober failed'
        )

        // Get all unregistered wallets
        r = {}
        index = 1
        for (let i = 0; i < db.data.length; i++) {
            const account = db.data.find((x) => x.id == i)

            try {
                if (account.created_at == null) {
                    r[account.id] = ['yes']
                }
            } catch (e) {
                consola.error('Failed to process account... Skipping')
                consola.error(e)
            }

            index++
        }
        headers = ['Id', 'Registration failed']
        await StatsReportModule.exportJson(
            r,
            EXPORT_TOWNS_STATS_FILE_PATH,
            [headers],
            workbook,
            'Unregistered'
        )

        // Get all towns wallet null wallets
        r = {}
        index = 1
        for (let i = 0; i < db.data.length; i++) {
            const account = db.data.find((x) => x.id == i)

            try {
                if (account.tawns_wallet_address == null) {
                    r[account.id] = ['yes']
                }
            } catch (e) {
                consola.error('Failed to process account... Skipping')
                consola.error(e)
            }

            index++
        }
        headers = ['Id', 'Towns wallet null']
        await StatsReportModule.exportJson(
            r,
            EXPORT_TOWNS_STATS_FILE_PATH,
            [headers],
            workbook,
            'Towns wallet null'
        )

        XLSX.writeFile(workbook, EXPORT_TOWNS_STATS_FILE_PATH)
        consola.success(`[Stats report] Exported stats to ${EXPORT_TOWNS_STATS_FILE_PATH}`)
    }
}
