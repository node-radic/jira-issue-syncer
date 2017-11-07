import { interfaces } from 'inversify';
import { Response as BaseResponse } from 'superagent';
import { AuthBasic } from 'github';
import Newable = interfaces.Newable;

export { Newable, AuthBasic }

export interface Thenable<T> {
    then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;

    then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
}

export interface Response<T=any> extends BaseResponse {
    body: T
}

export type SyncerType = 'github' | 'bitbucket'

export interface ISyncerConfig {
    type: SyncerType,
    remote: IRemoteConfig,
    project?: {
        owner: string,
        repo: string
    },
    userMap?: { [jiraName: string]: string }
}

export interface ISyncerConstructor {
    new (config: ISyncerConfig): ISyncer

    getType(): SyncerType
}

export interface ISyncer {
    syncIssues(): Promise<any>
}


export interface IRemoteConfig {
    auth: AuthBasic,
    url: string
}

export interface IJiraConfig {
    project: string,
    remote: IRemoteConfig
}

export interface IProjectConfig {
    jira: IJiraConfig,
    syncers: ISyncerConfig[]
}
