import { SkeletonServer } from './skeleton.js';
import * as api from '../api.js';
import { BlockID } from '@aurora-is-near/engine';
export declare class EphemeralServer extends SkeletonServer {
    protected readonly filters: Map<number, Filter>;
    protected filterID: number;
    protected latestBlockID: BlockID;
    _init(): Promise<void>;
    eth_accounts(): Promise<api.Data[]>;
    eth_blockNumber(): Promise<api.Quantity>;
    eth_call(transaction: api.TransactionForCall, blockNumber?: api.Quantity | api.Tag): Promise<api.Data>;
    eth_chainId(): Promise<api.Quantity>;
    eth_coinbase(): Promise<api.Data>;
    eth_getBalance(address: api.Data, blockNumber?: api.Quantity | api.Tag): Promise<api.Quantity>;
    eth_getBlockByHash(blockHash: api.Data, fullObject?: boolean): Promise<api.BlockResult | null>;
    eth_getBlockByNumber(blockNumber: api.Quantity | api.Tag, fullObject?: boolean): Promise<api.BlockResult | null>;
    eth_getBlockTransactionCountByHash(blockHash: api.Data): Promise<api.Quantity | null>;
    eth_getBlockTransactionCountByNumber(blockNumber: api.Quantity | api.Tag): Promise<api.Quantity | null>;
    eth_getCode(address: api.Data, _blockNumber: api.Quantity | api.Tag): Promise<api.Data>;
    eth_getFilterChanges(filterID: api.Quantity): Promise<api.LogObject[]>;
    eth_getFilterLogs(filterID: api.Quantity): Promise<api.LogObject[]>;
    eth_getLogs(_filter: api.FilterOptions): Promise<api.LogObject[]>;
    eth_getStorageAt(address: api.Data, key: api.Quantity, blockNumber: api.Quantity | api.Tag): Promise<api.Data>;
    eth_getTransactionByBlockHashAndIndex(blockHash: api.Data, transactionIndex: api.Quantity): Promise<api.TransactionResult | null>;
    eth_getTransactionByBlockNumberAndIndex(blockNumber: api.Quantity | api.Tag, transactionIndex: api.Quantity): Promise<api.TransactionResult | null>;
    eth_getTransactionByHash(transactionHash: api.Data): Promise<api.TransactionResult | null>;
    eth_getTransactionCount(address: api.Data, _blockNumber: api.Quantity | api.Tag): Promise<api.Quantity>;
    eth_getTransactionReceipt(transactionHash: string): Promise<api.TransactionReceipt | null>;
    eth_getUncleCountByBlockHash(blockHash: api.Data): Promise<api.Quantity | null>;
    eth_getUncleCountByBlockNumber(blockNumber: api.Quantity | api.Tag): Promise<api.Quantity | null>;
    eth_newBlockFilter(): Promise<api.Quantity>;
    eth_newFilter(_filter: api.FilterOptions): Promise<api.Quantity>;
    eth_newPendingTransactionFilter(): Promise<api.Quantity>;
    eth_sendRawTransaction(transaction: api.Data): Promise<api.Data>;
    eth_sendTransaction(transaction: api.TransactionForSend): Promise<api.Data>;
    eth_sign(_account: api.Data, _message: api.Data): Promise<api.Data>;
    eth_signTransaction(_transaction: api.TransactionForSend): Promise<api.Data>;
    eth_signTypedData(_address: api.Data, _data: api.TypedData): Promise<api.Data>;
    eth_uninstallFilter(filterID: api.Quantity): Promise<boolean>;
}
interface Filter {
    blockID: BlockID;
}
export {};