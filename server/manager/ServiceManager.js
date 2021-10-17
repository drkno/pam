const { readdirSync } = require('fs');
const { join, parse } = require('path');

class ServiceManager {

    constructor() {
        const {
            services,
            startingNodes,
            serviceGraph
        } = this._buildServiceGraph();
        this._services = services;
        this._startingNodes = startingNodes;
        this._serviceGraph = serviceGraph;

        this._runningServices = {};
    }

    async startServices() {
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

        for (let service of Object.values(this._runningServices)) {
            if (service.afterStart) {
                await service.afterStart();
            }
        }
    }

    async stopServices() {
        for (let service of Object.values(this._runningServices)) {
            if (service.beforeStop) {
                await service.beforeStop();
            }
        }

        this._runningServices = {};
    }

    _buildServiceGraph() {
        const services = this._enumerateServices()
            .map(serviceFile => {
                const clazz = require(serviceFile);
                const name = parse(serviceFile)
                    .name
                    .replace(/\.service$/,'');
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

    _enumerateServices() {
        const servicesPath = join(__dirname, '../services');
        const services = readdirSync(servicesPath)
            .filter(file => file.endsWith('.service.js'))
            .map(file => join(servicesPath, file));
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
