/// <reference types="node" />
import http from 'http';
import { Url } from 'url';
interface NROpts extends http.RequestOptions {
    url?: string | Url;
    body?: any;
}
interface NRError extends Error {
    res?: http.IncomingMessage;
    body?: body;
}
declare type body = Buffer | string | {
    [key: string]: any;
};
declare type NRCB = (err: NRError | null, res: http.IncomingMessage, body: body) => void;
export declare function nanorequest(_opts: NROpts, cb?: NRCB): Promise<{
    res: http.IncomingMessage;
    body: body;
}> | http.ClientRequest;
export {};
