# @NoCopyrightSounds API/web

This is the browser client for my [NoCopyrightSounds-API server](https://github.com/KaninchenSpeed/NoCopyrightSounds-API-server)

The usage is very similar to the [nodejs version](https://github.com/KaninchenSpeed/NoCopyrightSounds-API)

## Import

```ts
import * as ncs from '@nocopyrightsounds-api/web'
```

## Examples

### Get all songs from the first page in the music library
```ts
import * as ncs from '@nocopyrightsounds-api/web'

ncs
    .getMusic(/*add your proxy url here (use the NoCopyrightSounds-API-server found on npm)*/, /*page here*/)
    .then(songs => {
        //use the songs here
        console.log(songs)
    })
    .catch(err => {
        //error handeling here
        console.error(err)
    })
```

### Using the client class

```ts
import * as ncs from '@nocopyrightsounds-api/web'

const client = new ncs.Client({
  proxy_url: /*add your proxy url here (use the NoCopyrightSounds-API-server found on npm)*/
})
```