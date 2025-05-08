export type VoiceIntent =
  | 'FIND_NEAREST_LAUNDROMAT'
  | 'SEARCH_LAUNDROMAT_BY_NAME'
  | 'INITIATE_BOOKING_AT_LAUNDROMAT'
  | 'BOOK_SPECIFIC_MACHINE'
  | 'UNKNOWN';

export interface IntentResult {
  intent: VoiceIntent;
  confidence: number; // 0-1
  entities?: Record<string, any>;
}

export function parseVoiceIntent(text: string): IntentResult {
  const lower = text.toLowerCase();

  // Find nearest laundromat
  if (/nearest laundromat|laundromats? near me|closest laundromat/.test(lower)) {
    return { intent: 'FIND_NEAREST_LAUNDROMAT', confidence: 0.95 };
  }

  // Search laundromat by name
  const searchMatch = lower.match(/(?:find|look for|search for) ([\w\s]+)/);
  if (searchMatch) {
    return {
      intent: 'SEARCH_LAUNDROMAT_BY_NAME',
      confidence: 0.9,
      entities: { laundromatName: searchMatch[1].trim() },
    };
  }

  // Initiate booking at laundromat
  const bookLaundromatMatch = lower.match(/book (?:a )?(?:machine|washer|dryer)? at ([\w\s]+)/);
  if (bookLaundromatMatch) {
    return {
      intent: 'INITIATE_BOOKING_AT_LAUNDROMAT',
      confidence: 0.9,
      entities: { laundromatName: bookLaundromatMatch[1].trim() },
    };
  }

  // Book specific machine (simple version)
  const bookMachineMatch = lower.match(/book (washer|dryer)? ?(\d+)? at ([\w\s]+) at ([\w\s:]+)$/);
  if (bookMachineMatch) {
    return {
      intent: 'BOOK_SPECIFIC_MACHINE',
      confidence: 0.85,
      entities: {
        machineType: bookMachineMatch[1],
        machineNumber: bookMachineMatch[2],
        laundromatName: bookMachineMatch[3].trim(),
        time: bookMachineMatch[4].trim(),
      },
    };
  }

  return { intent: 'UNKNOWN', confidence: 0.3 };
} 