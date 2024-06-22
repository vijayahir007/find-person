export enum eventType {
    NOTIFICATION,
    PHOTOS_UPLOADED,
    PROCESS
}
export interface ICustomEvent {
    type: eventType;
    data: any
}