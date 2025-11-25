import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { parseVoiceCommand } from '../utils/voiceParser';
import { Category } from '../types';

interface VoiceInputProps {
    onResult: (amount: number, name: string, category?: Category) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onResult }) => {
    const { transcript, isListening, error, isSupported, startListening, stopListening } = useVoiceRecognition();
    const [showTranscript, setShowTranscript] = useState(false);

    useEffect(() => {
        if (transcript && isListening) {
            setShowTranscript(true);
        }
    }, [transcript, isListening]);

    useEffect(() => {
        // When listening stops and we have a transcript, parse it
        if (!isListening && transcript) {
            const parsed = parseVoiceCommand(transcript);

            if (parsed.amount) {
                onResult(parsed.amount, parsed.name, parsed.category || undefined);
                setTimeout(() => setShowTranscript(false), 2000);
            }
        }
    }, [isListening, transcript, onResult]);

    const handleClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    if (!isSupported) {
        return null; // Don't show button if not supported
    }

    return (
        <div className="relative">
            <motion.button
                type="button"
                onClick={handleClick}
                className={`p-3 rounded-full transition-colors ${isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                whileTap={{ scale: 0.95 }}
                title={isListening ? 'Stop listening' : 'Voice input'}
            >
                <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                        clipRule="evenodd"
                    />
                </svg>
            </motion.button>

            {/* Transcript Display */}
            <AnimatePresence>
                {showTranscript && transcript && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-full left-0 mb-2 bg-slate-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap z-10"
                    >
                        <div className="flex items-center gap-2">
                            {isListening && (
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                            <span>{transcript}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Display */}
            {error && (
                <div className="absolute bottom-full left-0 mb-2 bg-red-900/90 text-red-200 px-3 py-2 rounded-lg shadow-lg text-xs whitespace-nowrap z-10">
                    {error}
                </div>
            )}
        </div>
    );
};

export default VoiceInput;
