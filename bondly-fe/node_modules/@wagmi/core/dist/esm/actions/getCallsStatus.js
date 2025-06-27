import { getCallsStatus as viem_getCallsStatus, } from 'viem/actions';
import { getConnectorClient } from './getConnectorClient.js';
/** https://wagmi.sh/core/api/actions/getCallsStatus */
export async function getCallsStatus(config, parameters) {
    const { connector, id } = parameters;
    const client = await getConnectorClient(config, { connector });
    return viem_getCallsStatus(client, { id });
}
//# sourceMappingURL=getCallsStatus.js.map