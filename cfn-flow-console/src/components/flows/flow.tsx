import { Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import ReactFlow, {
  Background, BackgroundVariant, Controls,
  Edge,
  Handle,
  Node,
  NodeProps,
  NodeTypes,
  Position,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/base.css';
import 'reactflow/dist/style.css';
import { shallow } from 'zustand/shallow';
import { downloadObj, parseS3HttpUrl } from '../../apis/common';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { ReactComponent as StackSVG } from "../../images/Res_AWS-CloudFormation_Stack_48_Dark.svg";
import { openNodeEditDrawe as openNodeEditDrawer, selectNode, selectReactFlowInstance, selectSelectedFlow, selectSelectedNode, selector, setOutputRowSelectionModel, setParameterRowSelectionModel, setReactFlowInstance } from '../../stores/flows/main';
import { useStore } from './../../stores/flows/main';


const getId = () => {
  const currentTImestanmp = Date.now()
  return `node_${currentTImestanmp}`
}



export const StartNode = ({ data }: NodeProps<StartNodeData>) => {
  return (
    <>
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
      {data.parameters.filter((p) => p.visible).map((p, i) => {
        const id = `${data.nodeId}/${p.name}`
        return (
          <Handle isConnectable type='source' position={Position.Top} id={id} key={id} style={{ left: 20 * (i + 1) }} />
        )
      })}
      <Stack direction={"row"} spacing={1}>
        <StackSVG />
        <Stack direction={"column"}>
          <Typography variant={"caption"}>Region: {data.regionName}</Typography>
          <Typography variant={"body1"}>{data.nodeName}</Typography>
        </Stack>
      </Stack>
      {data.outputs.filter((o) => o.visible).map((o, i) => {
        const id = `${data.nodeId}/${o.name}`
        return (
          <Handle isConnectable type='target' position={Position.Bottom} id={id} key={id} style={{ left: 20 * (i + 1) }} />
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

  const dispatch = useAppDispatch()
  const selectedFlow = useAppSelector(selectSelectedFlow)
  // const nodes = useAppSelector(selectNodes)
  const selectedNode = useAppSelector(selectSelectedNode)

  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  // const [nodes, mergeNodes, onNodesChange] = useNodesState([]);
  // const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, mergeNodes, updateNode, initNodes, initEdges } = useStore(selector, shallow);

  // const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);
  const reactFlowInstance = useAppSelector(selectReactFlowInstance)


  useEffect(() => {
    (async () => {
      if (reactFlowWrapper.current === null || selectedFlow === null) return
      let initialNodes: Node[] = []
      let initialEdges: Edge[] = []

      const { accessLevel, baseObjname, s3PartialKey } = parseS3HttpUrl(selectedFlow.httpUrl)
      const flowBody = await downloadObj(s3PartialKey, accessLevel as "public" | "private" | "protected", "application/json")
      const flow = await JSON.parse(flowBody)
      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport
        initialNodes = flow.nodes
        initialEdges = flow.edges
      } else {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        initialNodes = [
          {
            id: '1',
            type: 'startNode',
            data: { label: 'Start', },
            position: { x: reactFlowBounds.width / 2, y: 50 },
            style: { border: '1px solid #777', padding: 10, background: "yellow" },
          },
        ];
      }


      initNodes(initialNodes)
      // initEdges([])
      initEdges(initialEdges)
    })()

  }, [])

  useEffect(() => {
    if (selectedNode === null) return
    updateNode({ ...selectedNode })
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

        // check if the dropped element is valid
        if (typeof type === 'undefined' || !type) {
          return;
        }


        if (reactFlowInstance !== null) {
          const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });
          const id = `stackNode-${getId()}`
          const data: StackNodeData = {
            nodeId: id, 
            nodeName: id,
            toolbarVisible: true, 
            nodeDeletable: true,
            regionName: "-", templateName: "",
            parameters: [],
            outputs: [],
          }
          const newNode: Node = {
            id: id,
            type: type,
            position,
            data,
            selected: false,
            selectable: true,
            style: { border: '1px solid #777', padding: 10, background: "white" },
          };

          mergeNodes([{ ...newNode }]);
          // dispatch(createNodes([...nodes, newNode]))
          console.log(nodes)
        }
      }

    },
    [reactFlowInstance]

  )

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    dispatch(setParameterRowSelectionModel([]))
    dispatch(setOutputRowSelectionModel([]))
    updateNode({ ...node, selected: true })
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
          onConnect={onConnect}
          onConnectStart={console.log}
          onConnectEnd={console.log}
          onInit={(r) => { dispatch(setReactFlowInstance(r)) }}
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