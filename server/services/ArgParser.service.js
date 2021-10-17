class ArgParser {
    constructor() {
        this._shortPrefix = '-';
        this._longPrefix = '--';
        this._argsList = [];
        this._argsMap = {};
        this._helpAdded = false;
        this._helpArg = null;
        this._parsedArgs = null;

        this.addHelp('pam', 'Plex Account Manager');
    }

    addArg(short, long, description, validate = ()=>{}, defaultVal = [], filerResults = a=>a) {
        if (this._parsedArgs !== null) {
            throw new Error('This method can only be run during early startup');
        }
        const argItem = {
            args: [
                this._shortPrefix + short,
                this._longPrefix + long
            ],
            short: short,
            long: long,
            description: description,
            validate: validate,
            defaultVal: defaultVal,
            filerResults: filerResults
        };
        this._argsList.push(argItem);
        this._argsMap[this._shortPrefix + short] = argItem;
        this._argsMap[this._longPrefix + long] = argItem;
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
        if (this._helpAdded) {
            throw new Error('Help can only be added once');
        }
        this._helpAdded = true;
        this._helpArg = this._longPrefix + long;
        this.addArg(short, long, 'Shows this help', () => {
            this._printHelp(name, description);

            if (exit) {
                process.exit(0);
            }
        });
    }

    _printHelp(name, description) {
        this._argsList.sort((a, b) => a.args[0] - b.args[0]);

        let helpText = `\nNAME\n\t${name} - ${description}\n\nSYNOPSIS\n\t${name} [OPTION]...\n\nOPTIONS\n`;

        for (let arg of this._argsList) {
            helpText += `\t${arg.args.join(', ')}\n\t\t${arg.description}\n\n`;
        }

        LOG.info(helpText);
    }

    afterStart() {
        if (this._parsedArgs !== null) {
            throw new Error('This method can only be run during early startup');
        }

        const args = process.argv.slice(2);
        const result = Object.values(this._argsList)
            .reduce((curr, next) => {
                curr[next.short] = next.filerResults(next.defaultVal);
                curr[next.long] = next.filerResults(next.defaultVal);
                return curr;
            }, {});
        let i = 0;
        while (i < args.length) {
            const arg = this._argsMap[args[i++]];
            const argPos = i;
            try {
                if (!arg) {
                    throw new Error();
                }
                while (i < args.length && !this._argsMap[args[i]]) {
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
        this._parsedArgs = result;
    }

    getArgument(argument) {
        if (this._parsedArgs === null) {
            throw new Error('Arguments are not yet parsed');
        }

        return this._parsedArgs[argument];
    }

    _handleInvalidArg(arg) {
        const helpArg = this._helpAdded
            ? `Use ${this._helpArg} for more information.`
            : '';

        LOG.error(`Unknown argument ${arg}. ${helpArg}`);
        process.exit(-1);
    }
}

module.exports = ArgParser;
