import { Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import ReactFlow, {
  Background, BackgroundVariant, Controls,
  Handle,
  Node,
  NodeProps,
  NodeTypes,
  Position,
  ReactFlowInstance,
  ReactFlowProvider, useEdgesState, useNodesState
} from 'reactflow';
import 'reactflow/dist/base.css';
import 'reactflow/dist/style.css';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { ReactComponent as StackSVG } from "../../images/Res_AWS-CloudFormation_Stack_48_Dark.svg";
import { openNodeEditDrawe as openNodeEditDrawer, selectNode, selectSelectedNode } from '../../stores/flows/main';

let id = 0;
const getId = () => `node_${id++}`;



export const StartNode = ({ data }: NodeProps<StartNodeData>) => {
  return (
    <>
      {/* <NodeToolbar isVisible={data.toolbarVisible} position={Position.Bottom}>
        <Stack direction={"row"} spacing={2}>
          <Button variant='outlined' size='small' sx={{ backgroundColor: "white" }}>edit</Button>
        </Stack>
      </NodeToolbar> */}
      <Stack direction={"row"} spacing={1}>
        <Typography variant={"body1"}>START</Typography>
      </Stack>
    </>
  )
}

export const StackNode = ({ data }: NodeProps<StackNodeData>) => {
  const dispatch = useAppDispatch()

  return (
    <>
      {/* <NodeToolbar isVisible={data.toolbarVisible} position={Position.Right}>
        <Stack direction={"column"} spacing={0} justifyContent={"left"}>
          <IconButton color="primary" size="small" onClick={() => onEditButtonClick()}>
            <EditIcon />
          </IconButton>
          <IconButton color="primary" size="small">
            <DeleteIcon />
          </IconButton>
        </Stack>
      </NodeToolbar> */}
      <Stack direction={"row"} spacing={1}>
        <StackSVG />
        <Stack direction={"column"}>
          <Typography variant={"caption"}>Region: {data.regionName}</Typography>
          <Typography variant={"body1"}>{data.nodeName}</Typography>
        </Stack>
      </Stack>
      {data.parameters.map((p, i) => {
        return (
          <Handle type='target' position={Position.Bottom} key={`${p.name}`} style={{left: 20*(i+1)}}/>
        )
      })}
    </>
  )
}

const nodeTypes: NodeTypes = {
  stackNode: StackNode,
  startNode: StartNode,
}

export default function FlowCanvas() {

  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  const dispatch = useAppDispatch()
  const selectedNode = useAppSelector(selectSelectedNode)


  useEffect(() => {
    if (reactFlowWrapper.current !== null) {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const initialNodes = [
        {
          id: '1',
          type: 'startNode',
          data: { label: 'Start', },
          position: { x: reactFlowBounds.width / 2, y: 50 },
          style: { border: '1px solid #777', padding: 10, background: "yellow" },
        },
      ];
      setNodes(initialNodes)
    }
  }, [])

  useEffect(() => {
    setNodes((nds) => 
      nds.map((n) => {
        if (selectedNode !== null && n.id === selectedNode.id) {
          return {...selectedNode}
        }
        return n
      })
    )
    console.log("update node")
  }, [selectedNode])

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

        console.log(type)

        // check if the dropped element is valid
        if (typeof type === 'undefined' || !type) {
          return;
        }

        if (reactFlowInstance !== null) {
          const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });
          const id = getId()
          const data:StackNodeData = {
            nodeName: `stackNode-${id}`, toolbarVisible: true, nodeDeletable: true,
            regionName: "-", templateName: "",
            parameters: [],
            outputs: [],
          }
          const newNode:Node = {
            id: id,
            type: type,
            position,
            data,
            style: { border: '1px solid #777', padding: 10, background: "white" },
          };

          setNodes((nds) => nds.concat(newNode));

        }
      }

    },
    [reactFlowInstance]

  )

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    console.log(event)
    console.log(node)
    setNodes((nds) => 
      nds.map((n) => {
        n.selected = n.id === node.id
        return n
      })
    )
    dispatch(selectNode(node))
    dispatch(openNodeEditDrawer())
  }

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
          onNodeClick={(e, n) => onNodeClick(e, n)}
        // attributionPosition='bottom-left'
        // defaultViewport={defaultViewport}
        >
          <Controls />
          <Background variant={BackgroundVariant.Cross} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}