export interface GithubResponse<T> {
    data: T
    meta: GithubMeta
}

export interface GithubMeta {
    'etag': string
    'last-modified'?: string
    'status': string
    'x-github-media-type': string
    'x-github-request-id': string
    'x-ratelimit-limit': string
    'x-ratelimit-remaining': string
    'x-ratelimit-reset': string
}

export type GithubIssueEventName =
    /**     The issue was closed by the actor. When the commit_id is present, it identifies the commit that closed the issue using "closes / fixes #NN" syntax. */
    'closed' |
    /**     The issue was reopened by the actor. */
    'reopened' |
    /**     The actor subscribed to receive notifications for an issue. */
    'subscribed' |
    /**     The issue was merged by the actor. The `commit_id` attribute is the SHA1 of the HEAD commit that was merged. */
    'merged' |
    /**     The issue was referenced from a commit message. The `commit_id` attribute is the commit SHA1 of where that happened. */
    'referenced' |
    /**     The actor was @mentioned in an issue body. */
    'mentioned' |
    /**     The issue was assigned to the actor. */
    'assigned' |
    /**     The actor was unassigned from the issue. */
    'unassigned' |
    /**     A label was added to the issue. */
    'labeled' |
    /**     A label was removed from the issue. */
    'unlabeled' |
    /**     The issue was added to a milestone. */
    'milestoned' |
    /**     The issue was removed from a milestone. */
    'demilestoned' |
    /**     The issue title was changed. */
    'renamed' |
    /**     The issue was locked by the actor. */
    'locked' |
    /**     The issue was unlocked by the actor. */
    'unlocked' |
    /**     The pull request's branch was deleted. */
    'head_ref_deleted' |
    /**     The pull request's branch was restored. */
    'head_ref_restored' |
    /**     The actor dismissed a review from the pull request. */
    'review_dismissed' |
    /**     The actor requested review from the subject on this pull request. */
    'review_requested' |
    /**     The actor removed the review request for the subject on this pull request. */
    'review_request_removed' |
    /**     A user with write permissions marked an issue as a duplicate of another issue or a pull request as a duplicate of another pull request. */
    'marked_as_duplicate' |
    /**     An issue that a user had previously marked as a duplicate of another issue is no longer considered a duplicate, or a pull request that a user had previously marked as a duplicate of another pull request is no longer considered a duplicate. */
    'unmarked_as_duplicate' |
    /**     The issue was added to a project board. */
    'added_to_project' |
    /**     The issue was moved between columns in a project board. */
    'moved_columns_in_project' |
    /**     The issue was removed from a project board. */
    'removed_from_project' |
    /**     The issue was created by converting a note in a project board to an issue. */
    'converted_note_to_issue';

export interface GithubBaseEvent {}

export interface GithubIssueEvent extends GithubBaseEvent {
    /**     The Integer ID of the event. */
    id: string
    /**     The API URL for fetching the event. */
    url: string
    /**     The User object that generated the event. */
    actor: string
    /**     The String SHA of a commit that referenced this Issue */
    commit_id: string
    /**     The GitHub API link to a commit that referenced this Issue */
    commit_url: string
    /**     Identifies the actual type of Event that occurred. */
    event: GithubIssueEventName
    /**     The timestamp indicating when the event occurred. */
    created_at: string
    /**     The Label object including `name` and `color` attributes. Only provided for `labeled` and `unlabeled` events. */
    label: string
    /**     The User object which was assigned to (or unassigned from) this Issue. Only provided for 'assigned' and 'unassigned' events. */
    assignee: string
    /**     The User object that performed the assignment (or unassignment) for this Issue. Only provided for 'assigned' and 'unassigned' events. */
    assigner: string
    /**     The User who requested a review. Only provided for 'review_requested' and 'review_request_removed' events. */
    review_requester: string
    /**     The Users whose reviews were requested. Only provided for 'review_requested' and 'review_request_removed' events. */
    requested_reviewers: string
    /**     A dismissed_review object that includes the `review_id`, `state`, and `dismissal_message`. Only provided for 'dismissed_review' events. */
    dismissed_review: string
    /**     The Milestone object including a `title` attribute. Only provided for `milestoned` and `demilestoned` events. */
    milestone: string
    /**     An object containing rename details including `from` and `to` attributes. Only provided for `renamed` events. */
    rename: string
}

export interface GithubRepositoryEvent extends GithubIssueEvent {
    issue: GithubIssue
}

export interface GithubWebhookEventType {
    issue_comment: GithubIssueCommentEvent
}

export interface GithubWebhookEvent<T extends GithubBaseEvent> {
    'type': 'Event',
    'public': true,
    'payload': T,
    'repo': {
        'id': 3,
        'name': 'octocat/Hello-World',
        'url': 'https://api.github.com/repos/octocat/Hello-World'
    },
    'actor': {
        'id': 1,
        'login': 'octocat',
        'gravatar_id': '',
        'avatar_url': 'https://github.com/images/error/octocat_happy.gif',
        'url': 'https://api.github.com/users/octocat'
    },
    'org': {
        'id': 1,
        'login': 'github',
        'gravatar_id': '',
        'url': 'https://api.github.com/orgs/github',
        'avatar_url': 'https://github.com/images/error/octocat_happy.gif'
    },
    'created_at': '2011-09-06T17:26:27Z',
    'id': '12345'
}

export type GithubWebhookPayload<T extends GithubWebhookEventType, K extends keyof T> = GithubWebhookEvent<Pick<T,K>>

// let a:GithubWebhookEvent<GithubIssueCommentEvent>
// a.payload.

export interface GithubCommitCommentEvent extends GithubBaseEvent {}

export interface GithubCreateEvent extends GithubBaseEvent {}

export interface GithubDeleteEvent extends GithubBaseEvent {}

export interface GithubDeploymentEvent extends GithubBaseEvent {}

export interface GithubDeploymentStatusEvent extends GithubBaseEvent {}

export interface GithubDownloadEvent extends GithubBaseEvent {}

export interface GithubFollowEvent extends GithubBaseEvent {}

export interface GithubForkEvent extends GithubBaseEvent {}

export interface GithubForkApplyEvent extends GithubBaseEvent {}

export interface GithubGistEvent extends GithubBaseEvent {}

export interface GithubGollumEvent extends GithubBaseEvent {}

export interface GithubInstallationEvent extends GithubBaseEvent {}

export interface GithubInstallationRepositoriesEvent extends GithubBaseEvent {}

export interface GithubIssueCommentEvent extends GithubBaseEvent {
    action: 'created' | 'edited' | 'deleted'
    // The changes to the issue if the action was "edited".
    changes?: {
        body: {
            from: string
        }
    }
    issue: GithubIssue
    comment: GithubComment
}

export interface GithubIssuesEvent extends GithubBaseEvent {
    action: 'assigned' | 'unassigned' | 'labeled' | 'unlabeled' | 'opened' | 'edited' | 'milestoned' | 'demilestoned' | 'closed' | 'reopened'
    issue: GithubIssue
    // The changes to the issue if the action was "edited".
    changes?: {
        title: {
            from: string
        }
        body: {
            from: string
        }
    }
    assignee: GithubUser
    /** The optional label that was added or removed from the issue. **/
    label?: GithubLabel
}

export interface GithubLabelEvent extends GithubBaseEvent {}

export interface GithubMarketplacePurchaseEvent extends GithubBaseEvent {}

export interface GithubMemberEvent extends GithubBaseEvent {}

export interface GithubMembershipEvent extends GithubBaseEvent {}

export interface GithubMilestoneEvent extends GithubBaseEvent {}

export interface GithubOrganizationEvent extends GithubBaseEvent {}

export interface GithubOrgBlockEvent extends GithubBaseEvent {}

export interface GithubPageBuildEvent extends GithubBaseEvent {}

export interface GithubProjectCardEvent extends GithubBaseEvent {}

export interface GithubProjectColumnEvent extends GithubBaseEvent {}

export interface GithubProjectEvent extends GithubBaseEvent {}

export interface GithubPublicEvent extends GithubBaseEvent {}

export interface GithubPullRequestEvent extends GithubBaseEvent {}

export interface GithubPullRequestReviewEvent extends GithubBaseEvent {}

export interface GithubPullRequestReviewCommentEvent extends GithubBaseEvent {}

export interface GithubPushEvent extends GithubBaseEvent {}

export interface GithubReleaseEvent extends GithubBaseEvent {}

// export interface GithubRepositoryEvent extends GithubBaseEvent {}
export interface GithubStatusEvent extends GithubBaseEvent {}

export interface GithubTeamEvent extends GithubBaseEvent {}

export interface GithubTeamAddEvent extends GithubBaseEvent {}

export interface GithubWatchEvent extends GithubBaseEvent {}


export interface GithubComment {
    id: number
    url: string
    html_url: string
    body: string
    created_at: string
    updated_at: string
    user: GithubUser
}

export interface GithubProject {
    id: number
    number: number
    creator: GithubUser
    owner_url: string
    url: string
    html_url: string
    columns_url: string
    name: string
    body: string
    state: string
    created_at: string
    updated_at: string
}

export interface GithubMilestone {
    id: number
    number: number
    open_issues: number
    closed_issues: number
    url: string
    html_url: string
    labels_url: string
    state: string
    title: string
    description: string
    created_at: string
    updated_at: string
    closed_at: string
    due_on: string
    creator: GithubUser,

}

export interface GithubUser {
    login: string
    id: number
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean

}

export interface GithubLabel {
    id: number,
    url: string
    name: string
    color: string
    default: boolean

}

export interface GithubIssue {
    'id': number,
    'number': number,
    url: string
    repository_url: string
    labels_url: string
    comments_url: string
    events_url: string
    html_url: string
    state: string
    title: string
    body: string
    user: GithubUser,
    labels: Array<GithubLabel>,
    assignee: GithubUser | null,
    assignees: Array<GithubUser>,
    milestone: GithubMilestone | null,
    locked: false,
    comments: number,
    pull_request: {
        url: string
        html_url: string
        diff_url: string
        patch_url: string
    },
    closed_at: null | string,
    created_at: null | string,
    updated_at: null | string,
    closed_by: GithubUser | null
}