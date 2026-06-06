/* eslint-disable max-len */
(function(Scratch) {
    'use strict';

    const blockIconURI = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+cGVuLWljb248L3RpdGxlPjxnIHN0cm9rZT0iIzU3NUU3NSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik04Ljc1MyAzNC42MDJsLTQuMjUgMS43OCAxLjc4My00LjIzN2MxLjIxOC0yLjg5MiAyLjkwNy01LjQyMyA1LjAzLTcuNTM4TDMxLjA2NiA0LjkzYy44NDYtLjg0MiAyLjY1LS40MSA0LjAzMi45NjcgMS4zOCAxLjM3NSAxLjgxNiAzLjE3My45NyA0LjAxNUwxNi4zMTggMjkuNTljLTIuMTIzIDIuMTE2LTQuNjY0IDMuOC03LjU2NSA1LjAxMiIgZmlsbD0iI0ZGRiIvPjxwYXRoIGQ9Ik0yOS40MSA2LjExcy00LjQ1LTIuMzc4LTguMjAyIDUuNzcyYy0xLjczNCAzLjc2Ni00LjM1IDEuNTQ2LTQuMzUgMS41NDYiLz48cGF0aCBkPSJNMzYuNDIgOC44MjVjMCAuNDYzLS4xNC44NzMtLjQzMiAxLjE2NGwtOS4zMzUgOS4zYy4yODItLjI5LjQxLS42NjguNDEtMS4xMiAwLS44NzQtLjUwNy0xLjk2My0xLjQwNi0yLjg2OC0xLjM2Mi0xLjM1OC0zLjE0Ny0xLS40MDAyLS45OUwzMC45OSA1LjAxYy44NDQtLjg0IDIuNjUtLjQxIDQuMDM1Ljk2Ljg5OC45MDQgMS4zOTYgMS45ODIgMS4zOTYgMi44NTVNMTAuNTE1IDMzLjc3NGMtLjU3My4zMDItMS4xNTcuNTctMS43NjQuODNMNC41IDM2LjM4MmwxLjc4Ni00LjIzNWMuMjU4LS42MDQuNTMtMS4xODYuODMzLTEuNzU3LjY5LjE4MyAxLjQ0OC42MjUgMi4xMDggMS4yODIuNjYuNjU4IDEuMTAyIDEuNDEyIDEuMjg3IDIuMTAyIiBmaWxsPSIjNEM5N0ZGIi8+PHBhdGggZD0iTTM2LjQ5OCA4Ljc0OGMwIC40NjQtLjE0Ljg3NC0uNDMzIDEuMTY1bC0xOS43NDIgMTkuNjhjLTIuMTMgMi4xMS00LjY3MyAzLjc5My03LjU3MiA1LjAxTDQuNSAzNi4zOGwuOTc0LTIuMzE2IDEuOTI1LS44MDhjMi44OTgtMS4yMTggNS40NC0yLjkgNy41Ny01LjAxbDE5Ljc0My0xOS42OGMuMjkyLS4yOTIuNDMyLS43MDIuNDMyLTEuMTY1IDAtLjY0Ni0uMjctMS40LS43OC0yLjEyMi4yNS4xNzIuNS4zNzcuNzM3LjYxNC44OTguOTA1IDEuMzk2IDEuOTgzIDEuMzk2IDIuODU2IiBmaWxsPSIjNTc1RTc1IiBvcGFjaXR5PSIuMTUiLz48cGF0aCBkPSJNMTguNDUgMTIuODNjMCAuNS0uNDA0LjkwNS0uOTA0LjkwNXMtLjkwNS0uNDA1LS45MDUtLjkwNGMwLS41LjQwNy0uOTAzLjkwNi0uOTAzLjUgMCAuOTA0LjQwNC45MDQuOTA0eiIgZmlsbD0iIzU3NUU3NSIvPjwvZz48L3N2Zz4=';

    // --- CLOSURE CACHE ---
    // Moving variables out of 'this' and into local scope skips the prototype chain entirely.
    const runtime = Scratch.vm.runtime;
    let renderer = null;
    let penSkinId = -1;

    /**
     * Internal fast-init. Runs exactly once.
     */
    function initPen() {
        renderer = runtime.renderer;
        if (!renderer) return false;

        penSkinId = renderer.createPenSkin();
        const drawableId = renderer.createDrawable('pen');
        
        renderer.updateDrawableProperties(drawableId, { skinId: penSkinId });
        
        if (renderer.markDrawableAsNoninteractive) {
            renderer.markDrawableAsNoninteractive(drawableId);
        }
        return true;
    }

    class Scratch3PenBlocks {
        constructor() {
            // Clean up when the project stops
            runtime.on('RUNTIME_DISPOSED', this.clear);
        }

        getInfo() {
            return {
                id: 'minipen',
                name: 'Mini Pen',
                blockIconURI,
                blocks: [
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Stage selected: less pen blocks',
                        filter: [Scratch.TargetType.STAGE]
                    },
                    {
                        opcode: 'clear',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'erase all'
                    },
                    {
                        opcode: 'stamp',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'stamp',
                        filter: [Scratch.TargetType.SPRITE]
                    }
                ]
            };
        }

        clear() {
            // Hot path check: variables are fetched from closure memory, not object properties
            if (penSkinId < 0 && !initPen()) return;
            
            renderer.penClear(penSkinId);
            runtime.requestRedraw();
        }

        stamp(args, util) {
            // The leanest possible execution path for a Scratch block
            if (penSkinId < 0 && !initPen()) return;
            
            renderer.penStamp(penSkinId, util.target.drawableID);
            runtime.requestRedraw();
        }
    }

    Scratch.extensions.register(new Scratch3PenBlocks());

})(Scratch);
