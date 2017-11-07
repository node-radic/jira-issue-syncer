import * as debug from 'debug';
import { ISyncer, ISyncerConfig, Jira, lazyInject, SyncerType } from '../';

import { resolve } from '../functions';
import { GithubIssue, GithubLabel, GithubMilestone, GithubRepositoryEvent, GithubResponse } from '../interfaces/api.github';
import { Github } from './Github';
import { Issue } from '../interfaces/api.jira';


const log = debug('syncer:github')

export class GithubSyncer implements ISyncer {
    static getType = (): SyncerType => 'github'

    @lazyInject(Jira)
    jira: Jira

    gh: Github

    protected cache: {
        milestones: GithubMilestone[],
        labels: GithubLabel[]
        issues: GithubIssue[]
        events: GithubRepositoryEvent[]
    }

    constructor(public config: ISyncerConfig) {
        this.cache = { milestones: [], labels: [], issues: [], events: [] }
        this.gh    = new Github({
            cache  : true,
            debug  : true,
            timeout: 5000,
            host   : this.config.remote.url,

            headers: {
                'accept'    : 'application/vnd.github.something-custom',
                'cookie'    : 'something custom',
                'user-agent': 'Jira-Syncer'
            }
        })

        this.gh.authenticate(this.config.remote.auth);


    }

    protected async getIssues(): Promise<GithubIssue[]> {
        let owner = this.config.project.owner,
            repo  = this.config.project.repo;

        let milestones: GithubResponse<GithubMilestone[]>   = await this.gh.issues.getMilestones({ owner, repo })
        let labels: GithubResponse<GithubLabel[]>           = await this.gh.issues.getLabels({ owner, repo })
        let issues: GithubResponse<GithubIssue[]>           = await this.gh.issues.getForRepo({ owner, repo, state: 'all', per_page: 999 })
        let events: GithubResponse<GithubRepositoryEvent[]> = await this.gh.activity.getEventsForRepo({ owner, repo })
        this.cache.events                                   = events.data
        this.cache.milestones                               = milestones.data
        this.cache.labels                                   = labels.data

        return resolve(issues.data)

    }

    public async syncIssues(): Promise<any> {
        const jir = new JiraIssueCollection(await this.jira.getIssues(), this.jira)
        const git = GithubIssueCollection.from(await this.getIssues());

        // sync to github
        // ji.forEach(issue => {
        // })
        // sync to jira
        git.forEach(issue => {

        })


        return resolve()
    }

}

export interface JiraIssue {

}

export class GithubIssueCollection extends Array {
    constructor(public data: GithubIssue,
                protected syncer: GithubSyncer,
                protected jira: Jira) {
        super()
    }

    jiraHasIssue(): boolean {
        return
    }
}

export class JiraIssueCollection extends Array {
    constructor(public issues: Issue[],
                protected jira: Jira) {
        super()
        JiraIssueCollection.from(issues)
    }
}

