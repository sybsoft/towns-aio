import { consola } from 'consola'

import { clickForSelector, sleep } from '../utils.js'
import { pageSelectors, ulrs } from '../constants.js'
import config from '../config.js'
import { saveBrowserSession } from './browser.js'


export default class TownsClient {
    register = async (
        emailClient,
        browserData,
        userData,
        fetchWalletAddress = true,
        retryCount = config.RETRIES_COUNT
    ) => {
        try {
            const { browser, context } = browserData
            const { id, email_username, email_password } = userData

            const page = await context.newPage()
            await page.goto(ulrs.townsHomePage)

            await clickForSelector(page, pageSelectors.loginBtnSelector)
            await clickForSelector(page, pageSelectors.loginMoreOptionsSelector)
            await clickForSelector(page, pageSelectors.loginEmailSelector)
            
            await emailClient.clearEmail(email_username, email_password)

            const inputEmailSelector = await page.$(pageSelectors.inputEmailSelector)
            if (inputEmailSelector) {
                await inputEmailSelector.fill(email_username)
                consola.info('Requested email code')
            } else {
                consola.error('Cant find email input')
                throw new Error('Cant find email input')
            }

            await clickForSelector(page, pageSelectors.submitEmailBtnSelector)

            await page.click('input')
            const emailCode = await emailClient.getEmail(email_username, email_password)
            
            if(!emailCode) {
                consola.error('Cant get email code')
                throw new Error('Cant get email code')
            }

            for (const char of emailCode) {
                await page.keyboard.press(char)
            }

            consola.success(`Submitted email code (${emailCode})`)
    
    
            consola.start('Waiting for profile creation...')
            while (true) {
                const locator = page.locator('text=Explore towns')
                if ((await locator.isVisible()) == false) {
                    await sleep(1, 1, true)
                } else {
                    break
                }
            }

            consola.success('Profile created')

            let wallet_address = '0x0'
            if (fetchWalletAddress) {
                wallet_address = await this.getProfileWalletAddress(browserData)
                consola.success(`Got wallet address: ${wallet_address}`)
            }

            await saveBrowserSession(context, `./data/sessions/${id}-session.json`)

            return [true, wallet_address]
        } catch (e) {
            consola.error(e.message)

            if (retryCount <= 0) {
                return [false, '0x0']
            } else {
                consola.warn('Retrying...')
                return await this.register(
                    emailClient,
                    browserData,
                    userData,
                    fetchWalletAddress,
                    retryCount - 1
                )
            }
        }
    }

    getProfileWalletAddress = async (browserData) => {
        try {
            const { browser, context } = browserData

            const page = await context.newPage()
            await page.goto(ulrs.townsProfileInfoPage)

            consola.start('Fetching wallet address...')

            await clickForSelector(
                page,
                'xpath=/html/body/div/div[1]/div/div[2]/div[2]/div[3]/div/div[2]/div[2]/div/div/div[2]/div/div[1]/div[2]/div/div/div',
                1000 * 5 * 60
            )

            await page.waitForTimeout(1000)
            let clipboardText1 = await page.evaluate(
                'navigator.clipboard.readText()'
            )
            consola.success('Got wallet address')
            return clipboardText1
        } catch (e) {
            console.log(e)
            return false
        }
    }

    tapBober = async (browserData, retryCount = config.RETRIES_COUNT) => {
        try {
            const { browser, context } = browserData

            const page = await context.newPage()
            await page.goto(ulrs.townsHomePage)

            while (true) {
                const locator = page.locator('text=Explore towns')
                if ((await locator.isVisible()) == false) {
                    await sleep(1, 1, true)
                } else {
                    break
                }
            }

            consola.info('Opened page')

            await page.getByAltText('Towns Points').click()
            await page.waitForSelector(
                'xpath=/html/body/div/div[1]/div/div[2]/div[2]/div[3]/div/div[2]/div[2]/div/div/div[2]/div[1]/canvas',
                { timeout: 500000 }
            )
            consola.info('Watching bober')
            const canvasBoundingBox = await page.evaluate(() => {
                const canvas = document.querySelector('canvas')
                return canvas.getBoundingClientRect()
            })

            const centerX = canvasBoundingBox.x + canvasBoundingBox.width / 2
            const centerY = canvasBoundingBox.y + canvasBoundingBox.height / 2

            await page.mouse.click(centerX, centerY)

            await page.waitForTimeout(3000)

            consola.info('Trying to pay')
            const locator = page.locator('text=tomorrow')
            if (await locator.isVisible()) {
                consola.info('Bober already tapped today')
                return true
            }

            await clickForSelector(
                page,
                'xpath=/html/body/div/div[5]/div/div[2]/div/div[3]/button'
            )
            if (
                await page.waitForSelector(
                    'xpath=/html/body/div/div[5]/div/div[2]/div/div[3]/span',
                    { timeout: 15000 }
                )
            ) {
                consola.error('Insufficient funds for tap')
                return false
            }

            consola.info('Tapped bober')

            return true
        } catch (e) {
            consola.error(e.message)

            if (retryCount <= 0) {
                return false
            } else {
                consola.warn('Retrying...')
                return await this.tapBober(browserData, retryCount - 1)
            }
        }
    }
}
