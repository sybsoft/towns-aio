import XLSX from 'xlsx'

import cliProgress from 'cli-progress'
import { consola } from 'consola'
import figlet from 'figlet'
import chalk from 'chalk'
import fs from 'fs'
import randomUseragent from 'random-useragent'
import config from './config.js'


export const printGreetingMessage = () => {
    console.log(
        chalk.green.bold(
            figlet.textSync('SYBILYCH', {
                font: 'Small Slant',
                horizontalLayout: 'default',
                verticalLayout: 'default',
                width: 80,
                whitespaceBreak: true
            })
        )
    )
}

export const clickForSelector = async (page, selector, timeout = 10000) => {
    await page.waitForSelector(selector, { timeout: timeout })
    const element = await page.$(selector)
    if (element) {
        await element.click()
    } else {
        consola.error('Element not found')
    }
}

export const sleep = async (min, max, silent = false) => {
    const duration = Math.floor(Math.random() * (max - min + 1)) + min

    if (!silent) {
        consola.info(`Sleeping for ${duration} seconds`)
        const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect)
        bar.start(duration, 0)
        for (let i = 0; i < duration; i++) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            bar.update(i + 1)
        }
        bar.stop()
    } else {
        await new Promise((resolve) => setTimeout(resolve, duration * 1000))
    }
}

export const randomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export const shuffleArray = (array) => {
    if (config.SHUFFLE_ACCOUNTS === false) {
        return array
    }

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array
}

export const readFromTxt = (filePath) => {
    return fs
        .readFileSync(filePath, 'utf-8')
        .replace(/\r/g, '')
        .split('\n')
        .filter(Boolean)
}

export const readFromJson = (filePath) => {
    const jsonFile = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(jsonFile)
}

export function exportJson(data, destination, headers) {
    try {
        const workbook = XLSX.utils.book_new()
        const worksheetData = headers

        for (const [key, value] of Object.entries(data)) {
            worksheetData.push([key, value])
        }

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

        XLSX.writeFile(workbook, destination)
    } catch (error) {
        console.error(
            `Encountered an error while exporting db to Excel: ${error.message}`
        )
        process.exit(1)
    }
}

export const getRandomUserAgent = () => {
    return randomUseragent.getRandom(function (ua) {
        return ua.browserName === 'Chrome';
    })
}