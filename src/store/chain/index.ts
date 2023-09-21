import { BrowserProvider } from 'ethers';
import { SiweMessage } from 'siwe';

const domain = window.location.host;
const origin = window.location.origin;
const provider = new BrowserProvider(window.ethereum);

const BACKEND_ADDR = "http://localhost:3000";
async function createSiweMessage(address, statement) {
    const message = new SiweMessage({
        domain,
        address,
        statement,
        uri: origin,
        version: '1',
        chainId: 1,
        // nonce: await res.text()
    });
    return message.prepareMessage();
}

export async function connectWallet() {
    return provider.send('eth_requestAccounts', [])
        .catch(() => console.log('user rejected request'));
}

export async function signInWithEthereum() {
    const signer = await provider.getSigner();

    const message = await createSiweMessage(
        await signer.getAddress(),
        'Sign in with Ethereum to the app.'
    );
    const signature = await signer.signMessage(message);
    return { signature, address: signer.address, message }
}
