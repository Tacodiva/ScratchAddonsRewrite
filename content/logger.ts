import { CurrentEnvironment, Environment } from "compile-configs";
import { createLogger, LogCategories } from "../share/logging";

export const logger = createLogger(LogCategories.content);

export const messageLogger = createLogger(LogCategories.content, "Messaging", false);
export const L10NLogger = createLogger(LogCategories.content, "L10N", false);

if (CurrentEnvironment === Environment.Production) {
    messageLogger.disable();
    L10NLogger.disable();
}