import { Cache as BaseCache } from 'memory-cache'
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { dirname, resolve } from 'path';
import { container } from './Container';
import { ensureDirSync } from 'fs-extra';

/**
 * Extended Cache class from 'memory-cache'.
 * Adds saving and loading to filesystem as JSON string.
 */
export class Cache extends BaseCache<string, any> {
    cacheFilePath: string = resolve(homedir(), '.jira-syncer/cache.json')

    public has(key: string) {
        return this.keys().includes(key);
    }

    public save() {
        ensureDirSync(dirname(this.cacheFilePath))
        writeFileSync(this.cacheFilePath, this[ 'exportJson' ](), 'utf8')
    }

    public load() {
        if ( existsSync(this.cacheFilePath) ) {//}, constants.W_OK | constants.R_OK) ) {
            this[ 'importJson' ](readFileSync(this.cacheFilePath, 'utf8'))
        }
    }
}

container.bind(Cache).toConstantValue(new Cache)