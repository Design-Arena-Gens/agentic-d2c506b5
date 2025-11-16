'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface CustomNodeData {
  label: string;
  verification?: {
    verified: boolean;
    confidence: 'high' | 'medium' | 'low';
    sources?: string[];
  };
  sources?: string[];
  onEdit?: (nodeId: string, newLabel: string) => void;
  onRegenerate?: (nodeId: string) => void;
}

function CustomNode({ id, data }: NodeProps<CustomNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [showSources, setShowSources] = useState(false);

  const handleEdit = () => {
    setIsEditing(false);
    if (data.onEdit && label !== data.label) {
      data.onEdit(id, label);
    }
  };

  const getBackgroundColor = () => {
    if (!data.verification) return '#f3f4f6';
    if (data.verification.verified && data.verification.confidence === 'high') return '#d1fae5';
    if (data.verification.verified && data.verification.confidence === 'medium') return '#fef3c7';
    return '#fee2e2';
  };

  const getBorderColor = () => {
    if (!data.verification) return '#9ca3af';
    if (data.verification.verified && data.verification.confidence === 'high') return '#10b981';
    if (data.verification.verified && data.verification.confidence === 'medium') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div
      className="px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] max-w-[300px]"
      style={{
        backgroundColor: getBackgroundColor(),
        borderColor: getBorderColor(),
      }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      {isEditing ? (
        <textarea
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleEdit();
            }
          }}
          className="w-full p-2 border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={3}
          autoFocus
        />
      ) : (
        <div
          className="text-sm font-medium text-gray-800 cursor-text whitespace-pre-wrap"
          onDoubleClick={() => setIsEditing(true)}
        >
          {data.label}
        </div>
      )}

      {data.verification && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span
            className={`px-2 py-1 rounded ${
              data.verification.verified
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {data.verification.verified ? '✓ Verified' : '⚠ Unverified'}
          </span>
          {data.verification.confidence && (
            <span className="text-gray-600">
              {data.verification.confidence} confidence
            </span>
          )}
        </div>
      )}

      <div className="mt-2 flex gap-1">
        {data.sources && data.sources.length > 0 && (
          <button
            onClick={() => setShowSources(!showSources)}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
          >
            {showSources ? 'Hide' : 'Show'} Sources
          </button>
        )}
        {data.onRegenerate && (
          <button
            onClick={() => data.onRegenerate!(id)}
            className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
          >
            Regenerate
          </button>
        )}
      </div>

      {showSources && data.sources && (
        <div className="mt-2 p-2 bg-white rounded text-xs border">
          <div className="font-semibold mb-1">Sources:</div>
          {data.sources.map((source, idx) => (
            <div key={idx} className="mb-1">
              <a
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {source}
              </a>
            </div>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

export default memo(CustomNode);
