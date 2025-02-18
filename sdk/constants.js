import path from 'path';

export const pageSelectors = {
    loginBtnSelector:
        'xpath=/html/body/div/div[1]/div/div[2]/div/div/div/button/div[1]',
    loginMoreOptionsSelector:
        'xpath=/html/body/div[2]/div/div/div/div[2]/div/div/div/div/div[1]/div[3]/div/button[4]/div',
    loginEmailSelector:
        'xpath=/html/body/div[2]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div/div[4]/button',
    inputEmailSelector:
        'xpath=/html/body/div[2]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div/div[3]/div/label/input',
    submitEmailBtnSelector:
        'xpath=/html/body/div[2]/div/div/div/div[2]/div/div/div/div/div[1]/div[2]/div/div[3]/div/label/button/span[1]',
    toggleProfileInfoSidebarSelector:
        'xpath=/html/body/div[1]/div[1]/div/div[1]/div/div[4]/div[4]/div/div/div/div[1]',
    townsAddFundsButtonSelector:
        'xpath=/html/body/div/div[1]/div/div[3]/div[2]/div[3]/div/div[2]/div[2]/div/div/div[2]/div/div[2]/div/div/div[2]/div[2]/button',
    townsWalletAddressSelector:
        'xpath=/html/body/div/div[3]/div/div[2]/div/div/div/div[3]/div[2]/div[2]/div[1]/div[2]/button',
    townsWalletAddressTextSelector:
        'xpath=/html/body/div/div[3]/div/div[2]/div/div/div/div[3]/div[2]/div[2]/div[1]/div[2]/div',
    openBoberSelector:
        'xpath=/html/body/div/div[1]/div/div[2]/div/div[4]/div[1]/img',
    boberSelector:
        'xpath=/html/body/div/div[1]/div/div[3]/div[2]/div[3]/div/div[2]/div[2]/div/div/div[2]/div[1]/div[1]/div'
}

export const ulrs = {
    emailService: 'http://localhost:8000',
    townsHomePage: 'https://app.towns.com',
    townsProfileInfoPage:
        'https://app.towns.com/?panel=profile&stackId=main&profileId=me'
}

export const EMAILS_FILE_PATH = 'data/emails.txt'
export const USERNAMES_FILE_PATH = 'data/usernames.txt'
export const PROXIES_FILE_PATH = 'data/proxies.txt'

export const EVM_CONNECT_WALLETS_PRIVATE_KEYS_FILE_PATH =
    'data/evm_connect_wallets_private_keys.txt'
    
export const DB_FILE_PATH = 'data/database.json'
export const TOWNS_DATABASE_FILE_PATH = 'data/towns_database.json'

export const EXPORT_TOWNS_WALLETS_FILE_PATH = 'data/export/accounts.xlsx'
export const EXPORT_TOWNS_STATS_FILE_PATH = 'data/export/stats.xlsx'

export const SESSIONS_DIR_PATH = path.resolve(process.cwd(), 'data', 'sessions')
export const EXPORT_DIR_PATH = path.resolve(process.cwd(), 'data', 'export')


const optionsList = [
    {
        primary: 'Create database',
        description: 'Создать базу данных',
        value: '01'
    },
    {
        primary: 'Registration',
        description: 'Регистрация аккаунтов',
        value: '02'
    },
    {
        primary: 'Fetch Towns Wallet Addresses',
        description: 'Выгрузить адреса кошельков из Towns',
        value: '03'
    },
    { primary: 'Tap Bober', description: 'Тапать бобра', value: '04' },
    { primary: 'Relogin', description: 'Обновить сессию', value: '05' },
    {
        primary: 'Export towns wallets',
        description: 'Экспорт кошельков в CSV',
        value: '06'
    },
    {
        primary: 'Stats report',
        description: 'Экспорт статистики аккаунтов в CSV',
        value: '07'
    },
    {
        primary: 'Seed database',
        description: 'Обновить базу данных',
        value: '08'
    }
]

const maxPrimaryLength =
    Math.max(...optionsList.map((o) => o.primary.length)) + 1

export const promptOptions = optionsList.map((option) => ({
    label:
        option.primary.padEnd(maxPrimaryLength, ' ') +
        ' ( ' +
        option.description +
        ' ) ',
    value: option.value
}))