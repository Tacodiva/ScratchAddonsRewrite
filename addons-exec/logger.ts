import { CurrentEnvironment, Environment } from "compile-configs";
import { createLogger, LogCategories } from "../share/logging";

export const logger = createLogger(LogCategories.content, "Addons");
export const debugLogger = createLogger(LogCategories.content, "Addons", false);

if (CurrentEnvironment === Environment.Production) {
    debugLogger.disable();
}