import { container } from './Container';
import { merge } from 'lodash';
import * as request from 'superagent';
import { join } from 'path';
import { URL } from 'url';
import { FullProject, IJiraConfig, Issue, Priority, Resolution, Response } from './interfaces';
import { parallel, resolve } from './functions';
import { isString } from 'util';

export type JiraIssuePickerOptionsType = string | JiraIssuePickerOptions

export interface JiraIssuePickerOptions {
    query?: string,
    currentJQL?: string,
    currentIssueKey?: string,
    currentProjectId?: string,
    showSubTasks?: boolean,
    showSubTaskParent?: boolean
}

export interface JiraIssuePickerResponse {
    sections: Array<{
        label: string,
        sub: string,
        id: string,
        issues: Array<{
            key: string,
            keyHtml?: string,
            img?: string,
            summary?: string,
            summaryText?: string,
        }>
    }>
}

/**
 * Jira API Client & Wrapper
 * Is configured by the JSON config file
 */
export class Jira {
    protected data: {
        projects: { [key: string]: FullProject },
        priorities: Priority[],
        resolutions: Resolution[],
        issues: { [id: string]: Issue }
    }

    public requestOptions: { set?: any }

    public constructor(protected jiraConfig: IJiraConfig) {
        this.requestOptions = {
            set: {
                Accept             : 'application/json',
                'X-Atlassian-Token': 'no-check'
            }
        }
        this.data           = {
            projects   : {},
            priorities : [],
            resolutions: [],
            issues     : {}
        }
    }

    protected url(endpoint: string): URL {
        let url: URL = new URL(join(this.jiraConfig.remote.url, '2', endpoint));
        url.username = this.jiraConfig.remote.auth.username;
        url.password = this.jiraConfig.remote.auth.password;
        return url
    }

    public request<T =request.SuperAgentRequest>(method, uri: string): T {
        let url = this.url(uri);
        return <any> request(method.toUpperCase(), url.toString())
            .set(this.requestOptions.set)
    }

    public async getProject(key: string): Promise<FullProject> {
        if ( this.data.projects[ key ] !== undefined ) {
            return resolve(this.data.projects[ key ])
        }

        let project: FullProject  = await parallel({
            project : () => this.request('GET', `/project/${key.toUpperCase()}`),
            statuses: () => this.request('GET', `/project/${key.toUpperCase()}/statuses`),
            meta    : () => this.request('GET', `/issue/createmeta/`).query({ projectKeys: key.toUpperCase(), expand: 'projects.issuetypes.fields' })
        }).then((res: { [key: string]: Response }) => {
            return resolve(merge({}, res.project.body, {
                statuses: res.statuses.body
            }))
        })
        this.data.projects[ key ] = project;
        return resolve(project);
    }

    public async picker(queryOrOptions: JiraIssuePickerOptionsType): Promise<Response<JiraIssuePickerResponse>> {
        if ( isString(queryOrOptions) ) queryOrOptions = { query: queryOrOptions }
        return <any> await this.request('GET', '/issue/picker').query(queryOrOptions)
    }


    public async getIssues(): Promise<Issue[]> {
        let res                       = await this.picker('project = ' + this.jiraConfig.project.toUpperCase());
        let issues: Promise<Issue> [] = []; // keys
        res.body.sections.forEach(section => section.issues.forEach(issue => issues.push(this.getIssue(issue.key))));
        return resolve(<Issue[]> await parallel(issues));
    }

    public async getIssue(id: string): Promise<Issue> {
        let res = await this.request<Response<Issue>>('GET', `/issue/${id}`)
        return resolve(res.body)
    }
}


// container.bind<JiraConstructor>('JiraConstructor').toConstructor(Jira);

export function createJira(auth: IJiraConfig): Jira {
    let jira = new Jira(auth);
    container.bind(Jira).toConstantValue(jira);
    return jira
}