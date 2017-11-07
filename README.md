# Jira Issue Syncer
[WIP] 2-way sync between Jira issues and Github, BitBucket and/or your custom providers


## CLI Usage
```
Usage: jira-syncer <command> [options]

Commands:
    Todo...
```

## API Usage
```typescript
import {container,IO,Jira,Syncers} from "./src" //"@radic/jira-issue-syncer"
const io:IO             = container.get(IO)
io.write('{bold} Todo... {/bold}')
```