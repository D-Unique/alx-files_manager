import AppController from '../controllers/AppController'
import server from '../server'

server.get('/status', AppController.getStatus);
server.get('/stats', AppController.getStats);
server.get('/',)

export default server;
