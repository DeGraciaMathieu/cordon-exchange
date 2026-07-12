// Minimal event bus: logic emits facts, the render layer subscribes.
export function createBus() {
  const handlers = {};
  return {
    on(type, fn) { (handlers[type] ||= []).push(fn); },
    emit(type, payload) { (handlers[type] || []).forEach(fn => fn(payload)); },
  };
}
