import { search } from '../modules/web'

import type Song from '../api/Song'
import type Listener from './Listener'

export type events = 'save' | 'ready'

export interface CacheOptions {
  proxy_url: string
  cache_path?: string
  detailed_log?: boolean
}

export default class SongCache {
  public songs: Song[] = []
  private listeners: Listener<events, null>[] = []
  protected path: string | undefined
  protected proxy_url: string
  protected detailed_log = false
  protected is_ready = false

  public constructor(options: CacheOptions) {
    this.path = options.cache_path
    this.proxy_url = options.proxy_url
    this.detailed_log = options.detailed_log ?? false

    this.load()
      .then(() => this.save())
      .then(() => this.checkForNew())
      .then(status => {
        if (!status)
          window.addEventListener('online', () => this.checkForNew())
        this.is_ready = true
        this.triggerEvent('ready')
      })
      .catch(console.error)
  }

  private async load() {
    if (this.path == undefined || this.path.trim() == '') return
    const rawSongs = localStorage.getItem(this.path)
    if (rawSongs) this.songs = JSON.parse(rawSongs)
  }

  public async save() {
    if (this.path == undefined || this.path.trim() == '') return
    localStorage.setItem(this.path, JSON.stringify(this.songs))
    this.triggerEvent('save')
  }

  private triggerEvent(event: events) {
    this.listeners
      .filter(({ name }) => name == event)
      .forEach(({ cb }) => cb(null))
  }

  public addEventListener(event: events, cb: (e: null) => void) {
    this.listeners.push({
      name: event,
      cb
    })
  }

  public removeEventListener(event: events, cb: (e: null) => void) {
    const index = this.listeners.findIndex(l => l.cb == cb && l.name == event)
    this.listeners.splice(index, 1)
  }

  public isReady() {
    return this.is_ready
  }

  private addSongs(...songs: Song[]) {
    this.songs = [...songs, ...this.songs]
    this.save()
  }

  private sortByDate() {
    this.songs = this.songs.sort((s1, s2) => {
      const d1 = new Date(s1.date)
      const d2 = new Date(s2.date)
      return d1.getMilliseconds() - d2.getMilliseconds()
    })
    this.save()
  }

  public async checkForNew() {
    if (!navigator.onLine) return false
    var cp = 1
    const appendCache: Song[] = []
    while (true) {
      const songs = await search(this.proxy_url, {}, cp)
      const newSongs = songs.filter(
        song => !this.songs.find(s => s.songUrl == song.songUrl)
      )
      if (this.detailed_log)
        console.log(
          `added ${
            newSongs.length
          } new songs of page ${cp} | song names: [${newSongs
            .map(s => s.name)
            .join(', ')}]`
        )
      appendCache.push(...newSongs)
      if (newSongs.length == 0) break
      cp++
    }
    this.addSongs(...appendCache)
    if (this.detailed_log) console.log(`finished refreshing song list`)
    this.sortByDate()
    return true
  }
}
