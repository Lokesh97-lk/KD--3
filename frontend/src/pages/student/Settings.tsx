import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Shield, Clock, Bell, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/ui/Badge';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || 'Alex Chen');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC+05:30');
  const [inactivityMinutes, setInactivityMinutes] = useState(15);
  const [enableHeartbeats, setEnableHeartbeats] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-graphite-800 border border-graphite-600 rounded">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-lime-accent" />
            <h1 className="text-lg md:text-xl font-bold font-sans text-graphite-100">
              Workstation Settings & Preferences
            </h1>
          </div>
          <p className="text-xs font-mono text-graphite-400 mt-0.5">
            Configure telemetry timeouts, developer profile, and privacy controls
          </p>
        </div>
        <Badge variant="lime">Verified Session</Badge>
      </div>

      {saved && (
        <div className="p-3 rounded bg-status-success/15 border border-status-success/40 text-status-success text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Workstation telemetry preferences saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-5 bg-graphite-800 border border-graphite-600 rounded space-y-4">
          <h2 className="text-sm font-bold text-graphite-100 font-sans flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-lime-accent" />
            <span>Developer Profile</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-graphite-300 uppercase tracking-wider text-[11px] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-graphite-900 border border-graphite-600 rounded text-graphite-100 focus:border-lime-accent"
              />
            </div>

            <div>
              <label className="block text-graphite-300 uppercase tracking-wider text-[11px] mb-1">
                Developer Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'alex.chen@codeintellect.io'}
                className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded text-graphite-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Telemetry & Timezone Settings */}
        <div className="p-5 bg-graphite-800 border border-graphite-600 rounded space-y-4">
          <h2 className="text-sm font-bold text-graphite-100 font-sans flex items-center gap-2">
            <Clock className="w-4 h-4 text-lime-accent" />
            <span>Learning Observatory Telemetry Calibration</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-graphite-300 uppercase tracking-wider text-[11px] mb-1">
                Display Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-graphite-900 border border-graphite-600 rounded text-graphite-100 focus:border-lime-accent"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="UTC+05:30">Asia/Kolkata (IST - UTC+05:30)</option>
                <option value="America/New_York">America/New_York (EST - UTC-05:00)</option>
                <option value="Europe/London">Europe/London (GMT - UTC+00:00)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST - UTC+09:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-graphite-300 uppercase tracking-wider text-[11px] mb-1">
                Idle Inactivity Threshold (Minutes)
              </label>
              <select
                value={inactivityMinutes}
                onChange={(e) => setInactivityMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-graphite-900 border border-graphite-600 rounded text-graphite-100 focus:border-lime-accent"
              >
                <option value={5}>5 minutes (Aggressive pause)</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes (Standard default)</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-mono text-graphite-300 cursor-pointer">
              <input
                type="checkbox"
                checked={enableHeartbeats}
                onChange={(e) => setEnableHeartbeats(e.target.checked)}
                className="rounded bg-graphite-900 border-graphite-600 text-lime-accent focus:ring-0"
              />
              <span>Enable background session heartbeats (Differentiates active editing from idle tabs)</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded bg-lime-accent text-graphite-950 font-mono text-xs font-bold hover:bg-lime-bright transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
