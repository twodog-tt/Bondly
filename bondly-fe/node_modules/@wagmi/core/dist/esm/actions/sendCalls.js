import { sendCalls as viem_sendCalls, } from 'viem/actions';
import { getConnectorClient, } from './getConnectorClient.js';
/** https://wagmi.sh/core/api/actions/sendCalls */
export async function sendCalls(config, parameters) {
    const { account, chainId, connector, calls, ...rest } = parameters;
    const client = await getConnectorClient(config, {
        account,
        chainId,
        connector,
    });
    return viem_sendCalls(client, {
        ...rest,
        ...(typeof account !== 'undefined' ? { account } : {}),
        calls,
        chain: chainId ? { id: chainId } : undefined,
    });
}
//# sourceMappingURL=sendCalls.js.map