import React from 'react';
import ReactFlow, {
  Background, BackgroundVariant, ReactFlowInstance,
  ReactFlowProvider, useEdgesState, useNodesState
} from 'reactflow';

import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
let id = 0;
const getId = () => `dndnode_${id++}`;

export default function FlowCanvas() {
  const initialNodes = [
    {
      id: '1',
      type: 'input',
      data: { label: 'input node' },
      position: { x: 250, y: 5 },
    },
  ];
  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);


  const onDragStart = (event: React.DragEvent<HTMLLIElement>, nodeType: string) => {
    if (event.dataTransfer !== null) {
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.effectAllowed = 'move';
    }
  };
  const onDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (reactFlowWrapper.current !== null) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');

        // check if the dropped element is valid
        if (typeof type === 'undefined' || !type) {
          return;
        }

        if (reactFlowInstance !== null) {
          const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });
          const newNode = {
            id: getId(),
            type,
            position,
            data: { label: `${type} node` },
          };

          setNodes((nds) => nds.concat(newNode));
        }
      }

    },
    [reactFlowInstance]

  )

  return (
          <ReactFlowProvider>
            <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ height: "80vh" }}>
              <ReactFlow
                fitView
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                // onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
              >
                <Background variant={BackgroundVariant.Cross} />
              </ReactFlow>
            </div>
          </ReactFlowProvider>
  );
}