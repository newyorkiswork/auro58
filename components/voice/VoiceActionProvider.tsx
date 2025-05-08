"use client";

import { VoiceActionContext, VoiceActionHandlers } from "./VoiceActionContext";

export default function VoiceActionProvider({ children }: { children: React.ReactNode }) {
  // For now, use no-op handlers. Later, you can pass real handlers via props or context.
  const handlers: VoiceActionHandlers = {
    findNearestLaundromat: () => {},
    searchLaundromatByName: () => {},
    initiateBookingAtLaundromat: () => {},
    bookSpecificMachine: () => {},
  };

  return (
    <VoiceActionContext.Provider value={handlers}>
      {children}
    </VoiceActionContext.Provider>
  );
} 