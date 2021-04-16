import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { exit } from 'process';
import nearProvider from 'near-web3-provider';
import { validateEIP712, encodeMetaCall } from './eip-712-helpers.js';
import { keccakFromHexString } from 'ethereumjs-util';
import { Engine, formatU256 } from '@aurora-is-near/engine';

interface NearProvider {
    networkId: string;
    evm_contract: string;
    isReadOnly: boolean;
    url: string;
    version: string;
    nearProvider: any;
    keyStore: any;
    signer: any;
    connection: any;
    accountId: string;
    account: any;
    accountEvmAddress: string;
    accounts: Map<string, any>;
    walletUrl: string;
    explorerUrl: string;
}

abstract class CodedError extends Error {
    constructor(public readonly code: number, message: string) {
        super(message);
        Object.setPrototypeOf(this, CodedError.prototype);
    }
}

class UnsupportedMethod extends CodedError {
    constructor(method: string) {
        super(-32601, `Unsupported method: ${method}`);
        Object.setPrototypeOf(this, UnsupportedMethod.prototype);
    }
}

class UnimplementedMethod extends CodedError {
    constructor(method: string) {
        super(-32601, `Unimplemented method: ${method}`);
        Object.setPrototypeOf(this, UnimplementedMethod.prototype);
    }
}

class MissingArgument extends CodedError {
    constructor(index: number, message?: string) {
        super(-32602, message || `missing value for required argument ${index}`);
        Object.setPrototypeOf(this, MissingArgument.prototype);
    }
}

class TooManyArguments extends CodedError {
    constructor(maxCount: number) {
        super(-32602, `too many arguments, want at most ${maxCount}`);
        Object.setPrototypeOf(this, TooManyArguments.prototype);
    }
}

class InvalidArguments extends CodedError {
    constructor() {
        super(-32602, `Invalid method parameter(s).`);
        Object.setPrototypeOf(this, InvalidArguments.prototype);
    }
}

function response(id: string, result: any, error: any) {
    const resp = { jsonrpc: '2.0', id };
    if (error) {
        Object.assign(resp, { error });
    } else {
        Object.assign(resp, { result });
    }
    return resp;
}

function errorCode(error: Error) {
    if (error instanceof CodedError) {
        return error.code;
    }
    return -32000;
}

export function createApp(argv: any, provider: NearProvider) {
    const app = express()
    app.use(bodyParser.json({ type: 'application/json' }));
    app.use(cors());

    app.post('/', async (req, res) => {
        res.header('Content-Type', 'application/json');
        const data = req.body;
        // TODO: validate data input is correct JSON RPC.
        try {
            const result = await routeRPC(provider, data.method, data.params);
            if (argv.noisy) {
                console.log(data, req.params);
                console.log(result);
            }
            res.send(response(data.id, result, null));
        } catch (error) {
            if (argv.failHard || argv.noisy) {
                console.error(data, req.params);
                console.error(data, error);
            }
            if (argv.failHard) {
                exit(0);
            }
            res.send(response(data.id, null, {
                code: errorCode(error),
                message: error.message,
            }));
        }
    });

    app.post('/relay', async (req, res) => {
        res.header('Content-Type', 'application/json');
        const data = req.body;
        if (!data.data || !data.signature || !validateEIP712(data.data, data.signature)) {
            res.send({ code: -32000, message: "Signature is invalid for given message" });
            return;
        }
        try {
            const result = await nearProvider.utils.rawFunctionCall(
                provider.account,
                provider.evm_contract,
                'meta_call',
                encodeMetaCall(data.data, data.signature),
                '10000000000000',
                '0'
            );
            if (argv.noisy) {
                console.log(data.data, data.signature);
                console.log(result);
            }
            res.send(response(data.id, result, null));
        } catch (error) {
            res.send(response(data.id, null, {
                code: -32000,
                message: error.message,
            }));
        }
    });

    return app;
}

function unsupported(method: string) {
    throw new UnsupportedMethod(method);
}

function unimplemented(method: string) {
    throw new UnimplementedMethod(method);
}

export async function routeRPC(provider: NearProvider, method: string, params: any[]): Promise<any> {
    const engine = await Engine.connect({});
    //console.log(method, params); // DEBUG
    switch (method) {
        // web3_*
        case 'web3_clientVersion': {
            if (params.length > 0) throw new TooManyArguments(0);
            return 'Aurora-Relayer/0.0.0'; // TODO
        }
        case 'web3_sha3': {
            if (params.length < 1) throw new MissingArgument(0);
            if (params.length > 1) throw new TooManyArguments(1);
            return `0x${Buffer.from(keccakFromHexString(params[0])).toString('hex')}`;
        }

        // net_*
        case 'net_listening': return true;
        case 'net_peerCount': return '0x0';
        case 'net_version': {
            const chainID = (await engine.getChainID()).unwrap();
            return `0x${chainID.toString(16)}`;
        }

        // eth_*
        case 'eth_accounts': break; // TODO
        case 'eth_blockNumber': {
            const height = (await engine.getBlockHeight()).unwrap();
            return `0x${height.toString(16)}`;
        }
        case 'eth_call': break; // TODO
        case 'eth_chainId': { // EIP-695
            const chainID = (await engine.getChainID()).unwrap();
            return `0x${chainID.toString(16)}`;
        }
        case 'eth_coinbase': {
            return (await engine.getCoinbase()).unwrap();
        }
        case 'eth_compileLLL': return unsupported(method);
        case 'eth_compileSerpent': return unsupported(method);
        case 'eth_compileSolidity': return unsupported(method);
        case 'eth_estimateGas': break; // TODO
        case 'eth_gasPrice': return '0x0';
        case 'eth_getBalance': {
            if (params.length < 1) throw new MissingArgument(0);
            if (params.length > 2) throw new InvalidArguments();
            const balance = (await engine.getBalance(params[0])).unwrap();
            return `0x${balance.toString(16)}`;
        }
        case 'eth_getBlockByHash': break; // TODO
        case 'eth_getBlockByNumber': break; // TODO
        case 'eth_getBlockTransactionCountByHash': break; // TODO
        case 'eth_getBlockTransactionCountByNumber': break; // TODO
        case 'eth_getCode': {
            if (params.length < 1) throw new MissingArgument(0);
            if (params.length > 2) throw new InvalidArguments();
            const code = (await engine.getCode(params[0])).unwrap();
            return `0x${Buffer.from(code).toString('hex')}`;
        }
        case 'eth_getCompilers': return [];
        case 'eth_getFilterChanges': break; // TODO
        case 'eth_getFilterLogs': break; // TODO
        case 'eth_getLogs': break; // TODO
        case 'eth_getProof': break; // EIP-1186 TODO
        case 'eth_getStorageAt': {
            if (params.length < 1) throw new MissingArgument(0);
            if (params.length < 2) throw new MissingArgument(1);
            if (params.length > 3) throw new InvalidArguments();
            const result = (await engine.getStorageAt(params[0], params[1])).unwrap();
            return formatU256(result);
        }
        case 'eth_getTransactionByBlockHashAndIndex': break; // TODO
        case 'eth_getTransactionByBlockNumberAndIndex': break; // TODO
        case 'eth_getTransactionByHash': break; // TODO
        case 'eth_getTransactionCount': {
            if (params.length < 1) throw new MissingArgument(0, "cannot request transaction count without specifying address");
            if (params.length > 2) throw new InvalidArguments();
            const nonce = (await engine.getNonce(params[0])).unwrap();
            return `0x${nonce.toString(16)}`;
        }
        case 'eth_getTransactionReceipt': break; // TODO
        case 'eth_getUncleByBlockHashAndIndex': break; // TODO
        case 'eth_getUncleByBlockNumberAndIndex': break; // TODO
        case 'eth_getUncleCountByBlockHash': return '0x0';
        case 'eth_getUncleCountByBlockNumber': return '0x0';
        case 'eth_getWork': return unsupported(method);
        case 'eth_hashrate': return '0x0';
        case 'eth_mining': return false;
        case 'eth_newBlockFilter': return unimplemented(method); // TODO
        case 'eth_newFilter': return unimplemented(method); // TODO
        case 'eth_newPendingTransactionFilter': return unimplemented(method); // TODO
        case 'eth_pendingTransactions': return [];
        case 'eth_protocolVersion': return '0x41';
        case 'eth_sendRawTransaction': break; // TODO
        case 'eth_sendTransaction': break; // TODO
        case 'eth_sign': break; // TODO
        case 'eth_signTransaction': break; // TODO
        case 'eth_signTypedData': break; // EIP-712 TODO
        case 'eth_submitHashrate': return unsupported(method);
        case 'eth_submitWork': return unsupported(method);
        case 'eth_syncing': return false;
        case 'eth_uninstallFilter': return unimplemented(method);

        // near_*
        case 'near_retrieveNear': break;
        case 'near_transferNear': break;

        // *
        default: return unsupported(method);
    }
    return await (provider as any).routeRPC(method, params);
}
