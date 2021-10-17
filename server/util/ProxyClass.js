class ProxyClass {
    constructor(supplier) {
        return new Proxy(this, {
            get: (target, property) => {
                if (property === 'self') {
                    return target;
                }
                if (target[property]) {
                    return target[property];
                }
                return supplier(target)[property];
            },
            set: (target, property, value) => {
                const supplied = supplier(target);
                if (supplied && supplied[property]) {
                    supplied[property] = value;
                }
                else {
                    target[property] = value;
                }
                return true;
            }
        });
    }
}

module.exports = ProxyClass;
