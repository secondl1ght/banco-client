import { hexToBytes, randomBytes } from '@noble/hashes/utils';
import { getPublicKey, utils } from '@noble/secp256k1';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { nip44 } from 'nostr-tools';

import { KeysType } from '@/stores/keys';

export const hexToUint8Array = (str: string): Uint8Array =>
  new Uint8Array(Buffer.from(str, 'hex'));

export const bufToHex = (buf: Uint8Array): string =>
  Buffer.from(buf).toString('hex');

export const secp256k1GenerateProtectedKeyPair = ({
  symmetricKey,
}: {
  symmetricKey: string;
}) => {
  const privateKey = utils.randomPrivateKey();
  const publicKey = getPublicKey(privateKey);

  const privateKeyHex = bufToHex(privateKey);

  const protectedPrivateKey = nip44.v2.encrypt(
    privateKeyHex,
    hexToBytes(symmetricKey)
  );

  return {
    publicKey: bufToHex(publicKey),
    protectedPrivateKey: protectedPrivateKey,
  };
};

export const generateNewMnemonic = ({
  symmetricKey,
}: {
  symmetricKey: string;
}) => {
  const mnemonic = generateMnemonic(wordlist);
  const protectedMnemonic = nip44.v2.encrypt(
    mnemonic,
    hexToBytes(symmetricKey)
  );

  return {
    mnemonic,
    protectedMnemonic,
  };
};

export const restoreMnemonic = ({
  mnemonic,
  symmetricKey,
}: {
  mnemonic: string;
  symmetricKey: string;
}) => {
  const protectedMnemonic = nip44.v2.encrypt(
    mnemonic,
    hexToBytes(symmetricKey)
  );

  return {
    mnemonic,
    protectedMnemonic,
  };
};

export const createProtectedSymmetricKey = ({
  masterKey,
}: {
  masterKey: string;
}): { symmetricKey: string; protectedSymmetricKey: string } => {
  const symmetricKey = Buffer.from(randomBytes(64)).toString('hex');

  const protectedSymmetricKey = nip44.v2.encrypt(
    symmetricKey,
    hexToBytes(masterKey)
  );

  return { symmetricKey, protectedSymmetricKey };
};

export const decryptSymmetricKey = (keys: KeysType): string => {
  return nip44.v2.decrypt(
    keys.protectedSymmetricKey,
    hexToBytes(keys.masterKey)
  );
};

export const changeProtectedSymmetricKey = ({
  symmetricKey,
  newMasterKey,
}: {
  symmetricKey: string;
  newMasterKey: string;
}) => {
  const protectedSymmetricKey = nip44.v2.encrypt(
    symmetricKey,
    hexToBytes(newMasterKey)
  );

  return protectedSymmetricKey;
};

export const getSHA256ArrayBuffer = async (
  message: string
): Promise<ArrayBuffer> => {
  const msgBuffer = new TextEncoder().encode(message);
  return crypto.subtle.digest('SHA-256', msgBuffer);
};

export const getSHA256 = async (message: string): Promise<string> => {
  const hashBuffer = await getSHA256ArrayBuffer(message);
  return Buffer.from(hashBuffer).toString('hex');
};
