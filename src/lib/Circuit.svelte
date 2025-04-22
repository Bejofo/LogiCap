<script lang="ts">
    import { Node } from 'svelvet'
    import { rerenderInputAnchorHack } from '@src/lib/Util/cursors'
    import { setContext, type Component } from 'svelte'
    import {
        getComponent,
        type AllNodeProps,
        type AllNodePropsWithoutId,
        type allNodeTypes,
    } from '@CircuitModel'
    import { rejectMoveClick } from './Util/cursors'
    import { get } from 'svelte/store'
    import { rotationStore, updateRotation} from './rotationStore.ts'

    import { CircuitStore } from '@CircuitStore'
    import { getRunning } from './circuitEngine.svelte'


    // props that all nodes have in common.
    interface SimNodeProps {
        nodeId: string
        gateType: allNodeTypes
        position: { x: number; y: number } | undefined
        nodeProps: AllNodePropsWithoutId
    }
    // type should be only props that are not shared.

    // data: T[]
    // children: Snippet
    // row: Snippet<[T]>
    let { nodeId, gateType, position, nodeProps }: SimNodeProps = $props()
    // Separate gateType from the rest of the props

    // Create a function to get the component based on type

    // Use $derived for reactive value
    // do I even need this derived? Nah
    let nodeComponent = $derived(getComponent(gateType))
    const getRotation: () => number = () => {
        const rotationMap: Record<string, number> = get(rotationStore)
        if(rotationMap[nodeId] != null) {
            return rotationMap[nodeId]
        }
        return 0
    }
    let rotation: number = $state(getRotation())

    const nodeAction = (e: MouseEvent) => {
        const clickedEle = e.target as HTMLElement
        // console.log(e.target)
        if (!clickedEle) {
            console.warn('no event target on node click')
        } else if (
            clickedEle.nodeName !== 'IMG' &&
            clickedEle.parentNode?.nodeName !== 'svg'
        ) {
            console.warn(
                'not a part of the node to preform a node action, in this case "rotate" '
            )
        } else {
            rotation = (rotation + 90) % 360
            const rotationMap: Record<string, number> = get(rotationStore)
            rotationMap[nodeId] = rotation
            updateRotation(rotationMap)
 
        }
    }



    setContext('rotation', getRotation)
    // #TODO tell the nodes NSEW. when changing direction
    // this solution is better. just need to fine tune it a bit.
    // its hacky but our data persists, vs with a {key } block we have rerender
    $effect(() => {
        // this if statement is weird bc effect is weird.
        // this code will run whenever rotation changes.
        if (rotation || rotation === 0) {
            if (nodeId.startsWith('Lamp')) {
                rerenderInputAnchorHack('in_' + nodeId)
                return
            }

            rerenderInputAnchorHack('out_' + nodeId)
            rerenderInputAnchorHack('in1_' + nodeId)
            rerenderInputAnchorHack('in2_' + nodeId)
            const outputConnections =
                get(CircuitStore).connectors[
                    ('out_' + nodeId) as outputAnchorName
                ]
            if (outputConnections && outputConnections.length > 0) {
                outputConnections.forEach(([_, inAnc]) => {
                    // console.warn(inAnc)
                    rerenderInputAnchorHack(inAnc)
                })
            }
        }
    })
</script>

<!-- I added this here because I kept changing the SvelvetNode properties in all
of the different components now I just need to do it here -->
{#snippet wrapInSvelvetNode(MyComponent: Component<AllNodeProps>)}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- Wow finally somewhere where key block solves a problem-->
    <Node
        drop={position !== undefined ? false : 'cursor'}
        {position}
        editable={false}
        id={nodeId}
    >
        <div
            onmousedown={(e: MouseEvent) => {
                if (!getRunning()) {
                    rejectMoveClick(e, nodeAction)
                }
            }}
            style="transform:rotate({rotation}deg)"
        >
            <MyComponent {nodeId} {...nodeProps} />
        </div>
    </Node>
{/snippet}

{#if nodeComponent}
    <!-- svelte-ignore svelte_component_deprecated -->
    {@render wrapInSvelvetNode(nodeComponent)}
{:else}
    <!-- Optional fallback -->
    <div>Unknown gate type: {gateType}</div>
{/if}

<style>
    /* only for logic gates */
    /* add outline and gray color on light mode */
    /* warning, if you want to edit node properties directly, you should probably go into the svg files and set certain classes. 
        otherwise the css will mess with some of the nodes.
    */
    /* if you want this css to not impact a certain node. I would put a specific class on that node and add a :not() pseudoselector to this css rule */
    :global(.light .svelvet-node svg) {
        /* to change the color from black to literally anything use the link below */
        /* https://isotropic.co/tool/hex-color-to-css-filter/ */
        /* filter: drop-shadow(-1px -1px 0px black) drop-shadow(1px -1px 0px black) */
        /*     drop-shadow(1px 1px 0px black) drop-shadow(-1px 1px 0px black); */
        /* white + black */
        filter: drop-shadow(1px 0 0 white) drop-shadow(-1px 0 0 white)
            drop-shadow(0 1px 0 white) drop-shadow(0 -1px 0 white)
            drop-shadow(1px 0 0 black) drop-shadow(-1px 0 0 black)
            drop-shadow(0 -1px 0 black) drop-shadow(0 1px 0 black);
    }
    :global(.dark .svelvet-node svg) {
        filter: unset;
    }
</style>
