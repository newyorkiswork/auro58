"use client";

import { createContext, useContext } from 'react';

export interface VoiceActionHandlers {
  findNearestLaundromat: () => void;
  searchLaundromatByName: (name: string) => void;
  initiateBookingAtLaundromat: (name: string) => void;
  bookSpecificMachine: (params: {
    laundromatName: string;
    machineType?: string;
    machineNumber?: string;
    time?: string;
  }) => void;
}

const defaultHandlers: VoiceActionHandlers = {
  findNearestLaundromat: () => {},
  searchLaundromatByName: () => {},
  initiateBookingAtLaundromat: () => {},
  bookSpecificMachine: () => {},
};

export const VoiceActionContext = createContext<VoiceActionHandlers>(defaultHandlers);

export function useVoiceActions() {
  return useContext(VoiceActionContext);
} 