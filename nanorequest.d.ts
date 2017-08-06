/// <reference types="node" />

import * as url from 'url'
import * as http from 'http'
import * as EventEmitter from 'events'

declare namespace nanorequest {
  interface options extends url.UrlObject {
    url?: string
  }
}

declare function nanorequest(options:nanorequest.options, cb:(err: Error, res: http.ClientResponse, body: any) => void): EventEmitter

export = nanorequest