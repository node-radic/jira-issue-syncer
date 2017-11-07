
export interface IPaginated {
    startAt: number
    maxResults: number
    total: number
}



export interface IExpand {
    expand: string
}

export interface IIcon {
    iconUrl: string
}

export interface IBase {
    self: string
    id: string
}

export interface INameBase extends IBase {
    name: string
}

export interface IKeyBase extends IBase {
    key: string
}

export interface IDescription {
    description: string
}

export interface IStatusColor {
    statusColor: string
}

export interface ISubTask {
    subtask: boolean
}

export interface IAvatarId {
    avatarId: number
}

export interface IStatusCategory {
    statusCategory: {
        self: string
        id: number
        key: string
        colorName: string
        name: string
    }
}

export interface IStatuses<T extends Status = Status> {
    statuses: Array<T>
}

export interface IUser {
    name: string
    key: string
    emailAddress: string
    avatarUrls: {
        '48x48': string
        '24x24': string
        '16x16': string
        '32x32': string
    },
    displayName: string
    active: boolean
    timeZone: string
}

export interface ITimeStamps {
    created: string
    updated: string
}

export interface IBody {
    body: string
}

export interface IFields<I extends IssueType = IssueType,
    C extends Component = Component,
    P extends Project = Project,
    V extends Version = Version,
    U extends User = User,
    PR extends Priority = Priority,
    S extends Status = Status,
    R extends Resolution = Resolution,
    L extends Label = Label> {
    issueType: I
    components: Array<C>
    project: P
    fixVersions: Array<V>
    creator: U
    reporter: U
    assignee: U
    priority: PR
    status: S
    resolution: R | null
    labels: string[]
    versions: Array<V>

    timespent: string
    timeoriginalestimate: string
    aggregatetimespent: string
    timetracking: any
    attachment: any[]
    aggregatetimeestimate: string
    resolutiondate: string
    workratio: number
    summary: string
    lastViewed: string
    subtasks: any[]
    aggregateprogress: {
        progress: number,
        total: number
    },
    environment: string
    timeestimate: string
    aggregatetimeoriginalestimate: string
    duedate: string,
    progress: {
        progress: number,
        total: number
    },
    comment: IPaginated & {
        comments: Comment[]
    },
    issuelinks: Array<{}>,
    votes: {
        self: string
        votes: number
        hasVoted: boolean
    },
    worklog: IPaginated & {
        worklogs: Array<{}>
    }
}

export interface IComment<U extends User = User> {
    author: U
    updateAuthor: U

}

export type IssueType = INameBase & IDescription & IIcon & ISubTask & IAvatarId
export type Priority = INameBase & IDescription & IIcon & IStatusColor
export type Resolution = INameBase & IDescription
export type Status = INameBase & IDescription & IIcon & IStatusCategory
export type ProjectStatus = INameBase & ISubTask & IStatuses
export type IssueFields = IFields & IDescription & ITimeStamps
export type Issue = IKeyBase & IExpand & { fields: IssueFields }
export type User = IKeyBase & IUser
export type Component = INameBase & IDescription
export type Version = INameBase & IDescription & { archived: boolean, released: boolean }
export type Comment = IKeyBase & ITimeStamps & IBody & IComment
export type Label = IKeyBase
export type Project = IKeyBase & IDescription & { lead: User }
export type FullProject = Project & {
    components: Component[]
    statuses: Status[]
    versions: Version[]
    issueTypes: IssueType[]
}
