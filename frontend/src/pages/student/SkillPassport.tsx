import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck, CheckCircle2, Share2, Copy, Check, ExternalLink, Lock } from 'lucide-react';
import { apiClient } from '../../api/client';
import { SkillEvidenceItem } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';

export const SkillPassport: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<SkillEvidenceItem[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchEvidence = async () => {
      const data = await apiClient.getSkillPassportItems();
      setItems(data);
    };
    fetchEvidence();
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(`https://codeintellect.io/passport/${user?.id || 'usr_84920'}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-graphite-800 border border-graphite-600 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-lime-accent" />
            <h1 className="text-lg md:text-xl font-bold font-sans text-graphite-100">
              Evidence-Based Skill Passport
            </h1>
          </div>
          <p className="text-xs font-mono text-graphite-400 mt-1">
            Verified technical competencies backed by immutable assessment and scenario evidence
          </p>
        </div>

        {/* Share Controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono text-graphite-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded bg-graphite-900 border-graphite-600 text-lime-accent focus:ring-0"
            />
            <span>Public Profile</span>
          </label>

          <button
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded bg-graphite-700 hover:bg-graphite-600 border border-graphite-500 text-graphite-100 font-mono text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-lime-accent" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share Passport'}</span>
          </button>
        </div>
      </div>

      {/* Developer Passport Header Profile Card */}
      <div className="p-6 rounded bg-graphite-800 border border-graphite-600 shadow-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded bg-lime-muted border border-lime-dim flex items-center justify-center text-xl font-mono font-bold text-lime-accent">
              {user?.full_name.charAt(0) || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-sans text-graphite-100">
                  {user?.full_name || 'Alex Chen'}
                </h2>
                <Badge variant="lime">Verified Engineer</Badge>
              </div>
              <div className="text-xs font-mono text-graphite-400 mt-0.5">
                ID: {user?.id || 'usr_eng_84920'} · CodeIntellect Verified since Aug 2026
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs">
            <div className="text-graphite-400 uppercase text-[10px]">Total Demonstrated Skills</div>
            <div className="text-xl font-bold text-lime-accent">{items.length} Benchmarked Primitives</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-graphite-700/80 flex items-center gap-2 text-xs font-mono text-graphite-400">
          <ShieldCheck className="w-4 h-4 text-lime-accent shrink-0" />
          <span>
            Privacy Guarantee: Hidden test suites, source code proprietary to institutions, and confidential assessments remain unexposed.
          </span>
        </div>
      </div>

      {/* List of Verified Evidence Items */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-graphite-400">
          Audited Competency Demonstrations ({items.length})
        </h3>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded bg-graphite-800 border border-graphite-600 hover:border-graphite-500 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-graphite-100 font-sans">
                    {item.skill_name}
                  </h4>
                  <Badge variant="lime">{item.verified_level}</Badge>
                  <span className="text-xs font-mono text-graphite-400">
                    Domain: {item.domain}
                  </span>
                </div>

                <div className="text-xs font-mono text-graphite-300 flex items-center gap-1.5">
                  <span className="text-graphite-400">Demonstrated Evidence:</span>
                  <span className="text-graphite-200 font-sans">{item.evidence_source}</span>
                </div>

                <div className="text-[11px] font-mono text-graphite-400 flex items-center gap-3 pt-0.5">
                  <span>Demonstrated on {item.demonstrated_at}</span>
                  <span>·</span>
                  <span className="text-lime-accent font-bold">Confidence: {item.confidence_score}%</span>
                </div>
              </div>

              <div className="shrink-0">
                <Link
                  to={item.evidence_url}
                  className="px-3.5 py-1.5 rounded bg-graphite-700 hover:bg-graphite-600 border border-graphite-500 text-graphite-100 font-mono text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Inspect Audit Proof</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
