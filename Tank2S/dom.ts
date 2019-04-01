
namespace DOM {
    export let textureLoaded = false;
    let soundEnabled = localStorage.getItem("tank-sound-enabled") == "true";
    export const elements = {
        texture: <HTMLImageElement> null,
        field: <HTMLCanvasElement> null,
        tank0panel: <HTMLElement> null,
        tank1panel: <HTMLElement> null,
        main: <HTMLElement> null,
        result: <HTMLElement> null,
        resultTitle: <HTMLElement> null,
        resultMessage: <HTMLElement> null,
        avatar0: <HTMLImageElement> null,
        avatar1: <HTMLImageElement> null,
        playerName0: <HTMLElement> null,
        playerName1: <HTMLElement> null,
        playerData0: <HTMLElement> null,
        playerData1: <HTMLElement> null,
        shootSound: <HTMLAudioElement> null,
        victorySound: <HTMLAudioElement> null,
        destroySound: <HTMLAudioElement> null,
        destroyLargeSound: <HTMLAudioElement> null,
        selectSound: <HTMLAudioElement> null,
        soundEnabled: <HTMLElement> null,
        soundEnabledCross: <HTMLElement> null
    };

    export function prepare() {
        for (const id in elements) {
            elements[id] = document.getElementById(id);
        }
        if (soundEnabled) {
            elements.soundEnabledCross.style.display = "none";
        }
    }

    export function toggleSound() {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            elements.soundEnabledCross.style.display = "none";
        } else {
            elements.soundEnabledCross.style.display = "block";
        }
        localStorage.setItem("tank-sound-enabled", soundEnabled ? "true" : "false");
    }

    export function generatePixelatedGradient(fromColor: number, size: number, count: number) {
        const canvas = document.createElement('canvas');
        canvas.height = size * count;
        canvas.width = size;
        const ctx = canvas.getContext('2d');
        for (let i = 0; i < count; i++) {
            ctx.fillStyle = `rgba(${Util.colors.extract(fromColor).join(',')}, ${i / count})`;
            ctx.fillRect(0, size * i, size, size);
        }
        return canvas;
    }

    export function onTextureLoaded() {
        textureLoaded = true;
        init();
    }

    export function playSound(sound: HTMLAudioElement, tl: TimelineMax = null, at: string | number = "+=0") {
        const fn = () => {
            if (soundEnabled) {
                sound.currentTime = 0;
                sound.play();
            }
        };
        if (!tl) {
            fn();
        } else {
            tl.call(fn, null, null, at);
        }
    }
}