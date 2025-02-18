import fs from 'fs'
import toml from 'toml'
import path from 'path'
import { fileURLToPath } from 'url'

function parseConfig(configFileName = 'config.toml') {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const rootPath = path.resolve(__dirname, '..')
    const configPath = path.join(rootPath, configFileName)
    
    const configContent = fs.readFileSync(configPath, 'utf8')
    return toml.parse(configContent)
}

export default parseConfig()
