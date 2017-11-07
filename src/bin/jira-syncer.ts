#!/usr/bin/env node
import { createJira, IProjectConfig, Syncers } from '../';
import { resolve } from 'path';
import { container } from '../lib/Container';
import { config } from 'dotenv';


config({
    path: resolve(__dirname, '../.env')
})
const projectConfig: IProjectConfig = require(resolve(__dirname, '../project.config.json'))
let pw                              = projectConfig.jira.remote.auth.password
if ( pw.startsWith('$') ) {
    projectConfig.jira.remote.auth.password = process.env[ pw.slice(1) ]
}
projectConfig.syncers = projectConfig.syncers.map(syncer => {
    let pw = syncer.remote.auth.password
    if ( pw.startsWith('$') ) {
        syncer.remote.auth.password = process.env[ pw.slice(1) ]
    }
    return syncer
})

let jira               = createJira(projectConfig.jira);
const syncers: Syncers = container.get<Syncers>(Syncers);
projectConfig.syncers.forEach(syncerConfig => {
    let syncer = syncers.createSyncer(syncerConfig.type, syncerConfig);
    syncer.syncIssues();
});