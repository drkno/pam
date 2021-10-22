class AccessFlag {
    static NO_ACCESS = new AccessFlag(0, 'No Access');
    static USER = new AccessFlag(1 << 0, 'User');
    static ADMIN = new AccessFlag(1 << 1, 'Admin');

    constructor(enumValue, name) {
        this.value = enumValue;
        this.name = name;
    }

    hasFlag(mask) {
        return mask & this.value == this.value;
    }

    getMask() {
        return this.value;
    }

    toString() {
        return this.name;
    }
}

module.exports = AccessFlag;
