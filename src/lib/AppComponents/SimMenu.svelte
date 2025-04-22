<script lang="ts">
    import type { Component } from 'svelte'

    import {
        CircuitStore,
        saveCircuit,
        backupDelete,
        downloadCircuit,
        uploadCircuit,
    } from '@CircuitStore'
    import {
        toggleSimulation,
        updateNext,
        updateTick,
        getRunning,
        getCurrTick,
    } from '@CircuitEngine'

    import UpdateGatesNextIcon from '~icons/streamline/button-fast-forward-2'
    import PlayTickIcon from '~icons/streamline/button-play'
    import ResetStateIcon from '~icons/streamline/interface-arrows-synchronize-arrows-loading-load-sync-synchronize-arrow-reload'
    import PauseTickIcon from '~icons/streamline/button-pause-2'
    import UpdateGatesIcon from '~icons/streamline/entertainment-control-button-next-button-television-buttons-movies-skip-next-video-controls'
    import SaveIcon from '~icons/lucide/save'
    import TrashIcon from '~icons/material-symbols/delete-outline'
    import ButtonNode from '../Circuits/InputOutputNodes/ButtonNode.svelte'
    import LoadIcon from '~icons/lucide/upload'
    import { rotationStore, updateRotation } from '../rotationStore.ts'

    type Icon = { Component: Component<any>; width: number }
    type IconName = string

    type SimMenuModel = Record<IconName, Icon>

    let {
        clearCanvas,
        setCanvas,
    }: { clearCanvas: Function; currCircuitName: string; setCanvas: Function } =
        $props()

    const simMenuModel: SimMenuModel = {
        playTick: {
            Component: PlayTickIcon,
            width: 40,
        },
        pauseTick: {
            Component: PauseTickIcon,
            width: 40,
        },
        updateGates: {
            Component: UpdateGatesIcon,
            width: 40,
        },
        updateGatesNext: {
            Component: UpdateGatesNextIcon,
            width: 40,
        },
        save: {
            Component: SaveIcon,
            width: 40,
        },
        trash: {
            Component: TrashIcon,
            width: 40,
        },
        load: {
            Component: LoadIcon,
            width: 40,
        },
    }

    const toggleRunningClass = () => {
        const appMainTag: Element | null = document.querySelector('#logicap')
        if (!appMainTag) return // impossible

        if (appMainTag.classList.contains('running')) {
            appMainTag.classList.remove('running')
            turnOffLamps()
        } else {
            appMainTag.classList.add('running')
        }
    }

    function turnOffLamps() {
        let circleElement: SVGElement | null
        let lineElement: SVGElement | null
        const lampOffColors: string[] = ['red', 'var(--lime-red)']
        const lamps: NodeListOf<HTMLElement> | null =
            document.querySelectorAll("[id^='N-Lamp']")
        if (lamps === null) {
            return
        }
        lamps.forEach((lamp) => {
            circleElement = lamp.querySelector('circle')
            lineElement = lamp.querySelector('line')
            if (circleElement === null || lineElement === null) return
            circleElement.setAttribute('stroke', lampOffColors[1])
            circleElement.setAttribute('fill', lampOffColors[0])
            lineElement.setAttribute('stroke', lampOffColors[0])
        })
    }

    // button click functions
    function toggleRunSim(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
    ) {
        toggleRunningClass()
        toggleSimulation(10)
    }

    function updateGatesNext(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
    ) {
        updateNext()
    }
    function updateGates(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
    ) {
        updateTick()
    }

    function circuitDownload(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
    ) {
        const currCircuitName = localStorage.getItem('currActiveTab')
        if (!currCircuitName)
            return (
                console.log(
                    'could not download because current active tab name is null'
                ),
                null
            )
        downloadCircuit(currCircuitName)
    }

    async function circuitUpload(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
    ) {
        localStorage.removeItem('node-rotations')
        if(getRunning())
        {
            toggleRunningClass()
            toggleSimulation(10)
        }
        await uploadCircuit()
        setCanvas($CircuitStore.devices)
    }

    function onTrash() {
        backupDelete()

        CircuitStore.reset()
        const empty: Record<string, number> = {}
        updateRotation(empty)


        // clears the currentDevicesData variable in app.svelte
        clearCanvas()
    }

    // const defaultOptions: any =
</script>

{#snippet simIcon({ ...iconProps })}
    <iconProps.Component style={iconProps.styles} width="30px" height="100%" />
{/snippet}

{#snippet simMenuBtn(
    iconProps: Icon,
    onClickFn: Function,
    tooltipTitle: string = 'tooltipTest',
    btnStyles: string = ''
)}
    <button style={btnStyles} title={tooltipTitle} onclick={() => onClickFn()}>
        {@render simIcon(iconProps)}
    </button>
{/snippet}

{#snippet playPauseSection(simToggle: Function)}
    <button
        onclick={() => simToggle()}
        style="display:flex;align-items: center;padding-block:2px;"
        title={getRunning() ? 'Pause Simulation' : 'Play Simulation'}
    >
        <div style="margin-right:2px;transform:scale(0.85)">
            {#if getRunning()}
                {@render simIcon(simMenuModel['pauseTick'])}
            {:else}
                {@render simIcon(simMenuModel['playTick'])}
            {/if}
        </div>
        <!-- box that shows the current tick -->
        <p
            style={getRunning() ? 'border-color:green' : 'border-color:red'}
            id="tickNumber"
        >
            {getCurrTick()}
        </p>
    </button>
{/snippet}

<div class="floatingMenu">
    <div class="menuRunButtons">
        {@render playPauseSection(toggleRunSim)}

        <span class="vl"></span>
        {@render simMenuBtn(
            simMenuModel['updateGates'],
            updateGates,
            'update gates'
        )}
        <span class="vl"></span>
        {@render simMenuBtn(
            simMenuModel['updateGatesNext'],
            updateGatesNext,
            'update gates next'
        )}

        <span class="vl"></span>
        <!-- <span class="vl"></span> -->
        {@render simMenuBtn(simMenuModel['trash'], onTrash, 'Clear Tab')}
    </div>

    <div class="editBtnSection">
        {@render simMenuBtn(
            simMenuModel['save'],
            circuitDownload,
            'download circuit json'
        )}
        <span class="vl" style="margin-block:4px"></span>
        {@render simMenuBtn(
            simMenuModel['load'],
            circuitUpload,
            'upload circuit json file'
        )}
    </div>
</div>

<style>
    .editBtnSection {
        display: flex;
        justify-content: space-evenly;
        margin-left: 10px;
        padding-inline: 8px;
        background-color: var(--lightblue);
        border: 3px solid black;
        border-radius: 5px;
    }
    .menuRunButtons {
        display: flex;
        justify-content: space-evenly;
        align-items: stretch;
        padding-inline: 5px;
        background-color: var(--lightblue);
        border-radius: 5px;
        border: 3px solid black;
        padding-block: 4px;
    }
    .floatingMenu {
        position: absolute;
        /*    the side menu width should be 22.5% of the main app flexbox */
        left: calc(22.5% + 10px);
        top: 10px;
        height: 40px;
        z-index: 300;
        display: flex;
        justify-content: center;
    }

    .vl {
        border: 1px solid black;
        border-radius: 4px;
        background-color: var(--lightblue);
        width: 5px;
        margin-block: 0px;
        margin-inline: 8px;
    }
    .menuRunButtons p {
        background-color: white;
        text-align: right;
        border: 3px solid black;
        border-radius: 5px;
        font-size: 1.3rem;
        padding-inline: 5px;
        min-width: 60px;
        margin-block: 4px;
    }
    button {
        /* padding: 8px; */
        border: none;
        background-color: var(--lightblue);
    }
    :global(.floatingMenu button:hover svg) {
        color: red;
    }
</style>
