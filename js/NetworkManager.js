/**
 * NetworkManager.js
 * Wraps PeerJS (WebRTC DataChannel) for 2-player co-op.
 *
 * Usage:
 *   const net = new NetworkManager();
 *   net.onConnected = () => { ... };
 *   net.onDisconnected = () => { ... };
 *   net.onInputReceived = (inputState) => { ... };   // host only
 *   net.onStateReceived = (snapshot) => { ... };     // client only
 *   net.host();          // P1: generates room code, waits for P2
 *   net.join('XK7F2Q'); // P2: connects to host by room code
 *   net.sendInput(inputState);    // P2 → P1 each frame
 *   net.sendGameState(snapshot);  // P1 → P2 at 20 Hz
 */
class NetworkManager {
    constructor() {
        this.peer = null;
        this.conn = null;
        this.isHost = false;
        this.isConnected = false;
        this.roomCode = null;

        // Set by caller before host() / join()
        this.onConnected = null;
        this.onDisconnected = null;
        this.onInputReceived = null;   // fires on host when P2 input arrives
        this.onStateReceived = null;   // fires on client when snapshot arrives
        this.onRoomReady = null;       // fires on host once peer ID is registered (room code ready)
        this.onError = null;           // fires on any PeerJS error

        // Last input received from P2 (host reads this each frame)
        this.lastReceivedInput = { keys: {}, mouseX: 0, mouseY: 0 };
    }

    // ── Host ──────────────────────────────────────────────────────────────────

    host() {
        this.isHost = true;
        this.roomCode = NetworkManager._generateCode();
        this.peer = new Peer(this.roomCode, NetworkManager._peerConfig());

        this.peer.on('open', (id) => {
            if (this.onRoomReady) this.onRoomReady(id);
        });

        this.peer.on('connection', (conn) => {
            this.conn = conn;
            this._setupConnection(conn);
        });

        this.peer.on('error', (err) => {
            // If room code is already taken, try a new one
            if (err.type === 'unavailable-id') {
                this.peer.destroy();
                this.roomCode = NetworkManager._generateCode();
                this.host();
                return;
            }
            if (this.onError) this.onError(err);
        });
    }

    // ── Client ────────────────────────────────────────────────────────────────

    join(code) {
        this.isHost = false;
        this.roomCode = code.toUpperCase().trim();
        this.peer = new Peer(NetworkManager._peerConfig());

        this.peer.on('open', () => {
            this.conn = this.peer.connect(this.roomCode);
            this._setupConnection(this.conn);
        });

        this.peer.on('error', (err) => {
            if (this.onError) this.onError(err);
        });
    }

    // ── Send ──────────────────────────────────────────────────────────────────

    /** P2 calls this each frame with current keyboard + mouse state */
    sendInput(inputState) {
        if (this._canSend()) {
            this.conn.send({ type: 'input', data: inputState });
        }
    }

    /** Host calls this at 20 Hz with serialized world snapshot */
    sendGameState(snapshot) {
        if (this._canSend()) {
            this.conn.send({ type: 'state', data: snapshot });
        }
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    disconnect() {
        if (this.conn) { try { this.conn.close(); } catch (e) {} }
        if (this.peer) { try { this.peer.destroy(); } catch (e) {} }
        this.conn = null;
        this.peer = null;
        this.isConnected = false;
    }

    // ── Private ───────────────────────────────────────────────────────────────

    _setupConnection(conn) {
        conn.on('open', () => {
            this.isConnected = true;
            if (this.onConnected) this.onConnected();
        });

        conn.on('data', (msg) => {
            if (!msg || !msg.type) return;
            if (msg.type === 'input') {
                this.lastReceivedInput = msg.data;
                if (this.onInputReceived) this.onInputReceived(msg.data);
            } else if (msg.type === 'state') {
                if (this.onStateReceived) this.onStateReceived(msg.data);
            }
        });

        conn.on('close', () => {
            this.isConnected = false;
            if (this.onDisconnected) this.onDisconnected();
        });

        conn.on('error', (err) => {
            if (this.onError) this.onError(err);
        });
    }

    _canSend() {
        return this.conn && this.conn.open;
    }

    static _generateCode() {
        // Omit chars that look similar (0/O, 1/I/L)
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 3; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    static _peerConfig() {
        return {
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        };
    }
}
