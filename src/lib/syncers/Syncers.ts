import { ISyncer, ISyncerConfig, ISyncerConstructor, SyncerType } from '../interfaces';
import { GithubSyncer } from './GithubSyncer';
import { singleton } from '../Container';

@singleton(Syncers)
export class Syncers {
    syncers: ISyncerConstructor[] = [
        GithubSyncer
    ]
    getSyncer              = (type: SyncerType): ISyncerConstructor => this.syncers.filter(syncer => syncer.getType() === type)[ 0 ]
    hasSyncer              = (type: SyncerType): boolean => this.getSyncer(type) !== undefined

    createSyncer(type: SyncerType, config: ISyncerConfig): ISyncer {
        if ( ! this.hasSyncer(type) ) {
            throw new Error(`syncer [${type}] does not exist`);
        }
        const Syncer: ISyncerConstructor = this.getSyncer(type);
        return new Syncer(config);
    }
}
