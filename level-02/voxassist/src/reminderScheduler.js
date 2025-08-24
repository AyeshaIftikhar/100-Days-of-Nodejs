// Polls reminders and emits due ones via socket.io

export function startReminderScheduler({ db, io, intervalMs = 10_000 }) {
  async function tick() {
    try {
      const reminders = await db.listReminders(false);
      const now = Date.now();
      for (const r of reminders) {
        const when = Date.parse(r.when);
        if (!Number.isNaN(when) && when <= now) {
          // Emit to all connected clients
          io.emit('reminder:due', { id: r.id, message: r.message, when: r.when });
          await db.markReminderFired(r.id);
        }
      }
    } catch (e) {
      console.error('Reminder scheduler error:', e);
    }
  }

  // Run immediately and then at interval
  tick();
  const timer = setInterval(tick, intervalMs);
  console.log(`⏰ Reminder scheduler running every ${intervalMs / 1000}s`);
  return () => clearInterval(timer);
}
