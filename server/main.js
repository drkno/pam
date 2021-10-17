const { join } = require('path');
const ServiceManager = require('./manager/ServiceManager');

class Main {
    static async main() {
        const timeBefore = new Date().getTime();

        const serviceManager = new ServiceManager(
            [join(__dirname, 'services'), join(__dirname, 'routes')],
            ['.service.js', 'route.js']
        );
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
