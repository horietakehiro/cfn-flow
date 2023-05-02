import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { CircularProgress, Stack, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background, BackgroundVariant, Controls,
  Edge,
  Handle,
  Node,
  NodeProps,
  NodeResizeControl,
  Position,
  ReactFlowProvider,
  useUpdateNodeInternals
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

const nodeHandleStyle: React.CSSProperties = {
  width: "20px", height: "10px", borderRadius: "3px", backgroundColor: "red",
}

const CustomResizer = () => {
  return (
    <NodeResizeControl style={{ border: "none", }} minWidth={250} minHeight={75}>
      <OpenInFullIcon sx={{ position: "absolute", right: 5, bottom: 5, transform: "scale(-1, 1)" }} />
    </NodeResizeControl>
  )
}
export const StartNode = React.memo(({ data }: NodeProps<StartNodeData>) => {
  return (
    <>
      <Stack direction={"row"} spacing={1}>
        <Typography variant={"body1"}>START</Typography>
      </Stack>
      <Handle
        isConnectable type='target'
        position={Position.Bottom} id={data.nodeId} key={data.nodeId}
        style={nodeHandleStyle}
      />
    </>
  )
})

export const StackNode = React.memo(({ data, selected }: NodeProps<StackNodeData>) => {
  const [visibleParameters, setVisibleParameters] = React.useState<StackNodeParameter[]>([])
  const [visibleOutputs, setVisibleOutputs] = React.useState<StackNodeOutput[]>([])
  const updateNodeInternals = useUpdateNodeInternals()

  useEffect(() => {
    updateNodeInternals(data.nodeId)
  }, [data, selected])

  useEffect(() => {
    setVisibleParameters(data.parameters.filter(p => p.visible))
  }, [data.parameters])
  useEffect(() => {
    console.log(data.outputs)
    setVisibleOutputs(data.outputs.filter(o => o.visible))
  }, [data.outputs])

  const sourceHandles = useMemo(() => {
    return (
      visibleParameters.map((p, i) => {
        const id = `${data.nodeId}/${p.name}`
        return (
          <Handle isConnectable type='source' position={Position.Top} id={id} key={id} style={{ left: 20 * (i + 1) }} />
        )
      })
    )
  }, [visibleParameters])
  const targetHandles = useMemo(() => {
    return (
      visibleOutputs.map((o, i) => {
        const id = `${data.nodeId}/${o.name}`
        return (
          <Handle isConnectable type='target' position={Position.Bottom} id={id} key={id} style={{ left: 20 * (i + 1) }} />
        )
      })
    )
  }, [visibleOutputs])


  return (
    <>
      {selected && <CustomResizer />}
      {sourceHandles}
      {!data.isChild &&
        <Handle
          isConnectable type='source'
          position={Position.Top} id={`${data.nodeId}/source`} key={`${data.nodeId}/source`}
          style={nodeHandleStyle}
        />
      }
      <Stack direction={"row"} spacing={1}>
        <StackSVG />
        <Stack direction={"column"}>
          <Typography variant={"caption"}>Region: {data.regionName}</Typography>
          <Typography variant={"body1"}>{data.nodeName}</Typography>
        </Stack>
      </Stack>
      {!data.isChild &&
        <Handle
          isConnectable type='target'
          position={Position.Bottom} id={`${data.nodeId}/target`} key={`${data.nodeId}/target`}
          style={nodeHandleStyle}
        />
      }

      {targetHandles}
    </>
  )
})

export const StackSetNode = React.memo(({ data, selected }: NodeProps<StackSetNodeData>) => {
  const [visibleParameters, setVisibleParameters] = React.useState<StackNodeParameter[]>([])
  const [visibleOutputs, setVisibleOutputs] = React.useState<StackNodeOutput[]>([])
  const updateNodeInternals = useUpdateNodeInternals()

  useEffect(() => {
    updateNodeInternals(data.nodeId)
  }, [data, selected])

  useEffect(() => {
    setVisibleParameters(data.parameters.filter(p => p.visible))
  }, [data.parameters])
  useEffect(() => {
    console.log(data.outputs)
    setVisibleOutputs(data.outputs.filter(o => o.visible))
  }, [data.outputs])

  const sourceHandles = useMemo(() => {
    return (
      visibleParameters.map((p, i) => {
        const id = `${data.nodeId}/${p.name}`
        return (
          <Handle isConnectable type='source' position={Position.Top} id={id} key={id} style={{ left: 20 * (i + 1) }} />
        )
      })
    )
  }, [visibleParameters])
  const targetHandles = useMemo(() => {
    return (
      visibleOutputs.map((o, i) => {
        const id = `${data.nodeId}/${o.name}`
        return (
          <Handle isConnectable type='target' position={Position.Bottom} id={id} key={id} style={{ left: 20 * (i + 1) }} />
        )
      })
    )
  }, [visibleOutputs])

  return (
    <>
      {selected && <CustomResizer />}
      {sourceHandles}
      <Handle
        isConnectable type='source'
        position={Position.Top} id={`${data.nodeId}/source`} key={`${data.nodeId}/source`}
        style={nodeHandleStyle}
      />
      <Stack direction={"row"} spacing={1}>
        <StackSetSVG />
        <Stack direction={"column"}>
          <Typography variant={"caption"}>Regions: {data.regionNames.join(",")}</Typography>
          <Typography variant={"body1"}>{data.nodeName}</Typography>
        </Stack>
      </Stack>
      <Handle
        isConnectable type='target'
        position={Position.Bottom} id={`${data.nodeId}/target`} key={`${data.nodeId}/target`}
        style={nodeHandleStyle}
      />
      {targetHandles}
    </>
  )
})


const nodeTypes: CustomNodeTypes = {
  startNode: StartNode,
  stackNode: StackNode,
  stackSetNode: StackSetNode,
}


export default function FlowCanvas() {

  const dispatch = useAppDispatch()
  const selectedFlow = useAppSelector(selectSelectedFlow)
  // const nodes = useAppSelector(selectNodes)
  const selectedNode = useAppSelector(selectSelectedNode)

  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect, mergeNodes, updateNode, initNodes, initEdges,
  } = useStore(selector, shallow);

  const reactFlowInstance = useAppSelector(selectReactFlowInstance)

  const [inProgress, setInProgress] = React.useState<boolean>(false)

  useEffect(() => {
    (async () => {
      let initialNodes: Node[] = []
      let initialEdges: Edge[] = []
      try {
        setInProgress(true)

        if (reactFlowWrapper.current === null || selectedFlow === null) return

        const { accessLevel, baseObjname, s3PartialKey } = parseS3HttpUrl(selectedFlow.httpUrl)
        const flowBody = await downloadObj(s3PartialKey, accessLevel as "public" | "private" | "protected", "application/json")
        const flow = await JSON.parse(flowBody)
        if (flow) {
          initialNodes = flow.nodes
          initialEdges = flow.edges
        }

      } catch (e) {
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

        if (!initialNodes.some(n => n.type === "startNode")) {
          if (reactFlowWrapper.current === null || selectedFlow === null) return
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          const id = `startNode-${getNodeId()}`
          const data: StartNodeData = {
            nodeId: id,
            nodeName: id,
            nodeDeletable: false,
            toolbarVisible: false,
          }
          initialNodes.push({
            id: id,
            type: 'startNode',
            data: data,
            draggable: false,
            selectable: false,
            position: { x: reactFlowBounds.width / 2, y: 50 },
            style: { border: '1px solid #777', padding: 10, background: "yellow" },
          })
        }

        initNodes(initialNodes)
        // initEdges([])
        initEdges(initialEdges)
        console.log(initialNodes)

        setInProgress(false)
      }
    })()

  }, [])

  useEffect(() => {
    if (selectedNode === null) return

    console.log(selectedNode)
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
              isChild: false,
            }
            const newNode: StackNodeType = {
              id: id,
              type: type,
              position,
              data,
              selected: false,
              selectable: true,
              style: {
                border: '1px solid #777', padding: 10, background: "white",
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
              isChild: false,
            }
            const newNode: StackSetNodeType = {
              id: id,
              type: type,
              position,
              data,
              selected: false,
              selectable: true,
              style: {
                border: '1px solid #777', padding: 10, background: "white",
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
    if (node.type === undefined) return
    const nodeType = node.type as CustomNodeTypeName
    switch (nodeType) {
      case "startNode": {
        break
      }
      default: {
        dispatch(setParameterRowSelectionModel([]))
        dispatch(setOutputRowSelectionModel([]))
        updateNode({ ...node, selected: true })
        dispatch(selectNode(node))
        dispatch(openNodeEditDrawer())
      }
    }
    console.log(nodeType)
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
        <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ height: "100vh" }}>
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