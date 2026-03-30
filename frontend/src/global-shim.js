/**
 * sockjs-client expects Node's `global`; set before any module imports it.
 */
window.global = window.global || globalThis;
