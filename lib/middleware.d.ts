import { Config } from './config.js';
export declare function setRequestID(): (req: any, res: any, next: any) => void;
export declare function logger(_config: Config): any;
export declare function blacklistIPs(config: Config): any;
export declare function rateLimit(_config: Config): any;
export declare function handleErrors(): (err: any, req: any, res: any, next: any) => void;
declare const _default: {
    setRequestID: typeof setRequestID;
    logger: typeof logger;
    blacklistIPs: typeof blacklistIPs;
    rateLimit: typeof rateLimit;
    handleErrors: typeof handleErrors;
};
export default _default;
