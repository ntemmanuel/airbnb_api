// =============================================================
// FILE: src/models/user.model.ts
// -------------------------------------------------------------
// RESPONSIBILITY: This file is the "data layer" for users.
//   - It defines the SHAPE of a User object (the interface).
//   - It stores the actual user data in a plain array.
//
// Think of this file as the "database" for users. Instead of a
// real database, we're just using a JavaScript array that lives
// in memory while the server is running.
//
// WHAT'S INSIDE:
//   1. User interface  — the blueprint / shape every user must follow
//   2. users array     — the in-memory "table" holding all user records
// =============================================================
// ---------------------------------------------------------------
// 2. THE IN-MEMORY USERS ARRAY
// ---------------------------------------------------------------
// This array is our fake "users table". We seed it with 3 users
// so we have data to work with right away.
//
// "User[]" means "an array where every item must match the User interface".
// ---------------------------------------------------------------
export const users = [
    {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        username: 'alice_j',
        phone: '+1-555-0101',
        role: 'host',
        avatar: 'https://i.pravatar.cc/150?img=1',
        bio: 'I love hosting travelers from around the world!',
    },
    {
        id: 2,
        name: 'Bob Smith',
        email: 'bob@example.com',
        username: 'bob_s',
        phone: '+1-555-0202',
        role: 'guest',
        avatar: 'https://i.pravatar.cc/150?img=2',
        bio: 'Avid traveler, always exploring new places.',
    },
    {
        id: 3,
        name: 'Carol White',
        email: 'carol@example.com',
        username: 'carol_w',
        phone: '+1-555-0303',
        role: 'host',
        bio: 'I have two cozy cabins in the mountains.',
    },
];
//# sourceMappingURL=user.model.js.map