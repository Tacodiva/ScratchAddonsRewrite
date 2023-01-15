
interface LogCategory {
    prefix: string,
    backgroundColor: string;
    textColor: string;
}

export const LogCategories: { [key: string]: LogCategory } = {
    background: {
        prefix: "Background",
        backgroundColor: "F65252",
        textColor: "FFFFFF"
    },
    content: {
        prefix: "Content",
        backgroundColor: "B4D86A",
        textColor: "FFFFFF"
    },
    addon: {
        prefix: "Addon",
        backgroundColor: "61AFEF",
        textColor: "FFFFFF"
    }
}

interface Logger extends Console {
    enable(): void;
    disable(): void;
}


export function createLogger(category: LogCategory, subCategory?: string, important: boolean = true): Logger {
    let textFormat = "";
    let categoryFormat = "font-weight: bold;";
    let saFormat = "font-weight: bold;";
    if (important) {
        categoryFormat += `color: #${category.textColor}; background-color: #${category.backgroundColor};`;
        saFormat += "color: white; background-color: #ff7b26";
    } else {
        textFormat += "color: #AAA;"
        saFormat += "color: #AAA; background-color: #ff7b2688";
        categoryFormat += `color: #${category.textColor}AA; background-color: #${category.backgroundColor}88;`;
    }
    const logger = {
        enable: function () {
            this.info = this.log = (arg: any) => console.log(`%c SA %c ${category.prefix}${subCategory ? '/' + subCategory : ''} %c ` + arg, saFormat, categoryFormat, textFormat)
        },
        disable: function () {
            this.info = this.log = (arg: any) => { }
        },

        ...console,

        warn: (arg: any) => console.warn(`%c SA %c ${category.prefix}${subCategory ? '/' + subCategory : ''} %c ` + arg, saFormat, categoryFormat, textFormat),
        error: (arg: any) => console.error(`%c SA %c ${category.prefix}${subCategory ? '/' + subCategory : ''} %c ` + arg, saFormat, categoryFormat, textFormat)
    }
    logger.enable();
    return logger;
}
