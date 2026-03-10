## Functions as first-class values

In JavaScript and TypeScript, functions are values. You can assign them to variables, pass them as arguments, and return them from other functions.

```typescript
// A function stored in a variable
const greet = (name: string): string => `Hello, ${name}!`;

// Passed as an argument (callback)
const names = ['Thorin', 'Gimli'];
names.forEach((n) => console.log(greet(n)));
```

## Callbacks in OVERLAYS

The control panel sends REST requests and uses callback-style Socket.io event handlers:

```typescript
// socket.js — subscribing to an event
socket.on('hp_updated', (data: { id: string; hp: number }) => {
  characters.update((chars) =>
    chars.map((c) => (c.id === data.id ? { ...c, hp: data.hp } : c))
  );
});
```

The arrow function `(data) => { ... }` is a value passed _into_ `socket.on`. TypeScript checks that its parameter matches what the event emits.

## Async functions

All PocketBase wrappers in `data/characters.js` are async — they return `Promise<T>`:

```typescript
async function updateHp(pb: PocketBase, id: string, hp: number): Promise<void> {
  await pb.collection('characters').update(id, { hp });
}
```

`await` pauses until the Promise resolves. Without `await`, you get a pending Promise, not the result.

## The spread operator with objects

Functions in OVERLAYS frequently create new objects via spread rather than mutating:

```typescript
// Do this (immutable update):
chars.map((c) => c.id === id ? { ...c, hp: newHp } : c)

// Avoid (mutation):
chars.find((c) => c.id === id)!.hp = newHp;
```
