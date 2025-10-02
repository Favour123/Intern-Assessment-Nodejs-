import { Router } from 'express';
import { storeEspCredentials, getLists } from '../controllers/integrations.controller';

const router = Router();

router.post('/esp', storeEspCredentials);
router.get('/esp/lists', getLists);

export default router;

