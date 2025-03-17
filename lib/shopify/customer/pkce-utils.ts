// @ts-nocheck
// PKCE Utility Functions

export async function generateCodeVerifier(): Promise<string> {
   const randomCode = generateRandomCode();
   return base64UrlEncode(randomCode);
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
   const digest = await crypto.subtle.digest(
      { name: 'SHA-256' },
      new TextEncoder().encode(codeVerifier)
   );
   const hash = convertBufferToString(digest);
   return base64UrlEncode(hash);
}

function generateRandomCode(): string {
   const array = new Uint8Array(32);
   crypto.getRandomValues(array);
   return String.fromCharCode(...array);
}

function base64UrlEncode(str: string): string {
   return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function convertBufferToString(buffer: ArrayBuffer): string {
   return String.fromCharCode(...new Uint8Array(buffer));
}

export async function generateRandomString() {
   const timestamp = Date.now().toString();
   const randomString = Math.random().toString(36).substring(2);
   return timestamp + randomString;
}
export async function generateState(): Promise<string> {
   return generateRandomString();
}

export async function generateNonce(length: number): Promise<string> {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   let nonce = '';
   for (let i = 0; i < length; i++) {
      nonce += chars.charAt(Math.floor(Math.random() * chars.length));
   }
   return nonce;
}

export async function getNonce(token: string): Promise<string> {
   return decodeJwt(token).payload.nonce;
}

function decodeJwt(token: string) {
   const [header, payload, signature] = token.split('.');
   return {
      header: JSON.parse(atob(header)),
      payload: JSON.parse(atob(payload)),
      signature
   };
}
