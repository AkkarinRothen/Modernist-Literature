import React, { useMemo } from 'react';
// FIX: The original combined import for reactflow was causing module resolution errors.
// By separating the default component import, named component imports, and type-only imports,
// we can ensure that TypeScript resolves each correctly.
import ReactFlow, { Background, Controls } from 'reactflow';
import type { Edge, Node } from 'reactflow';
import type { ModernistInfo } from '../types';

interface CharacterRelationshipDiagramProps {
  relationships: ModernistInfo['characterRelationships'];
}

const CharacterRelationshipDiagram: React.FC<CharacterRelationshipDiagramProps> = ({ relationships }) => {
  const { nodes, edges } = useMemo(() => {
    if (!relationships || relationships.length === 0) {
      return { nodes: [], edges: [] };
    }

    // Get a unique list of all characters involved
    const characterSet = new Set<string>();
    relationships.forEach(({ character1, character2 }) => {
      characterSet.add(character1);
      characterSet.add(character2);
    });
    const uniqueCharacters = Array.from(characterSet);

    // Position nodes in a circle
    const nodeRadius = 200;
    const center = { x: 250, y: 150 };
    const angleStep = (2 * Math.PI) / uniqueCharacters.length;

    const initialNodes: Node[] = uniqueCharacters.map((char, i) => ({
      id: char,
      data: { label: char },
      position: {
        x: center.x + nodeRadius * Math.cos(i * angleStep - Math.PI / 2),
        y: center.y + nodeRadius * Math.sin(i * angleStep - Math.PI / 2),
      },
    }));

    const initialEdges: Edge[] = relationships.map(({ character1, character2, relationship }, i) => ({
      id: `e-${i}-${character1}-${character2}`,
      source: character1,
      target: character2,
      label: relationship,
      animated: true,
      type: 'smoothstep',
      markerEnd: {
        type: 'arrowclosed',
        width: 15,
        height: 15,
        color: '#a3a3a3',
      },
      style: {
        strokeWidth: 2,
        stroke: '#a3a3a3',
      },
    }));

    return { nodes: initialNodes, edges: initialEdges };
  }, [relationships]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      nodesConnectable={false}
    >
      <Background color="#e5e5e5" gap={16} />
      <Controls />
    </ReactFlow>
  );
};

export default CharacterRelationshipDiagram;
