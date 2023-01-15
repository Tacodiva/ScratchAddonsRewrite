import { CurrentEnvironment, Environment } from "compile-configs";
import { createLogger, LogCategories } from "../share/logging";

export const logger = createLogger(LogCategories.background);

export const messageLogger = createLogger(LogCategories.background, "Messaging", false);

if (CurrentEnvironment === Environment.Production) {
    messageLogger.disable();
}