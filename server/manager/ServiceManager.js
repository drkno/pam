const { parse } = require('path');
const { walkFileTree } = require('../util/Files');

class ServiceManager {

    constructor(servicePaths, serviceSuffixes) {
        this._loading = this._buildServiceGraph(servicePaths, serviceSuffixes)
            .then(({
                services,
                startingNodes,
                serviceGraph
            }) => {
                this._services = services;
                this._startingNodes = startingNodes;
                this._serviceGraph = serviceGraph;
            });

        this._runningServices = {};
    }

    async startServices() {
        await this._loading;
        if (Object.keys(this._runningServices).length > 0) {
            throw new Error('Services already started');
        }

        const currServices = [...this._startingNodes];
        while (currServices.length > 0) {
            const service = currServices.pop();
            const args = service.args.map(dep => this._runningServices[dep]);
            const instance = new service.clazz(...args);
            
            this._runningServices[service.name] = instance;
            
            for (let dependantService of this._serviceGraph[service.name]) {
                if (this._runningServices[dependantService.name]
                        || dependantService.args.some(dep => !this._runningServices[dep])) {
                    continue;
                }

                currServices.push(dependantService);
            }
        }

        if (Object.keys(this._runningServices).length !== this._services.length) {
            throw new Error('Some services failed to start');
        }

        const runningServices = Object.values(this._runningServices);
        for (let service of runningServices) {
            if (service.afterStart) {
                await service.afterStart();
            }
        }
    }

    async stopServices() {
        const runningServices = Object.values(this._runningServices);
        for (let service of runningServices) {
            if (service.beforeStop) {
                await service.beforeStop();
            }
        }

        this._runningServices = {};
    }

    async _buildServiceGraph(servicePaths, serviceSuffixes) {
        const replaceRegex = new RegExp('(' + serviceSuffixes
            .map(suffix => suffix.replace('.js', ''))
            .map(suffix => suffix.replace(/\./g, '\\.'))
            .join('|') + ')$');
        const services = (await this._enumerateServices(servicePaths, serviceSuffixes))
            .map(serviceFile => {
                const clazz = require(serviceFile);
                const name = parse(serviceFile)
                    .name
                    .replace(replaceRegex,'');
                return {
                    args: this._extractArgs(clazz),
                    clazz,
                    name,
                    file: serviceFile
                };
            });

        const serviceMap = {};
        const serviceGraph = {};
        for (let service of services) {
            serviceMap[service.name] = service;
            serviceGraph[service.name] = new Set();
        }

        const startingNodes = new Set(services);
        for (let service of services) {
            if (service.args.length > 0) {
                startingNodes.delete(service);
            }

            for (let arg of service.args) {
                const dependency = serviceMap[arg];
                if (!dependency) {
                    throw new Error(`Dependency '${arg}' of service '${service.name}' not found.`);
                }

                serviceGraph[dependency.name].add(service);
            }
        }

        return {
            services,
            startingNodes,
            serviceGraph
        };
    }

    async _enumerateServices(servicePaths, serviceSuffixes) {
        const services = [];
        for (let servicePath of servicePaths) {
            for await (const file of walkFileTree(servicePath)) {
                if (serviceSuffixes.some(suffix => file.endsWith(suffix))) {
                    services.push(file);
                }
            }
        }
        return services;
    }

    _extractArgs(serviceClass) {
        const extractor = /[\{\s]constructor\s*\(([^\)]*)\)/g;
        const matches = extractor.exec(serviceClass);
        
        if (matches === null) {
            // no defined constructor, or no args
            return [];
        }

        return matches[1]
            .split(',')
            .map(split => split.trim())
            .filter(arg => arg !== '');
    }

}

module.exports = ServiceManager;
