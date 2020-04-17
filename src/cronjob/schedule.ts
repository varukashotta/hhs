import unleashDragon from "./index";
import { logger } from "../log";

(async () => {
  const result = await unleashDragon();
  logger.info({ message: result });
})().catch((err) => {
  console.error(err);
});
