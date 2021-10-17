const ServiceManager = require('./manager/ServiceManager');

class Main {
    static async main() {
        const timeBefore = new Date().getTime();

        const serviceManager = new ServiceManager();
        process.on('exit', async() => {
            await serviceManager.stopServices();
            process.exit(0);
        });
        await serviceManager.startServices();

        const timeAfter = new Date().getTime();
        LOG.warn(`Startup complete in ${timeAfter - timeBefore}ms`);
    }
}

Main.main();
