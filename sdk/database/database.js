import fs from 'fs'
import { consola } from 'consola'


import {
    EMAILS_FILE_PATH,
    DB_FILE_PATH,
    PROXIES_FILE_PATH
} from '../constants.js'

import { getRandomUserAgent, readFromJson, readFromTxt, shuffleArray } from '../utils.js'
import { Account, initAccountFromObject } from './models/account.js'


export class Database {
    constructor(data = []) {
        this.data = data
    }

    toJson() {
        return this.data.map((dataItem) => ({ ...dataItem }))
    }

    updateItemById(id, field, value) {
        const wallet = this.data.find((item) => item.id === id)

        if (wallet) {
            wallet[field] = value
        } else {
            consola.error(`[Database] Wallet with id: ${id} not found`)
        }
    }

    static async createAccountInstance(id, email, proxy) {
        const [email_username, email_password] = email.split(':')
        const user_agent = getRandomUserAgent()

        return new Account(
            id,
            email_username,
            email_password,
            null,
            0,
            null,
            null,
            proxy,
            user_agent
        )
    }

    static async checkInputData(emails, proxies) {
        if(emails.length !== proxies.length) {
            throw new Error(`[Database] Emails and proxies length mismatch`)
        }
        
    }

    static async create() {
        const data = []

        const emails = readFromTxt(EMAILS_FILE_PATH)
        const proxies = readFromTxt(PROXIES_FILE_PATH)

        await Database.checkInputData(emails, proxies)


        for (const email of emails) {
            try {
                const account_index = emails.indexOf(email)

                const item = await Database.createAccountInstance(
                    account_index,
                    email,
                    proxies[account_index]
                )

                data.push(item)
            } catch (e) {
                consola.error(`[Database] Error: ${e}`)
            }
        }

        consola.success(`[Database] Created successfully`)

        const db = new Database(data)
        db.save()
        return db
    }

    static read(fileName = DB_FILE_PATH) {
        try {
            const dbJson = readFromJson(fileName)

            const data = dbJson.map((item) => {
                return initAccountFromObject(item)
            })

            return new Database(data)
        } catch (e) {
            consola.error(`[Database] Error: ${e}`)
            return new Database([])
        }
    }

    static async seed(fileName = DB_FILE_PATH) {
        try {
            const db = Database.read(fileName)
            const data = db.data

            const emails = readFromTxt(EMAILS_FILE_PATH)
            const proxies = readFromTxt(PROXIES_FILE_PATH)

            await Database.checkInputData(emails, proxies)

            for (const account of data) {
                const email = emails[account.id]
                const proxy = proxies[account.id]

                account.email_username = email
                account.proxy = proxy
            }

            if(data.length !== emails.length) {
                consola.info(`[Database] Found new entries...`)

                for (let i = data.length; i < emails.length; i++) {
                    const email = emails[i]
                    const proxy = proxies[i]

                    const item = await Database.createAccountInstance(i, email, proxy)
                    data.push(item)
                }
            }

            db.save()
        } catch (e) {
            consola.error(`[Database] Error: ${e}`)
        }
    }

    save(fileName = DB_FILE_PATH) {
        try {
            const dbJson = this.toJson()
            fs.writeFileSync(fileName, JSON.stringify(dbJson, null, 4))
            consola.success(`[Database] Saved to ${fileName}`)
        } catch (e) {
            consola.error(`[Database] Error: ${e}`)
        }
    }

    static getAccountsForCriteria(criteria, fileName = DB_FILE_PATH) {
        try {
            const db = Database.read(fileName)
            return db.data.filter(criteria)
        } catch (e) {
            consola.error(`[Database] Error: ${e}`)
            return new Database([])
        }
    }

    static getAccountsForRegistration(fileName = DB_FILE_PATH) {
        return shuffleArray(Database.getAccountsForCriteria((item) => item.created_at === null, fileName))
    }

    static getAccountsForWalletAddressFill(fileName = DB_FILE_PATH) {
        return shuffleArray(Database.getAccountsForCriteria((item) => item.created_at != null && item.tawns_wallet_address === null, fileName))
    }

    static getAccountsForBoberTap(fileName = DB_FILE_PATH) {
        const isTapable = (item) => item.created_at !== null && (item.last_bober_tapped_time === null || item.last_bober_tapped_time === 0 || item.last_bober_tapped_time - Number(new Date()) >= 24 * 60 * 60)
        return shuffleArray(Database.getAccountsForCriteria(isTapable, fileName))
    }
}