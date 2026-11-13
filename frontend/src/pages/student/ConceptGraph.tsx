import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitFork, Search, Layers, CheckCircle2, AlertTriangle, ArrowRight, List, Share2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import { ConceptNode } from '../../types';
import { Badge } from '../../components/ui/Badge';

export const ConceptGraph: React.FC = () => {
  const [nodes, setNodes] = useState<ConceptNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchNodes = async () => {
      const data = await apiClient.getConceptNodes();
      setNodes(data);
      if (data.length > 0) setSelectedNode(data[4]); // Select Concurrency by default
    };
    fetchNodes();
  }, []);

  const filtered = nodes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-graphite-800 border border-graphite-600 rounded">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-lime-accent" />
            <h1 className="text-lg md:text-xl font-bold font-sans text-graphite-100">
              Concept Dependency Graph (Curriculum DAG)
            </h1>
          </div>
          <p className="text-xs font-mono text-graphite-400 mt-0.5">
            Explicit prerequisite hierarchy mapping blockers and recommended recovery pathways
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search concepts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-graphite-900 border border-graphite-600 rounded text-xs text-graphite-100 font-mono focus:border-lime-accent"
            />
            <Search className="w-3.5 h-3.5 text-graphite-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex border border-graphite-600 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                viewMode === 'graph' ? 'bg-graphite-700 text-lime-accent font-bold' : 'bg-graphite-900 text-graphite-400'
              }`}
            >
              Graph View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                viewMode === 'list' ? 'bg-graphite-700 text-lime-accent font-bold' : 'bg-graphite-900 text-graphite-400'
              }`}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Graph/List View (8 cols) */}
        <div className="lg:col-span-8 bg-graphite-800 border border-graphite-600 rounded p-4 flex flex-col justify-between">
          {viewMode === 'graph' ? (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[650px] py-4">
                <div className="text-[11px] font-mono text-graphite-400 mb-4 px-2">
                  Click any node to inspect prerequisite blockers and mastery evidence:
                </div>

                {/* Interactive SVG Concept Topology */}
                <svg viewBox="0 0 700 360" className="w-full h-auto">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#465360" />
                    </marker>
                    <marker id="arrow-active" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#B8E986" />
                    </marker>
                  </defs>

                  {/* Edges / Connections */}
                  <line x1="140" y1="80" x2="230" y2="80" stroke="#465360" strokeWidth="2" markerEnd="url(#arrow)" />
                  <line x1="330" y1="80" x2="420" y2="80" stroke="#465360" strokeWidth="2" markerEnd="url(#arrow)" />
                  <line x1="140" y1="120" x2="230" y2="240" stroke="#465360" strokeWidth="2" markerEnd="url(#arrow)" />
                  <line x1="330" y1="240" x2="420" y2="180" stroke="#465360" strokeWidth="2" markerEnd="url(#arrow)" />
                  <line x1="510" y1="100" x2="510" y2="150" stroke="#465360" strokeWidth="2" markerEnd="url(#arrow)" />
                  <line x1="510" y1="200" x2="580" y2="200" stroke="#465360" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />

                  {/* Nodes */}
                  {/* Node 1: Data Structures */}
                  <g onClick={() => setSelectedNode(nodes[0])} className="cursor-pointer group">
                    <rect x="40" y="55" width="100" height="50" rx="4" fill="#161B22" stroke={selectedNode?.id === 'c-vars' ? '#B8E986' : '#303B45'} strokeWidth={selectedNode?.id === 'c-vars' ? '2' : '1'} />
                    <text x="90" y="80" fill="#E8EEF2" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">Data Structs</text>
                    <text x="90" y="94" fill="#5EEA76" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">95% Mastered</text>
                  </g>

                  {/* Node 2: Pointers */}
                  <g onClick={() => setSelectedNode(nodes[1])} className="cursor-pointer group">
                    <rect x="230" y="55" width="100" height="50" rx="4" fill="#161B22" stroke={selectedNode?.id === 'c-pointers' ? '#B8E986' : '#303B45'} strokeWidth={selectedNode?.id === 'c-pointers' ? '2' : '1'} />
                    <text x="280" y="80" fill="#E8EEF2" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">Pointers/Refs</text>
                    <text x="280" y="94" fill="#5EEA76" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">88% Mastered</text>
                  </g>

                  {/* Node 3: Trees */}
                  <g onClick={() => setSelectedNode(nodes[2])} className="cursor-pointer group">
                    <rect x="420" y="55" width="100" height="50" rx="4" fill="#161B22" stroke={selectedNode?.id === 'c-trees' ? '#B8E986' : '#303B45'} strokeWidth={selectedNode?.id === 'c-trees' ? '2' : '1'} />
                    <text x="470" y="80" fill="#E8EEF2" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">Balanced Trees</text>
                    <text x="470" y="94" fill="#FFC043" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">78% In Prog</text>
                  </g>

                  {/* Node 4: Async Event Loops */}
                  <g onClick={() => setSelectedNode(nodes[3])} className="cursor-pointer group">
                    <rect x="230" y="215" width="100" height="50" rx="4" fill="#161B22" stroke={selectedNode?.id === 'c-async' ? '#B8E986' : '#303B45'} strokeWidth={selectedNode?.id === 'c-async' ? '2' : '1'} />
                    <text x="280" y="240" fill="#E8EEF2" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">Event Loops</text>
                    <text x="280" y="254" fill="#5EEA76" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">84% Mastered</text>
                  </g>

                  {/* Node 5: Concurrency & Locks */}
                  <g onClick={() => setSelectedNode(nodes[4])} className="cursor-pointer group">
                    <rect x="420" y="165" width="110" height="55" rx="4" fill="#1B222A" stroke={selectedNode?.id === 'c-concurrent' ? '#B8E986' : '#B8E986'} strokeWidth="2" />
                    <text x="475" y="192" fill="#E8EEF2" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">Thread Locks</text>
                    <text x="475" y="206" fill="#FFC043" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">62% In Progress</text>
                  </g>

                  {/* Node 6: Distributed Consensus */}
                  <g onClick={() => setSelectedNode(nodes[5])} className="cursor-pointer group">
                    <rect x="580" y="165" width="110" height="55" rx="4" fill="#161B22" stroke={selectedNode?.id === 'c-dist-mutex' ? '#B8E986' : '#FF6B6B'} strokeWidth="1.5" strokeDasharray="3" />
                    <text x="635" y="190" fill="#E8EEF2" fontSize="9.5" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">Consensus (Raft)</text>
                    <text x="635" y="205" fill="#FF6B6B" fontSize="8.5" fontFamily="JetBrains Mono" textAnchor="middle">Prereq Weak</text>
                  </g>
                </svg>
              </div>
            </div>
          ) : (
            /* Accessible List View */
            <div className="space-y-3">
              {filtered.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3 rounded border cursor-pointer transition-colors flex items-center justify-between ${
                    selectedNode?.id === node.id 
                      ? 'bg-graphite-700/80 border-lime-accent' 
                      : 'bg-graphite-900 border-graphite-700 hover:border-graphite-500'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-graphite-100 font-sans">{node.title}</div>
                    <div className="text-[11px] font-mono text-graphite-400">Category: {node.category}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-graphite-200">{node.mastery_percentage}%</span>
                    <Badge 
                      variant={node.status === 'mastered' ? 'lime' : node.status === 'in_progress' ? 'warning' : 'error'}
                    >
                      {node.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Graph Legend */}
          <div className="pt-4 border-t border-graphite-700 flex flex-wrap gap-4 text-xs font-mono text-graphite-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-status-success" /> Mastered (&gt;80%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-status-warning" /> In Progress (50-79%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-status-error" /> Weak Prerequisite (&lt;50%)</span>
          </div>
        </div>

        {/* Selected Concept Inspection Panel (4 cols) */}
        <div className="lg:col-span-4 bg-graphite-800 border border-graphite-600 rounded p-5 space-y-4">
          {selectedNode ? (
            <>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-graphite-400 font-semibold">
                  Node Diagnostic Inspector
                </span>
                <h3 className="text-base font-bold text-graphite-100 font-sans mt-1">
                  {selectedNode.title}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <Badge 
                    variant={selectedNode.status === 'mastered' ? 'lime' : selectedNode.status === 'in_progress' ? 'warning' : 'error'}
                  >
                    {selectedNode.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-xs font-mono text-graphite-400">
                    Accuracy: {selectedNode.practice_accuracy}%
                  </span>
                </div>
              </div>

              {/* Prerequisite status */}
              <div className="p-3 rounded bg-graphite-900 border border-graphite-700 text-xs font-mono space-y-2">
                <div className="text-graphite-400 uppercase text-[10px] font-bold">Prerequisite Dependencies:</div>
                {selectedNode.prerequisites.length === 0 ? (
                  <div className="text-graphite-400">Foundational primitive (0 prerequisites)</div>
                ) : (
                  selectedNode.prerequisites.map((pId) => (
                    <div key={pId} className="flex items-center justify-between text-graphite-200">
                      <span>▸ {nodes.find(n => n.id === pId)?.title || pId}</span>
                      <span className="text-lime-accent">Resolved ✓</span>
                    </div>
                  ))
                )}
              </div>

              {/* Diagnostic Evidence Details */}
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between py-1 border-b border-graphite-700">
                  <span className="text-graphite-400">Mastery Model Score</span>
                  <span className="font-mono font-bold text-lime-accent">{selectedNode.mastery_percentage}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-graphite-700">
                  <span className="text-graphite-400">Last Practiced</span>
                  <span className="font-mono text-graphite-200">{selectedNode.last_practiced}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-graphite-400">Recovery Rationale</span>
                  <span className="font-mono text-graphite-200">Spaced repetition retention</span>
                </div>
              </div>

              {/* Targeted Activity Action */}
              <div className="pt-3 border-t border-graphite-700">
                <Link
                  to="/code-lab?problem=prob-lru-cache"
                  className="w-full py-2 rounded bg-lime-accent text-graphite-950 font-mono text-xs font-bold hover:bg-lime-bright transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Launch Practice Problem</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-xs font-mono text-graphite-400">
              Select a node to inspect diagnostic evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
