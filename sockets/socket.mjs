export default class Socket {
    constructor() {
        this.initialized = false;
        this.callbacks = {};
    }
    static system;

    static initialize(system) {
        Socket._instance._initialize(system);
    }

    _initialize(system) {
        if (!this.initialized) {
            Socket._system = system;
            game.socket.on('system.'+Socket._system, (data) => {
                Socket._instance._handleMessage(data);
            });
            this.initialized = true;
        }
    }

    _handleMessage(data) {
        if (this.callbacks[data.event]) {
            this.callbacks[data.event](data.data);
        }
    }

    static emit(eventName, data) {
        const message = {
            event: eventName,
            data: data
        }
        game.socket.emit('system.'+Socket._system, message);
    }

    static on(eventName, callback) {
        Socket._instance._on(eventName, callback);
    }

    _on(eventName, callback) {
        this.callbacks[eventName] = callback;
    }
}
Socket._instance = new Socket();