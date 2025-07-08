import { db } from './db.js';
import { products } from './shared/schema.js';

(async () => {
  const result = await db.select().from(products).limit(1);
  console.log(result);
})();
