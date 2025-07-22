// PresenceSelector.js (recommended to keep reusable selectors separate)
import { createSelector } from "@reduxjs/toolkit";

export const makeSelectUserPresence = (userId) =>
  createSelector(
    [(state) => state.presence.users],
    (presenceData) => presenceData?.[userId] || null
  );

