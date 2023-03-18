export class AdapterError extends Error {}

export class DriverError extends Error {}

export class BotError extends Error {}

export class UnknownEventError extends AdapterError {}

export class UnsupportedMessageError extends AdapterError {}
