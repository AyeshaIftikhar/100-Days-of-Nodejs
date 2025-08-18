const { sseFormat } = require('./utils');
const { HISTORY_LIMIT } = require('./config');

/**
 * In-memory channel bus with:
 *  - subscribers per channel
 *  - incrementing event IDs per channel
 *  - ring buffer history for replay on reconnect (Last-Event-ID)
 */
class ChannelBus {
  constructor() {
    this.channels = new Map(); // name -> { clients:Set<res>, lastId:number, history:Array }
  }

  _ensureChannel(name) {
    if (!this.channels.has(name)) {
      this.channels.set(name, {
        clients: new Set(),
        lastId: 0,
        history: []
      });
    }
    return this.channels.get(name);
  }

  subscribe(name, res, { replayAfterId, retry } = {}) {
    const chan = this._ensureChannel(name);
    chan.clients.add(res);

    // Send replay if requested
    if (typeof replayAfterId === 'number') {
      const missed = chan.history.filter((e) => e.id > replayAfterId);
      for (const evt of missed) {
        res.write(
          sseFormat({
            id: evt.id,
            event: evt.event,
            data: evt.data
          }) + '\n'
        );
      }
    }

    // Let client know the retry (reconnect) suggestion if provided
    if (retry) {
      res.write(sseFormat({ retry }) + '\n');
    }

    return () => {
      chan.clients.delete(res);
    };
  }

  publish(name, { event = 'message', data }) {
    const chan = this._ensureChannel(name);
    const nextId = ++chan.lastId;
    const record = { id: nextId, event, data };

    // push to ring buffer
    chan.history.push(record);
    if (chan.history.length > HISTORY_LIMIT) {
      chan.history.splice(0, chan.history.length - HISTORY_LIMIT);
    }

    // fan out
    const payload = sseFormat(record) + '\n';
    for (const clientRes of chan.clients) {
      clientRes.write(payload);
    }

    return record;
  }

  getStats() {
    const result = {};
    for (const [name, c] of this.channels.entries()) {
      result[name] = {
        subscribers: c.clients.size,
        lastId: c.lastId,
        historySize: c.history.length
      };
    }
    return result;
  }
}

module.exports = new ChannelBus();
