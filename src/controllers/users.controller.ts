// =============================================================
// FILE: src/controllers/users.controller.ts
// -------------------------------------------------------------
// RESPONSIBILITY: This file contains ALL the business logic for
//   the Users resource. It decides WHAT to do when a request
//   arrives and WHAT to send back.
//
// Think of controllers as the "brain" of the operation:
//   - The route says "hey, someone called GET /users"
//   - The controller says "okay, I'll grab all users and return them"
//
// WHAT'S INSIDE:
//   One exported function for each endpoint:
//     getAllUsers    → GET  /users
//     getUserById   → GET  /users/:id
//     createUser    → POST /users
//     updateUser    → PUT  /users/:id
//     deleteUser    → DELETE /users/:id
//
// Each function receives (req, res):
//   req = the incoming request (URL params, body, headers, etc.)
//   res = the outgoing response (what we send back to the client)
// =============================================================

import type { Request, Response } from 'express';

// Import our in-memory data array and the User type from the model.
// We read from and write to this array to simulate a real database.
import { users,type  User } from '../models/user.model.js';

// ---------------------------------------------------------------
// HELPER: a counter to auto-generate new user IDs.
// Every time we create a user, this number goes up by 1.
// In a real DB, the database handles this automatically.
// ---------------------------------------------------------------
let nextUserId = users.length + 1;

// ---------------------------------------------------------------
// GET /users
// Returns the full list of all users.
// ---------------------------------------------------------------
// export const getAllUsers = (req: Request, res: Response) => {
//   // Send back the entire users array with a 200 OK status.
//   // (200 is the default, but being explicit is good practice.)
//   res.status(200).json(users);
// };
export const getAllUsers = (req: Request, res: Response) => {
  res.json(users);
}

// ---------------------------------------------------------------
// GET /users/:id
// Returns a single user whose id matches the URL parameter.
// Example: GET /users/2 → returns the user with id 2
// ---------------------------------------------------------------
export const getUserById = (req: Request, res: Response) => {
  // req.params.id comes in as a STRING from the URL (e.g. "2"),
  // so we convert it to a NUMBER with parseInt before comparing.
  const id = parseInt(req.params["id"] as string);

  // Search the array for a user whose id matches.
  const user = users.find((u) => u.id === id);

  // GUARD CLAUSE: if no user was found, stop early and return 404.
  // Returning inside the if-block prevents the code below from running.
  if (!user) {
    res.status(404).json({ message: `User with id ${id} not found.` });
    return;
  }

  // If we reach here, we found the user — send it back.
  res.status(200).json(user);
};

// ---------------------------------------------------------------
// POST /users
// Creates a brand-new user from the data in the request body.
// The client sends JSON like: { "name": "Dan", "email": "dan@…", … }
// ---------------------------------------------------------------
export const createUser = (req: Request, res: Response) => {
  // Destructure the fields we expect from the request body.
  const { name, email, username, phone, role, avatar, bio } = req.body;

  // GUARD CLAUSE: make sure all REQUIRED fields are present.
  // If any required field is missing, return 400 Bad Request.
  if (!name || !email || !username || !phone || !role) {
    res.status(400).json({
      message: 'Missing required fields: name, email, username, phone, role.',
    });
    return;
  }

  // Build the new user object.
  // id is auto-generated; we include optional fields only if provided.
  const newUser: User = {
    id: nextUserId++, // use current value, then increment for next time
    name,
    email,
    username,
    phone,
    role,
    ...(avatar && { avatar }), // only add avatar if it was sent
    ...(bio && { bio }), // only add bio if it was sent
  };

  // Push the new user into our in-memory array (simulates INSERT INTO db).
  users.push(newUser);

  // Respond with 201 Created and the newly created user object.
  res.status(201).json(newUser);
};

// ---------------------------------------------------------------
// PUT /users/:id
// Updates an existing user's fields with data from the request body.
// Only the fields sent in the body will be updated (partial update).
// ---------------------------------------------------------------
export const updateUser = (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);

  // Find the index of the user in the array (we need the index to update it).
  const index = users.findIndex((u) => u.id === id);

  // GUARD CLAUSE: if index is -1, the user was not found.
  if (index === -1) {
    res.status(404).json({ message: `User with id ${id} not found.` });
    return;
  }

  // Merge the existing user with whatever fields were sent in the body.
  // The spread operator "…" copies all existing fields first, then
  // overwrites only the ones included in req.body.
  users[index] = { ...users[index], ...req.body };

  // Send back the updated user.
  res.status(200).json(users[index]);
};

// ---------------------------------------------------------------
// DELETE /users/:id
// Removes a user from the array permanently.
// ---------------------------------------------------------------
export const deleteUser = (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);

  const index = users.findIndex((u) => u.id === id);

  // GUARD CLAUSE: user not found.
  if (index === -1) {
    res.status(404).json({ message: `User with id ${id} not found.` });
    return;
  }

  // splice(index, 1) removes exactly 1 element at the found index.
  users.splice(index, 1);

  // 200 OK with a confirmation message.
  res.status(200).json({ message: `User with id ${id} deleted successfully.` });
};
