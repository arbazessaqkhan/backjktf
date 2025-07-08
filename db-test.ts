import { db } from './db';
import { products } from 'server/shared/schema';

(async () => {
  const result = await db.select().from(products).limit(1);
  console.log(result);
})();
