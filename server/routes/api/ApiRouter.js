class ApiRouter {
    constructor(webServer, apiVersion, ignoreRouteName = false) {
        this._apiVersion = apiVersion;
        this._webServer = webServer;
        this._mapMethods(ignoreRouteName
            ? ''
            : '/' + this.constructor.name.replace(/Route$/i, '').toLowerCase());
    }

    _mapMethods(routeName) {
        const methodRegex = /^(get|head|post|put|delete|connect|options|trace|patch|use|all)_*(.*)/i;
        const methods = this._enumerateMethods();
        for (const classMethod of methods) {
            const match = methodRegex.exec(classMethod);
            if (!match || !match[1]) {
                continue;
            }
            const httpMethod = match[1];
            const subpath = (match[2] || '').replace(/_/g, '/');
            const path = '/api/' + this._apiVersion + routeName + (subpath ? '/' + subpath : '');

            const classMethodInstance = this[classMethod].bind(this);
            classMethodInstance.toString = () => this[classMethod].toString();
            const router = this._webServer.get();
            router[httpMethod].call(router, path, classMethodInstance);
        }
    }

    _enumerateMethods() {
        const objProto = Reflect.getPrototypeOf({});
        const methods = new Set();
        let current = this;
        while ((current = Reflect.getPrototypeOf(current)) && current !== objProto) {
            let keys = Reflect.ownKeys(current)
            keys.forEach((k) => methods.add(k));
        }
        return methods;
    }
}

module.exports = ApiRouter;
