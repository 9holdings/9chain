// Read a managed node through Compose, retaining separate stdout and stderr.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { rpcResult, RpcResponseError } from './rpc-client.mjs';

const execute = promisify(execFile);

/**
 * Where a managed node answers INSIDE its own container. Every `docker compose exec <svc> curl`
 * in the console targets this, and it is declared once (D-227; `check-single-source`): the
 * same string on the host means the mapped port of ONE node, a different quantity.
 */
export const MANAGED_NODE_API = 'http://127.0.0.1:9650';

export function createManagedNodeRpc({ cwd, compose, run = execute }) {
  return async function rpcOnManagedNode(svc, segment, method, params, { signal, timeoutMs }) {
    // The in-container deadline matters too: killing a Docker client does not
    // guarantee cancellation of the process Docker already started in the container.
    const args = [...compose, 'exec', '-T', svc, 'curl', '-fsS', '-m', '5',
      '-X', 'POST', '-H', 'content-type:application/json',
      '--data', JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      `${MANAGED_NODE_API}${segment}`];
    let stdout;
    try {
      ({ stdout } = await run('docker', args, { cwd, env: process.env,
        signal, timeout: timeoutMs, killSignal: 'SIGKILL', maxBuffer: 1 << 24,
        windowsHide: true }));
    } catch { throw new Error(`${svc} ${method} is not answering within the readiness probe deadline`); }
    let message;
    try { message = JSON.parse(stdout); }
    catch { throw new RpcResponseError(`${svc} returned invalid ${method} JSON`); }
    try { return rpcResult(message, method); }
    catch (error) { error.message = `${svc}: ${error.message}`; throw error; }
  };
}
