import { BrowserProvider } from 'ethers';
// import { hashMessage, recover, sign } from 'web3-eth-accounts';
// import { SiweMessage } from 'siwe';

const domain = window.location.host;
const origin = window.location.origin;
const provider = new BrowserProvider(window.ethereum);

// expect(hashMessage(message)).toEqual(hash);
// const result = sign(data, testObj.privateKey);
// expect(result.signature).toEqual(testObj.signature || testObj.signatureOrV); // makes sure we get signature and not V value
// const address = recover(data, testObj.signatureOrV, testObj.prefixedOrR, testObj.s);
// expect(address).toEqual(testObj.address);

export async function connectWallet() {
    const result = await provider.send('eth_requestAccounts', [])
        .catch(() => console.log('user rejected request'));

    if (!result) {
        throw new Error
    }

    console.log("CONNECT WALLET DONW", result)
    const roomList = [0]
    return {
        address: result, 
        owned: roomList,
        available: roomList
    }
}

export async function signInWithEthereum() {
    const signer = await provider.getSigner();

    const message = 'Sign in with Ethereum to the app using address: ' + await signer.getAddress()
    const signature = await signer.signMessage(message);
    return { signature, address: signer.address, message, owned: [], available: [] }
}
