import { open } from "sqlite";
import sqlite3 from "sqlite3";

import { createSchema } from "./schema";
import { getPendingOrders } from "./queries/order_queries";
import { sendSlackMessage } from "./slack";

async function main() {
  const db = await open({
    filename: "ecommerce.db",
    driver: sqlite3.Database,
  });

  await createSchema(db, false);

  const staleOrders = await getPendingOrders(db, 3);

  if (staleOrders.length > 0) {
    const lines = staleOrders.map(
      (o) =>
        `- Order ${o.order_number}: ${o.customer_name}, phone: ${o.phone || "N/A"} (pending ${Math.floor(o.days_pending)} days)`
    );

    const message =
      `*Stale Pending Orders Alert*\n` +
      `${staleOrders.length} order(s) pending for more than 3 days:\n` +
      lines.join("\n");

    await sendSlackMessage("#order-alerts", message);
  }
}

main();
