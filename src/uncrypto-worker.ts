const webCrypto = (globalThis as unknown as { crypto: Crypto }).crypto;

export const subtle = webCrypto.subtle;

export const randomUUID = webCrypto.randomUUID.bind(webCrypto);

export const getRandomValues = webCrypto.getRandomValues.bind(webCrypto);

const crypto = {
  subtle,
  randomUUID,
  getRandomValues,
};

export default crypto;