'use client';

import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CustomNode from './CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

interface MindMapEditorProps {
  initialData: {
    nodes: Node[];
    edges: Edge[];
  };
  onReset: () => void;
}

export default function MindMapEditor({ initialData, onReset }: MindMapEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData.edges);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<Record<string, any>>({});
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6366f1', strokeWidth: 2 },
    }, eds)),
    [setEdges]
  );

  const handleVerifyAll = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify-medical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes }),
      });

      if (!response.ok) throw new Error('Verification failed');

      const results = await response.json();
      setVerificationResults(results);

      // Update nodes with verification status
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            verification: results[node.id],
          },
        }))
      );
    } catch (err) {
      alert('Failed to verify medical accuracy');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRegenerateNode = async (nodeId: string) => {
    try {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const response = await fetch('/api/regenerate-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node }),
      });

      if (!response.ok) throw new Error('Regeneration failed');

      const { newContent, sources } = await response.json();

      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  label: newContent,
                  sources,
                  verification: { verified: true, confidence: 'high' },
                },
              }
            : n
        )
      );
    } catch (err) {
      alert('Failed to regenerate node');
    }
  };

  const handleNodeEdit = (nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
  };

  const handleAddNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        label: 'New Concept',
        onEdit: handleNodeEdit,
        onRegenerate: handleRegenerateNode,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleDeleteNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode && e.target !== selectedNode));
      setSelectedNode(null);
    }
  };

  const exportAsJPEG = async () => {
    if (!reactFlowWrapper.current) return;

    try {
      const canvas = await html2canvas(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = 'mindmap.jpg';
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (err) {
      alert('Failed to export as JPEG');
    }
  };

  const exportAsPDF = async () => {
    if (!reactFlowWrapper.current) return;

    try {
      const canvas = await html2canvas(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save('mindmap.pdf');
    } catch (err) {
      alert('Failed to export as PDF');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="bg-white shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Mind Map Editor</h2>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Upload New PDF
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddNode}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            + Add Node
          </button>
          <button
            onClick={handleDeleteNode}
            disabled={!selectedNode}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Node
          </button>
          <button
            onClick={handleVerifyAll}
            disabled={isVerifying}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Verify Medical Accuracy'}
          </button>
          <div className="flex gap-2 ml-4">
            <button
              onClick={exportAsJPEG}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              Export JPEG
            </button>
            <button
              onClick={exportAsPDF}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div ref={reactFlowWrapper} className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNode(node.id)}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-lg">
            <div className="text-sm">
              <div className="font-semibold mb-2">Legend:</div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Verified</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Needs Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span>Not Verified</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
