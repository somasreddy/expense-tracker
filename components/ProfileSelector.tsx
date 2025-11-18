import React from 'react';
import { motion } from 'framer-motion';
import { Profile } from '../types';

interface ProfileSelectorProps {
  profiles: Profile[];
  currentProfileId: string | null;
  onSelectProfile: (id: string) => void;
  onManageProfiles: () => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ profiles, currentProfileId, onSelectProfile, onManageProfiles }) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <select
          value={currentProfileId || 'all'}
          onChange={(e) => onSelectProfile(e.target.value)}
          className="appearance-none block w-full pl-3 pr-10 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 transition-shadow duration-300 ease-in-out"
          aria-label="Select a profile"
        >
          <option value="all">All Profiles</option>
          {profiles.map(profile => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-300">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      <motion.button
        onClick={onManageProfiles}
        className="inline-flex justify-center py-2 px-4 border border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-200 bg-slate-700/80 hover:bg-slate-600/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
        whileHover={{ scale: 1.05, y: -2, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)" }}
        whileTap={{ scale: 0.95 }}
      >
        Manage Profiles
      </motion.button>
    </div>
  );
};

export default ProfileSelector;