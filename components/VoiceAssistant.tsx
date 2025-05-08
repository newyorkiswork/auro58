"use client";
import { useEffect, useRef, useState } from 'react';
import { VoiceClient, getAudioStream } from '@humeai/voice';
import { parseVoiceIntent, IntentResult } from '@/lib/voiceIntentParser';
import { useVoiceActions } from '@/components/voice/VoiceActionContext';

const HUME_API_KEY = process.env.NEXT_PUBLIC_HUME_API_KEY;

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<any>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const actions = useVoiceActions();

  useEffect(() => {
    if (!listening) return;
    if (!HUME_API_KEY) {
      setError('Hume API key is missing.');
      setListening(false);
      return;
    }
    let cancelled = false;
    let stream: MediaStream | null = null;

    async function startTranscription() {
      setError(null);
      try {
        stream = await getAudioStream();
        if (cancelled) return;
        const client = VoiceClient.create({
          hostname: 'wss://api.hume.ai/v0/voice',
          reconnectAttempts: 3,
          debug: false,
          auth: { type: 'apiKey', value: HUME_API_KEY as string },
        });
        clientRef.current = client;

        client.on('open', () => {
          // Start streaming audio to Hume
          const mediaRecorder = new MediaRecorder(stream!);
          recorderRef.current = mediaRecorder;
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              event.data.arrayBuffer().then(buffer => {
                client.sendAudio(buffer);
              });
            }
          };
          mediaRecorder.start(250); // send audio every 250ms
        });

        client.on('message', (message: any) => {
          // Check if this is a transcript message
          if (message?.type === 'assistant_message' && message?.message?.content) {
            const text = message.message.content;
            setTranscript(text);
            const intent = parseVoiceIntent(text);
            setIntentResult(intent);
            // Trigger app actions based on intent
            if (intent.intent === 'FIND_NEAREST_LAUNDROMAT') {
              actions.findNearestLaundromat();
              setFeedback('Finding laundromats near you...');
            } else if (intent.intent === 'SEARCH_LAUNDROMAT_BY_NAME' && intent.entities?.laundromatName) {
              actions.searchLaundromatByName(intent.entities.laundromatName);
              setFeedback(`Searching for "${intent.entities.laundromatName}"...`);
            } else if (intent.intent === 'INITIATE_BOOKING_AT_LAUNDROMAT' && intent.entities?.laundromatName) {
              actions.initiateBookingAtLaundromat(intent.entities.laundromatName);
              setFeedback(`Starting booking at "${intent.entities.laundromatName}"...`);
            } else if (intent.intent === 'BOOK_SPECIFIC_MACHINE' && intent.entities?.laundromatName) {
              actions.bookSpecificMachine({
                laundromatName: intent.entities.laundromatName,
                machineType: intent.entities.machineType,
                machineNumber: intent.entities.machineNumber,
                time: intent.entities.time,
              });
              setFeedback(`Booking ${intent.entities.machineType || 'machine'} ${intent.entities.machineNumber || ''} at "${intent.entities.laundromatName}" for ${intent.entities.time || 'the selected time'}...`);
            } else if (intent.intent === 'UNKNOWN') {
              setFeedback('Sorry, I did not understand that. Please try again.');
            } else {
              setFeedback(null);
            }
          }
        });

        client.on('error', (err: any) => {
          setError('Hume SDK error: ' + (err?.message || err));
          setListening(false);
        });

        client.connect();
      } catch (err: any) {
        setError('Microphone error: ' + (err?.message || err));
        setListening(false);
      }
    }
    startTranscription();
    return () => {
      cancelled = true;
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
      if (recorderRef.current) {
        recorderRef.current.stop();
        recorderRef.current = null;
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [listening, actions]);

  function handleStart() {
    setTranscript('');
    setIntentResult(null);
    setFeedback(null);
    setError(null);
    setListening(true);
  }
  function handleStop() {
    setListening(false);
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
  }

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg p-4 w-80 z-50 border border-blue-200">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-3 h-3 rounded-full ${listening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
        <span className="font-semibold">Voice Assistant</span>
      </div>
      <div className="mb-3 min-h-[2.5em] text-gray-700 text-sm bg-gray-50 rounded p-2">
        {transcript || (listening ? 'Listening...' : 'Click start to speak.')}
      </div>
      {intentResult && (
        <div className="mb-2 text-xs text-blue-700 bg-blue-50 rounded p-2">
          <div>Intent: <b>{intentResult.intent}</b> (conf: {intentResult.confidence.toFixed(2)})</div>
          {intentResult.entities && (
            <div>Entities: {JSON.stringify(intentResult.entities)}</div>
          )}
        </div>
      )}
      {feedback && <div className="mb-2 text-xs text-green-700 bg-green-50 rounded p-2">{feedback}</div>}
      {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
      <div className="flex gap-2">
        {!listening ? (
          <button onClick={handleStart} className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Start Listening</button>
        ) : (
          <button onClick={handleStop} className="flex-1 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">Stop</button>
        )}
      </div>
    </div>
  );
} 