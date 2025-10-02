import axios, { AxiosInstance } from 'axios';
import { decryptString } from '../../utils/crypto';

// Mailchimp: API key format 'xxxx-usX' where dc is after '-'
function makeMailchimpAxios(apiKey: string): AxiosInstance {
  const key = apiKey.includes(' ') ? apiKey : apiKey; // raw key
  const dc = key.split('-')[1];
  if (!dc) throw new Error('Invalid Mailchimp API key; missing data center');
  return axios.create({
    baseURL: `https://${dc}.api.mailchimp.com/3.0`,
    auth: { username: 'anystring', password: key },
    timeout: 15000,
  });
}

export function getMailchimpClient(possiblyEncryptedKey: string) {
  const apiKey = possiblyEncryptedKey.includes(' ') ? possiblyEncryptedKey : (() => {
    try { return decryptString(possiblyEncryptedKey); } catch { return possiblyEncryptedKey; }
  })();
  const http = makeMailchimpAxios(apiKey);
  return {
    async verify(): Promise<void> {
      await http.get('/');
    },
    async fetchLists(): Promise<any[]> {
      const { data } = await http.get('/lists', { params: { count: 1000 } });
      return (data?.lists ?? []).map((l: any) => ({ id: l.id, name: l.name, memberCount: l.stats?.member_count }));
    },
  };
}

// GetResponse v3 API: API key in 'X-Auth-Token: api-key <API_KEY>'
function makeGetResponseAxios(apiKey: string): AxiosInstance {
  return axios.create({
    baseURL: 'https://api.getresponse.com/v3',
    headers: { 'X-Auth-Token': `api-key ${apiKey}` },
    timeout: 15000,
  });
}

export function getGetResponseClient(possiblyEncryptedKey: string) {
  const apiKey = possiblyEncryptedKey.includes(' ') ? possiblyEncryptedKey : (() => {
    try { return decryptString(possiblyEncryptedKey); } catch { return possiblyEncryptedKey; }
  })();
  const http = makeGetResponseAxios(apiKey);
  return {
    async verify(): Promise<void> {
      await http.get('/accounts');
    },
    async fetchLists(): Promise<any[]> {
      const { data } = await http.get('/campaigns', { params: { perPage: 1000 } });
      return (data ?? []).map((c: any) => ({ id: c.campaignId || c.campaignId || c['campaignId'], name: c.name }));
    },
  };
}

