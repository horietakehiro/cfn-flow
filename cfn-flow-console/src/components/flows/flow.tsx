import React, { useEffect, useState } from 'react';
import ReactFlow, {
  Background, BackgroundVariant, Controls, Handle,
  Node,
  NodeProps,
  NodeTypes,
  Position, ReactFlowInstance,
  ReactFlowProvider, useEdgesState, useNodesState, useUpdateNodeInternals
} from 'reactflow';

import 'reactflow/dist/style.css';
import { getTemplateSummary } from '../../apis/templates/api';

let id = 0;
const getId = () => `dndnode_${id++}`;

type StackNodeData = {
  srcTemplateName: string
}  
type StackNode = Node<StackNodeData>
export const StackNode = ({data}: NodeProps<StackNodeData>) => {

  const [parameters, setParameters] = useState<ParameterSummary[]>([])

  const updateNodeInternals = useUpdateNodeInternals()

  useEffect(() => {
    (async () => {
      try {
        const response = await getTemplateSummary(data.srcTemplateName, "Parameters")
        setParameters(response.templateSummary.summary as ParameterSummary[])
        // console.log(response.templateSummary)

      } catch(e) {
        console.error(e)
      }
    })()
  }, [])

  useEffect(() => {
    updateNodeInternals("new-test-template")
  }, [parameters])

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div>
        <label htmlFor="text">{data.srcTemplateName}</label>
        {/* <input id="text" name="text" onChange={onChange} className="nodrag" /> */}
      </div>
      {parameters.map((p, i) => {
          console.log(p.name)
          return <Handle type="source" style={{left: 20*(i+1)}} position={Position.Bottom} id={`${p.name}`} key={`${p.name}`} />
      })}
    </>
  )
}

const nodeTypes: NodeTypes = {
  stackNode: StackNode,
}

export default function FlowCanvas() {

  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  // const nodeTypes = useMemo(() => ({ stackNode: StackNode }), []);

  // const initialNodes = [
  //   {
  //     id: '1',
  //     type: 'input',
  //     data: { label: 'input node' },
  //     position: { x: 600, y: 50 },
  //   },
  // ];

  useEffect(() => {
    if (reactFlowWrapper.current !== null) {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      console.log(reactFlowBounds)
      const initialNodes = [
        {
          id: '1',
          type: 'input',
          data: { label: 'Start Node' , },
          position: { x: reactFlowBounds.width / 2, y: 50 },
        },
      ];
      setNodes(initialNodes)
    }
  }, [])

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
            type: "stackNode",
            position,
            data: { label: `${type} node`, srcTemplateName: "new-test-template" },
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
                // fitView
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                // onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                // attributionPosition='bottom-left'
                // defaultViewport={defaultViewport}
              >
                <Controls/>
                <Background variant={BackgroundVariant.Cross} />
              </ReactFlow>
            </div>
          </ReactFlowProvider>
  );
}