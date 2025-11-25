import { useState, useEffect, useCallback } from 'react';

interface VoiceRecognitionResult {
    transcript: string;
    isListening: boolean;
    error: string | null;
    isSupported: boolean;
}

export const useVoiceRecognition = () => {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recognition, setRecognition] = useState<any>(null);

    // Check browser support
    const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

    useEffect(() => {
        if (!isSupported) return;

        // Create recognition instance
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognitionInstance = new SpeechRecognition();

        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event: any) => {
            const current = event.resultIndex;
            const transcriptText = event.results[current][0].transcript;
            setTranscript(transcriptText);
        };

        recognitionInstance.onerror = (event: any) => {
            setError(`Speech recognition error: ${event.error}`);
            setIsListening(false);
        };

        recognitionInstance.onend = () => {
            setIsListening(false);
        };

        setRecognition(recognitionInstance);

        return () => {
            if (recognitionInstance) {
                recognitionInstance.stop();
            }
        };
    }, [isSupported]);

    const startListening = useCallback(() => {
        if (!recognition) {
            setError('Speech recognition not available');
            return;
        }

        setError(null);
        setTranscript('');
        setIsListening(true);

        try {
            recognition.start();
        } catch (err) {
            setError('Failed to start listening. Please try again.');
            setIsListening(false);
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
        }
    }, [recognition, isListening]);

    return {
        transcript,
        isListening,
        error,
        isSupported,
        startListening,
        stopListening,
    };
};
