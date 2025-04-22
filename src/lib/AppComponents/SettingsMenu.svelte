<!-- I like doing this global store here because of the locality -->
<script module lang="ts">
    import { writable, type Writable } from 'svelte/store'
    import {backupDelete, CircuitStore, loadCircuit} from '@CircuitStore'
    export let settingsStore: Writable<any> = writable({
        wireType: 'bezier',
        theme: 'light',
    })
</script>

<script>
    let {
        clearCanvas,
        setCanvas,
    }: { clearCanvas: Function; setCanvas: Function;} =
    $props()
    import SettingsIcon from '~icons/material-symbols/settings-outline'
    // modal menu that lets you toggle the wire type.
    // change the theme
    // let settingsVisible = false
    let show = $state(false)
    // $inspect($settingsStore).with(console.log)
    const storedSettings: string | null = localStorage.getItem('logicap-settings')
    const initialSettings = storedSettings
    ? JSON.parse(storedSettings)
    : {
        wireType: 'bezier',
        theme: 'light',
    }
    settingsStore = writable(initialSettings)
    let prevSettings = structuredClone(initialSettings)
    settingsStore.subscribe((newSettings) => {
        if(newSettings.wireType !== prevSettings.wireType) {
            deleteAndRestoreCanvas()
        }
        localStorage.setItem('logicap-settings', JSON.stringify(newSettings))
        prevSettings = structuredClone(newSettings)
    })

    //Done so the wires update on change
    function deleteAndRestoreCanvas() {
        backupDelete()
        
        CircuitStore.reset()


        clearCanvas()
        let saveDeletedTS: string = ""
        let saveDeleted: string | null = localStorage.getItem('prevCircuitStore')
        if (saveDeleted != null)
        {
            saveDeletedTS = saveDeleted
        }
        loadCircuit(saveDeletedTS)
        //Small timeout needed
        setTimeout(() => {
        setCanvas($CircuitStore.devices)
        }, 0)

    }
    let hasKitty = $state(false)
</script>

<button class="launch-button" onclick={() => (show = !show)}>
    <SettingsIcon height={30} width={30} />
</button>
{#if show}
    <div class="modal">
        <h2>Settings</h2>

        <div style="display:flex;justify-content:center;align-items:center;">
            <p style="margin-right:auto">Default Wires:</p>

            <!-- Icons under the option would be cool -->
            <select id="wire-type-select" bind:value={$settingsStore.wireType}>
                <option value="bezier">Bezier</option>
                <option value="step">Step</option>
                <option value="straight">Straight</option>
            </select>
        </div>

        <div>
            <p>Theme:</p>
            <select id="theme-select" bind:value={$settingsStore.theme}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>

        <div
            style="display:flex;flex-direction: row;justify-content: space-between;width: 100%;margin-bottom:-25px;margin-top:5px;"
        >
            <button
                class="kittyBtn"
                onclick={() => {
                    const kittyElement: HTMLElement | null =
                        document.querySelector('#kitty')
                    // if the kitty has not been spawned before.
                    if (kittyElement) {
                        if (hasKitty) {
                            kittyElement.style.display = 'none'
                            // kittyElement.remove()
                            hasKitty = false
                        } else {
                            kittyElement.style.display = 'unset'
                            hasKitty = true
                        }
                    } else {
                        // create the element for the first time

                        // This function is injected into the code via, index.html
                        //@ts-ignore
                        herekittykittykitty('Furnando')
                        hasKitty = true
                    }
                }}>{hasKitty ? 'Despawn Kitty' : 'Spawn Kitty'}</button
            >
            <button
                class="closeBtn"
                onclick={(e: MouseEvent) => {
                    e.stopPropagation()
                    show = false
                }}>Close Menu</button
            >
        </div>
        <br />
    </div>
{/if}

<style>
    :root {
        --settings-menu-spacing: 5px;
    }
    .launch-button {
        cursor: pointer;
        border-width: 4px;
        border-radius: 999px;
        position: absolute;
        background-color: var(--lightblue);
        padding: var(--settings-menu-spacing);
        right: 10px;
        bottom: 10px;
        z-index: 20;
        /* width: 20px; */
        /* height: 20px; */
    }
    .modal {
        border: 5px solid black;
        border-radius: 10px;
        padding: 10px;
        background: var(--lightblue);
        width: 300px;
        z-index: 20;
        position: absolute;
        top: 45%;
        left: calc(50% + 100px);
        transform: translate(-50%, -50%);
    }
    .modal h2 {
        font-size: 2rem !important;
        color: black;
        -webkit-text-stroke: unset;
        transform: translateY(-13px);
        margin-bottom: -20px;
    }
    .modal div {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .modal div p {
        margin-right: auto;
    }
    .modal select {
        width: 40%;
    }
    .kittyBtn {
        /* float is a magic property and the conditions for it working are determined by a higher power.*/
        margin-top: calc(var(--settings-menu-spacing) + 2px);
    }
    .closeBtn {
        margin-top: calc(var(--settings-menu-spacing) + 2px);
        margin-right: -4px;
        padding-inline: 3px;
    }
</style>
