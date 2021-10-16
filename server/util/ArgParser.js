class ArgParser {
    constructor(shortPrefix = '-', longPrefix = '--') {
        this.shortPrefix = shortPrefix;
        this.longPrefix = longPrefix;
        this.argsList = [];
        this.argsMap = {};
        this.helpAdded = false;
        this.helpArg = null;
    }

    addArg(short, long, description, validate = ()=>{}, defaultVal = [], filerResults = a=>a) {
        const argItem = {
            args: [
                this.shortPrefix + short,
                this.longPrefix + long
            ],
            short: short,
            long: long,
            description: description,
            validate: validate,
            defaultVal: defaultVal,
            filerResults: filerResults
        };
        this.argsList.push(argItem);
        this.argsMap[this.shortPrefix + short] = argItem;
        this.argsMap[this.longPrefix + long] = argItem;
    }

    addSingleArg(short, long, description, validate = ()=>{}, defaultVal = []) {
        this.addArg(short, long, description, args => {
            if (args.length !== 1) {
                throw new Error();
            }
            validate(args[0]);
        }, [defaultVal], args => {
            return args[0];
        });
    }

    addSizedArg(short, long, description, size, validate = ()=>{}, defaultVal = []) {
        if (!Array.isArray(defaultVal) || defaultVal.length !== size) {
            throw new Error('Default val does not meet size constraints');
        }
        this.addArg(short, long, description, args => {
            if (args.length !== size) {
                throw new Error();
            }
            validate(args);
        }, defaultVal);
    }

    addHelp(name, description, short = 'h', long = 'help', exit = true) {
        if (this.helpAdded) {
            throw new Error('Help can only be added once');
        }
        this.helpAdded = true;
        this.helpArg = this.longPrefix + long;
        this.addArg(short, long, 'Shows this help', () => {
            this.printHelp(name, description);

            if (exit) {
                process.exit(0);
            }
        });
    }

    printHelp(name, description) {
        this.argsList.sort((a, b) => a.args[0] - b.args[0]);

        let helpText = `\nNAME\n\t${name} - ${description}\n\nSYNOPSIS\n\t${name} [OPTION]...\n\nOPTIONS\n`;

        for (let arg of this.argsList) {
            helpText += `\t${arg.args.join(', ')}\n\t\t${arg.description}\n\n`;
        }

        LOG.info(helpText);
    }

    evaluate(args) {
        const result = Object.values(this.argsList)
            .reduce((curr, next) => {
                curr[next.short] = next.filerResults(next.defaultVal);
                curr[next.long] = next.filerResults(next.defaultVal);
                return curr;
            }, {});
        let i = 0;
        while (i < args.length) {
            const arg = this.argsMap[args[i++]];
            const argPos = i;
            try {
                if (!arg) {
                    throw new Error();
                }
                while (i < args.length && !this.argsMap[args[i]]) {
                    i++;
                }
                let subArgs = args.slice(argPos, i);
                result[arg.short] = arg.filerResults(subArgs);
                result[arg.long] = arg.filerResults(subArgs);
                arg.validate(subArgs);
            }
            catch(e) {
                this._handleInvalidArg(args[i - 1]);
            }
        }
        return result;
    }

    _handleInvalidArg(arg) {
        const helpArg = this.helpAdded
            ? `Use ${this.helpArg} for more information.`
            : '';

        LOG.error(`Unknown argument ${arg}. ${helpArg}`);
        process.exit(-1);
    }
}


module.exports = ArgParser;
