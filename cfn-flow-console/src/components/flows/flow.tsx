import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { CircularProgress, Stack, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect } from 'react';
import ReactFlow, {
  Background, BackgroundVariant, Controls,
  Edge,
  Handle,
  Node,
  NodeProps,
  NodeResizeControl,
  Position,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/base.css';
import 'reactflow/dist/style.css';
import { shallow } from 'zustand/shallow';
import { downloadObj, parseS3HttpUrl } from '../../apis/common';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { ReactComponent as StackSetSVG } from "../../images/Arch_AWS-Organizations_48.svg";
import { ReactComponent as StackSVG } from "../../images/Res_AWS-CloudFormation_Stack_48_Dark.svg";
import { setAlert } from '../../stores/common';
import { openNodeEditDrawe as openNodeEditDrawer, selectNode, selectReactFlowInstance, selectSelectedFlow, selectSelectedNode, selector, setOutputRowSelectionModel, setParameterRowSelectionModel, setReactFlowInstance } from '../../stores/flows/main';
// import { CustomNodeTypeName, CustomNodeTypes, StackNodeData, StackNodeType, StackSetNodeData, StackSetNodeType } from '../../types';
import { useStore } from './../../stores/flows/main';

export const getNodeId = () => {
  const currentTImestanmp = Date.now()
  return `node_${currentTImestanmp}`
}

const CustomResizer = () => {
  return (
    <NodeResizeControl style={{border: "none", }} minWidth={250} minHeight={75}>
      <OpenInFullIcon sx={{ position: "absolute", right: 5, bottom: 5, transform: "scale(-1, 1)"}}/>
    </NodeResizeControl>
  )
}

// export const StartNode = ({ data }: NodeProps<StartNodeData>) => {
//   return (
//     <>
//       <Stack direction={"row"} spacing={1}>
//         <Typography variant={"body1"}>START</Typography>
//       </Stack>
//     </>
//   )
// }


export const StackNode = ({ data, selected }: NodeProps<StackNodeData>) => {
  const dispatch = useAppDispatch()

  return (
    <>
      {selected && <CustomResizer/>}
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

export const StackSetNode = ({ data, selected }: NodeProps<StackSetNodeData>) => {
  const dispatch = useAppDispatch()

  return (
    <>
      {selected && <CustomResizer/>}
      {data.parameters.filter((p) => p.visible).map((p, i) => {
        const id = `${data.nodeId}/${p.name}`
        return (
          <Handle isConnectable type='source' position={Position.Top} id={id} key={id} style={{ left: 20 * (i + 1) }} />
        )
      })}
      <Stack direction={"row"} spacing={1}>
        <StackSetSVG />
        <Stack direction={"column"}>
          <Typography variant={"caption"}>Regions: {data.regionNames.join(",")}</Typography>
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


const nodeTypes: CustomNodeTypes = {
  stackNode: StackNode,
  stackSetNode: StackSetNode,
}


export default function FlowCanvas() {

  const dispatch = useAppDispatch()
  const selectedFlow = useAppSelector(selectSelectedFlow)
  // const nodes = useAppSelector(selectNodes)
  const selectedNode = useAppSelector(selectSelectedNode)

  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, mergeNodes, updateNode, initNodes, initEdges } = useStore(selector, shallow);

  const reactFlowInstance = useAppSelector(selectReactFlowInstance)

  const [inProgress, setInProgress] = React.useState<boolean>(false)

  useEffect(() => {
    (async () => {
      try {
        setInProgress(true)
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
        console.log(initialNodes)
      } catch(e) {
        console.log(e)
        let errorMessage = "Failed to get flow"
        if (axios.isAxiosError(e)) {
          const response = e.response?.data
          errorMessage += ` : ${response.error}`
          dispatch(setAlert({
            persist: null, message: errorMessage,
            opened: true, severity: "error"
          }))
        }
      } finally {
        setInProgress(false)
      }
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


        if (reactFlowInstance === null) return

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const id = `${type}-${getNodeId()}`
        switch (type as CustomNodeTypeName) {
          case "stackNode": {
            const data: StackNodeData = {
              nodeId: id,
              nodeName: id,
              toolbarVisible: true,
              nodeDeletable: true,
              regionName: null, templateName: null,
              regionNames: [],
              parameters: [],
              outputs: [],
            }
            const newNode: StackNodeType = {
              id: id,
              type: type,
              position,
              data,
              selected: false,
              selectable: true,
              style: { 
                border: '1px solid #777', padding: 10, background: "white" ,
                height: 75, width: 400, 

              },
            };
            mergeNodes([{ ...newNode }]);
            break
          }
          case "stackSetNode": {
            const data: StackSetNodeData = {
              nodeId: id,
              nodeName: id,
              toolbarVisible: true,
              nodeDeletable: true,
              regionNames: [], templateName: "",
              regionName: null,
              parameters: [],
              outputs: [],
            }
            const newNode: StackSetNodeType = {
              id: id,
              type: type,
              position,
              data,
              selected: false,
              selectable: true,
              style: { 
                border: '1px solid #777', padding: 10, background: "white" ,
                height: 150, width: 600,
                backgroundColor: 'rgba(255, 0, 0, 0.2)',

              },
            };
            mergeNodes([{ ...newNode }]);
            break
          }
          default: {
            console.log(`invalid node type : ${type}`)
            break
          }
    
        }

        // dispatch(createNodes([...nodes, newNode]))
        console.log(nodes)
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

    console.log(node.position)
    console.log(node.positionAbsolute)
    console.log(node.sourcePosition)
    console.log(node.targetPosition)
    console.log(node)
    
  }

  return (
    <>
      {inProgress &&
        <CircularProgress
          size={24}
          sx={{
            // color: green[500],
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        />
      }
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
    </>
  );
}