import { chromium } from 'playwright'
import { newInjectedContext } from 'fingerprint-injector'
import fs from 'fs'
import { consola } from 'consola'


export const getDefaultBrowserSession = async (headless = false, proxy, user_agent) => {
    const browser = await chromium.launch({
        headless: headless,
        permissions: ['clipboard-read']
    })

    const proxy_splitted = proxy.split('@')
    const [proxy_username, proxy_password] = proxy_splitted[0].split(':')
    const proxyHost = proxy_splitted[1]

    const context = await newInjectedContext(browser, {
        fingerprintOptions: {
            mockWebRTC: true
        },
        newContextOptions: {
            proxy: {
                server: proxyHost,
                username: proxy_username,
                password: proxy_password
            },
            userAgent: user_agent
        }
    },
)

    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    return { browser, context }
}

export const getAccountBrowserSession = async (
    account_id,
    headless = false,
    proxy,
    user_agent
) => {
    const browser = await chromium.launch({
        headless: headless,
        permissions: ['clipboard-read']
    })

    const proxy_splitted = proxy.split('@')
    const [proxy_username, proxy_password] = proxy_splitted[0].split(':')
    const proxyHost = proxy_splitted[1]

    const storage = JSON.parse(
        fs.readFileSync(`data/sessions/${account_id}-session.json`, 'utf8')
    )
    const restoredContext = await browser.newContext({
        storageState: storage,
        proxy: {
            server: proxyHost,
            username: proxy_username,
            password: proxy_password
        },
        userAgent: user_agent
    })

    await restoredContext.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false })
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en']
        })
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] })
        Object.defineProperty(navigator, 'hardwareConcurrency', {
            get: () => 4
        })
        Object.defineProperty(navigator, 'appVersion', {
            get: () => '5.0 (Windows)'
        })
    })

    await restoredContext.grantPermissions([
        'clipboard-read',
        'clipboard-write'
    ])

    const browserData = { browser, context: restoredContext }
    return browserData
}

export const saveBrowserSession = async (context, filePath) => {
    const storage = await context.storageState()

    fs.writeFileSync(filePath, JSON.stringify(storage))

    consola.success('Saved browser session')

    return true
}