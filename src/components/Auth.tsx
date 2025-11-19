



import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// FIX: Consolidate all firebase auth imports to be from the local firebase module to fix resolution errors.
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "../firebase";

import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md card-surface p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 tracking-tight mb-2">
          {isSignUp ? 'Create Your Account' : 'Welcome Back'}
        </h2>
        <p className="text-center text-slate-400 mb-8">
          {isSignUp ? 'Join to start tracking your expenses.' : 'Sign in to manage your expenses.'}
        </p>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={isSignUp ? 'signup' : 'login'}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {isSignUp ? <SignUpForm /> : <LoginForm />}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium text-amber-300 hover:text-amber-200 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SignUpForm: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!fullName.trim()) {
            setError("Full Name is required.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password should be at least 6 characters.");
            return;
        }
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user) {
              // Update auth profile
              await updateProfile(user, {
                displayName: fullName
              });
              
              // Create user document in Firestore safely
              const userDocRef = doc(db, "users", user.uid);
              await setDoc(userDocRef, {
                fullName,
                email,
                createdAt: serverTimestamp(),
              }, { merge: true });

              // Create the initial appData document to align with the rest of the app
              const appDataDocRef = doc(db, "users", user.uid, "appData", "main");
              const snapshot = await getDoc(appDataDocRef);
              if (!snapshot.exists()) {
                  const defaultAccount = { id: 'default-account-1', name: 'Personal' };
                  const initialAppData = {
                      accounts: [defaultAccount],
                      expenses: [],
                  };
                  await setDoc(appDataDocRef, initialAppData);
              }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignUp} className="space-y-4">
            <InputField id="fullName" type="text" label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <InputField id="email" type="email" label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <InputField id="password" type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <InputField id="confirmPassword" type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <AuthButton isLoading={isLoading}>Sign Up</AuthButton>
        </form>
    );
};

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-4">
            <InputField id="login-email" type="email" label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <InputField id="login-password" type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <AuthButton isLoading={isLoading}>Sign In</AuthButton>
        </form>
    );
};

interface InputFieldProps {
    id: string;
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <input 
            id={id}
            className="block w-full px-3 py-2 text-sm shadow-sm"
            {...props}
        />
    </div>
);

const AuthButton: React.FC<{isLoading: boolean, children: React.ReactNode}> = ({ isLoading, children }) => (
    <motion.button
        type="submit"
        disabled={isLoading}
        className="w-full mt-4 button animated-button disabled:opacity-70 disabled:cursor-not-allowed"
        whileHover={{ scale: isLoading ? 1 : 1.05, y: isLoading ? 0 : -2 }}
        whileTap={{ scale: isLoading ? 1 : 0.95 }}
    >
        {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : null}
        {children}
    </motion.button>
);

export default Auth;