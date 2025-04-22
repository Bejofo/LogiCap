import { writable, type Writable } from 'svelte/store'

export let rotationStore: Writable<Record<string, number>> = writable({})

export function loadRotationLS() {
    const rotationMapRaw: string | null = localStorage.getItem('node-rotations')
    if(rotationMapRaw)
    {
        const rotationMap: Record<string, number> = JSON.parse(rotationMapRaw)
        rotationStore.set(rotationMap)
    }
}

export function updateRotation(map: Record<string, number>) {
    rotationStore.set(map)
    localStorage.setItem('node-rotations', JSON.stringify(map))
}
