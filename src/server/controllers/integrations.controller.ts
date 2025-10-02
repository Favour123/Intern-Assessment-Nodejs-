import { Request, Response } from 'express';
import { z } from 'zod';
import { ApiError } from '../middleware/errorHandler';
import { Integration } from '../../store/models/Integration';
import { encryptString } from '../../utils/crypto';
import { getMailchimpClient, getGetResponseClient } from '../../services/esps';
import { paginateArray } from '../../utils/pagination';

const StoreSchema = z.object({
  provider: z.enum(['mailchimp', 'getresponse']),
  apiKey: z.string().min(10),
  label: z.string().min(1).optional(),
});

export async function storeEspCredentials(req: Request, res: Response) {
  const parse = StoreSchema.safeParse(req.body);
  if (!parse.success) throw new ApiError(400, 'Invalid body', parse.error.flatten());

  const { provider, apiKey, label } = parse.data;

  // verify by pinging the provider
  try {
    if (provider === 'mailchimp') {
      const client = getMailchimpClient(apiKey);
      await client.verify();
    } else {
      const client = getGetResponseClient(apiKey);
      await client.verify();
    }
  } catch (e: any) {
    
    const status = e?.response?.status ?? 400;
    throw new ApiError(status, 'Failed to verify credentials', e?.response?.data ?? e?.message);
  }

  const encryptedKey = encryptString(apiKey);
  const integration = await Integration.create({ provider, apiKey: encryptedKey, label });

  return res.status(201).json({ id: integration.id, provider, label });
}

export async function getLists(req: Request, res: Response) {
  const provider = (req.query.provider as string) ?? '';
  const page = parseInt((req.query.page as string) ?? '1', 10);
  const limit = parseInt((req.query.limit as string) ?? '25', 10);

  if (provider !== 'mailchimp' && provider !== 'getresponse') {
    throw new ApiError(400, 'Query param provider must be mailchimp or getresponse');
  }

  const integration = await Integration.findOne({ provider }).lean();
  if (!integration) throw new ApiError(404, 'No saved credentials for provider');

  try {
    if (provider === 'mailchimp') {
      const client = getMailchimpClient(integration.apiKey);
      const lists = await client.fetchLists();
      const paged = paginateArray(lists, page, limit);
      return res.json(paged);
    } else {
      const client = getGetResponseClient(integration.apiKey);
      const lists = await client.fetchLists();
      const paged = paginateArray(lists, page, limit);
      return res.json(paged);
    }
  } catch (e: any) {
    const status = e?.response?.status ?? 502;
    throw new ApiError(status, 'Failed to fetch lists', e?.response?.data ?? e?.message);
  }
}

