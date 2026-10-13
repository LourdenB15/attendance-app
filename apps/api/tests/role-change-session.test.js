import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import jwt from "jsonwebtoken";
import * as usersRepository from "../src/repositories/users.repository.js";
import * as adminService from "../src/services/admin.service.js";
import { checkAccountStatus } from "../src/middleware/check-account-status.js";
import pool from "../src/db/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";

test("Task 5: Role Changes & Session Invalidation Integration Test", async (t) => {
  // Setup test users in database
  const rand = Math.floor(Math.random() * 100000);
  const adminEmail = `admin_test_${rand}@test.com`;
  const targetEmail = `target_user_${rand}@test.com`;
  const bystanderEmail = `bystander_${rand}@test.com`;

  let adminUser;
  let targetUser;
  let bystanderUser;

  t.before(async () => {
    // Create admin
    adminUser = await usersRepository.createUser(
      "Test Admin",
      adminEmail,
      "hashed_password",
      "ADMIN",
      false,
      true,
    );

    // Create target user starting as STUDENT
    targetUser = await usersRepository.createUser(
      "Test Target",
      targetEmail,
      "hashed_password",
      "STUDENT",
      false,
      true,
    );

    // Create bystander user starting as PROFESSOR
    bystanderUser = await usersRepository.createUser(
      "Test Bystander",
      bystanderEmail,
      "hashed_password",
      "PROFESSOR",
      false,
      true,
    );
  });

  t.after(async () => {
    // Clean up created test users
    if (adminUser?.id) await pool.query("DELETE FROM users WHERE id = $1", [adminUser.id]);
    if (targetUser?.id) await pool.query("DELETE FROM users WHERE id = $1", [targetUser.id]);
    if (bystanderUser?.id) await pool.query("DELETE FROM users WHERE id = $1", [bystanderUser.id]);
  });

  await t.test("Initial state: users have token_version 0 and valid sessions", async () => {
    const fetchedTarget = await usersRepository.findById(targetUser.id);
    assert.equal(fetchedTarget.role, "STUDENT");
    assert.equal(fetchedTarget.token_version, 0);

    const targetJwt = jwt.sign(
      { sub: targetUser.id, role: "STUDENT", token_version: 0 },
      JWT_SECRET,
    );

    let nextCalled = false;
    const req = {
      user: jwt.verify(targetJwt, JWT_SECRET),
      cookies: { token: targetJwt },
    };
    const res = {
      clearCookie: () => {},
      status: () => ({ json: () => {} }),
    };
    const next = () => {
      nextCalled = true;
    };

    await checkAccountStatus(req, res, next);
    assert.equal(nextCalled, true, "Valid initial session passes checkAccountStatus");
    assert.equal(req.user.role, "STUDENT");
  });

  await t.test("Administrator changes target user role to PROFESSOR", async () => {
    const updated = await adminService.updateUserRole(adminUser.id, targetUser.id, "PROFESSOR");
    assert.equal(updated.role, "PROFESSOR");
    assert.equal(updated.token_version, 1, "token_version must increment after role change");

    const refreshedTarget = await usersRepository.findById(targetUser.id);
    assert.equal(refreshedTarget.role, "PROFESSOR");
    assert.equal(refreshedTarget.token_version, 1);
  });

  await t.test("Target user's previous session (stale role STUDENT) is rejected and cookie is cleared", async () => {
    // This is the exact scenario from QA.pdf screenshot 3:
    // Stale session issued when role was STUDENT tries to make a request
    const staleJwt = jwt.sign(
      { sub: targetUser.id, role: "STUDENT", token_version: 0 },
      JWT_SECRET,
    );

    let clearedCookieName = null;
    let responseStatus = null;
    let responseBody = null;
    let nextCalled = false;

    const req = {
      user: jwt.verify(staleJwt, JWT_SECRET),
      cookies: { token: staleJwt },
    };
    const res = {
      clearCookie: (name) => {
        clearedCookieName = name;
      },
      status: (code) => {
        responseStatus = code;
        return {
          json: (body) => {
            responseBody = body;
          },
        };
      },
    };
    const next = () => {
      nextCalled = true;
    };

    await checkAccountStatus(req, res, next);

    assert.equal(nextCalled, false, "Stale session must not proceed to route handler");
    assert.equal(clearedCookieName, "token", "Session cookie must be cleared on role change");
    assert.equal(responseStatus, 401, "Response must be 401 Unauthorized for invalid session");
    assert.equal(responseBody.code, "ROLE_CHANGED", "Response code must be ROLE_CHANGED");
  });

  await t.test("Administrator session remains completely valid and uninterrupted", async () => {
    const adminJwt = jwt.sign(
      { sub: adminUser.id, role: "ADMIN", token_version: 0 },
      JWT_SECRET,
    );

    let nextCalled = false;
    const req = {
      user: jwt.verify(adminJwt, JWT_SECRET),
      cookies: { token: adminJwt },
    };
    const res = {
      clearCookie: () => {},
      status: () => ({ json: () => {} }),
    };
    const next = () => {
      nextCalled = true;
    };

    await checkAccountStatus(req, res, next);
    assert.equal(nextCalled, true, "Admin session remains valid after updating another user");
    assert.equal(req.user.role, "ADMIN");
  });

  await t.test("Unrelated bystander user session remains completely valid", async () => {
    const bystanderJwt = jwt.sign(
      { sub: bystanderUser.id, role: "PROFESSOR", token_version: 0 },
      JWT_SECRET,
    );

    let nextCalled = false;
    const req = {
      user: jwt.verify(bystanderJwt, JWT_SECRET),
      cookies: { token: bystanderJwt },
    };
    const res = {
      clearCookie: () => {},
      status: () => ({ json: () => {} }),
    };
    const next = () => {
      nextCalled = true;
    };

    await checkAccountStatus(req, res, next);
    assert.equal(nextCalled, true, "Bystander session remains valid");
    assert.equal(req.user.role, "PROFESSOR");
  });

  await t.test("Target user signs in fresh: new session has updated role and valid token_version", async () => {
    // Fresh session minted after login reflects updated role and new token_version
    const freshJwt = jwt.sign(
      { sub: targetUser.id, role: "PROFESSOR", token_version: 1 },
      JWT_SECRET,
    );

    let nextCalled = false;
    const req = {
      user: jwt.verify(freshJwt, JWT_SECRET),
      cookies: { token: freshJwt },
    };
    const res = {
      clearCookie: () => {},
      status: () => ({ json: () => {} }),
    };
    const next = () => {
      nextCalled = true;
    };

    await checkAccountStatus(req, res, next);
    assert.equal(nextCalled, true, "New session succeeds");
    assert.equal(req.user.role, "PROFESSOR", "Session reflects new role");
  });

  await t.test("Demoting target user back to STUDENT invalidates PROFESSOR session", async () => {
    const demoted = await adminService.updateUserRole(adminUser.id, targetUser.id, "STUDENT");
    assert.equal(demoted.role, "STUDENT");
    assert.equal(demoted.token_version, 2);

    // Old PROFESSOR token with token_version 1
    const oldProfessorJwt = jwt.sign(
      { sub: targetUser.id, role: "PROFESSOR", token_version: 1 },
      JWT_SECRET,
    );

    let clearedCookieName = null;
    let responseStatus = null;
    let responseBody = null;
    let nextCalled = false;

    const req = {
      user: jwt.verify(oldProfessorJwt, JWT_SECRET),
      cookies: { token: oldProfessorJwt },
    };
    const res = {
      clearCookie: (name) => {
        clearedCookieName = name;
      },
      status: (code) => {
        responseStatus = code;
        return {
          json: (body) => {
            responseBody = body;
          },
        };
      },
    };
    const next = () => {
      nextCalled = true;
    };

    await checkAccountStatus(req, res, next);
    assert.equal(nextCalled, false, "Demoted user's previous session cannot continue");
    assert.equal(clearedCookieName, "token");
    assert.equal(responseStatus, 401);
    assert.equal(responseBody.code, "ROLE_CHANGED");
  });
});
