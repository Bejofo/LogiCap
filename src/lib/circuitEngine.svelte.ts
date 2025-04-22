import { CircuitStore } from '@CircuitStore'
import { Vector3vl } from '3vl'
import { writable, get, type Writable } from 'svelte/store';
import { CustomHeadlessCircuit } from '@Util/CustomHeadlessCircuit';

//Two Vectors, both 1 bit, one is on (1) and off (0)
let oneBit: Vector3vl = Vector3vl.ones(1);
let zeroBit: Vector3vl = Vector3vl.zeros(1);

export let CircuitEngine: Writable<CustomHeadlessCircuit | null> = writable<CustomHeadlessCircuit | null>(null); //The null might be a little schizo

// this is why we want circuitEngine.svelte.ts
let running: boolean = $state(false)
export let monitoredWires: Set<string> = new Set() //For reupping on change

export const getRunning = () => running

// Naurr
export let wireSignals = writable<Record<string, number>>({}); //Wire signal store

let currentTick = $state(0)
export const getCurrTick = () => currentTick

Object.defineProperty(CustomHeadlessCircuit.prototype, "running", {
    get() {
        //console.warn("Overriding `running` getter at runtime.");
        //This was here to prevent some weird error of it failing to access running
        //Its safe as HeadlessCircuit always returns false anyways but this may not be needed anymore?
        return false;
    }
});
/*
    Possibly better way to do this, for now im just reattaching all monitors
    Need to also destroy old monitors in case
*/

/*
    Toggles running
*/
export function toggleSimulation(tickRate: number) {

    if (!running) {
        console.log("Simulation Started")

        running = true;
        if (get(CircuitEngine) === null) {
            console.log(get(CircuitStore));
            CircuitEngine.set(new CustomHeadlessCircuit(get(CircuitStore)))
        }
        start(tickRate)
    }
    else {
        console.log("Simulation Stopped")
        // reset on pause, is not necessarily a move.
        CircuitEngine.set(null)
        currentTick = 0
        running = false;
    }
}

/*
    Basically how other non headless circuits run like in engines.mjs
*/
function start(tickRate: number) {
    // you shouldn't ever run this function when running is false.
    if (running === false) {
        return;
    }
    const currEngine: CustomHeadlessCircuit | null = get(CircuitEngine)
    if (currEngine === null) {
        console.log("impossible");
        return
    }
    currEngine.updateGates()
    currentTick = currEngine.tick;
    setTimeout(() => start(tickRate), tickRate);
}

export function resetCircuit() {
    CircuitEngine.set(null)
    currentTick = 0
    running = false;
}

export function findWireInEngine(
    digitalJsCircuit: CustomHeadlessCircuit,
    wireId: string
) {
    let currWire = digitalJsCircuit?.findWireByLabel(wireId)
    if (!currWire) {
        console.warn(
            'Wire not created yet on headless circuit creation or update'
        )
        return null
    }
    return currWire
}

/*
    Adds to monitorList
*/
// export function addMonitor(wireId: string) {
//     if (!monitoredWires.has(wireId)) {
//         monitoredWires.add(wireId);
//         wireMonitoring(wireId);
//     }
// }

/*
    This is just to make less annoying by passing in id instead of a wire object
*/

export function onWireChange(wire: any) {
    let logicValue: number
    if (wire.attributes.signal) {
        if (
            wire.attributes.signal._avec[0] ==
            wire.attributes.signal._bvec[0]
        ) {
            logicValue = wire.attributes.signal._avec[0]
        } else {
            logicValue = -1
        }
        // console.log(
        //     `${wireId} has changed signal to ${logicValue} at tick ${tick}`
        // )
        return logicValue
    }
    return -1
}


/*
    These are all just wrappers for the baseline updateGate functions
    These do not work, making this work would require updating the JointJS graph directly
    If not, no changes will be saved when these are ran
*/

export function updateTick() {
    return
    /*
    if (CircuitEngine == null) {
        console.log("Circuit is null")
        return;
    }
    const currEngine: CustomHeadlessCircuit | null = get(CircuitEngine)
    if (currEngine === null) {
        console.log("impossible");
        return
    }
    currEngine.updateGates();
    currentTick = currEngine.tick;
    */
}

export function updateNext() {
    return
    /*
    if (CircuitEngine == null) {
        console.log("Circuit is null")
        return;
    }
    const currEngine: CustomHeadlessCircuit | null = get(CircuitEngine)
    if (currEngine === null) {
        console.log("impossible");
        return
    }
    currEngine.updateGatesNext();
    currentTick = currEngine.tick;
    */
}


/*
Flips 1 bit inputs and takes their name as a string
*/
export function inputSetter(inputName: string) {
    let currentSig: number;
    if (CircuitEngine == null) {
        console.log("Circuit is null")
        return;
    }

    const currEngine: CustomHeadlessCircuit | null = get(CircuitEngine)
    if (currEngine === null) {
        console.log("impossible");
        return
    }
    currentSig = currEngine.getLabelIndex().devices[inputName].attributes.outputSignals.out._avec[0];
    if (currentSig == 1) {
        currEngine.setInput(inputName, zeroBit);
    }
    else {
        currEngine.setInput(inputName, oneBit);
    }
}
