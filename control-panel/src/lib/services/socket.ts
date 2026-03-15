import { io, type Socket } from 'socket.io-client';
import type { EventPayloadMap } from '$lib/contracts/events';
// imports event name constants from $lib/contracts/events,

//??
// which is a map of event names to their payload types. 
// This allows us to type the subscribe function correctly,
// ensuring that the handler receives the correct 
// payload type for each event.  

export const socket: Socket = io(import.meta.env.VITE_SOCKET_URL, {
    autoConnect: false,
});

export function connectSocket(): void { socket.connect(); };
export function disconnectSocket(): void { socket.disconnect(); };

// ???????? what does all this means?? 
export function subscribe<K extends keyof EventPayloadMap>(
    event: K,
    handler: (payload: EventPayloadMap[K]) => void
): () => void {
    socket.on(event as string, handler);
    return () => socket.off(event as string, handler);
}

// what was the io emit function structure? 
/*
export function emit(
    event: keyof EventPayloadMap,
    payload: EventPayloadMap[keyof EventPayloadMap]): void { 
        socket.emit(event as string, payload);
} */