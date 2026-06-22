setTimeout(() => {
    initGenerator();
}, 500);

function initGenerator() {
    const inputs = ['width', 'height', 'count', 'gap'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
            // Mapping the simple IDs to matching val elements
            const logId = id === 'width' ? 'w' : id === 'height' ? 'h' : id;
            const indicator = document.getElementById(`val-${logId}`);
            if (indicator) indicator.innerText = e.target.value;
            
            updateDiagram();
        });
    });

    document.getElementById('generate').addEventListener('click', () => {
        generateRandomSeeds();
        updateDiagram();
    });

    document.getElementById('download').addEventListener('click', downloadSVG);

    // Run original generator calculations
    generateRandomSeeds();
    updateDiagram();
}

let seeds = [];

function generateRandomSeeds() {
    const count = parseInt(document.getElementById('count').value);
    const w = parseFloat(document.getElementById('width').value);
    const h = parseFloat(document.getElementById('height').value);
    
    seeds = [];
    for (let i = 0; i < count; i++) {
        seeds.push([
            2 + Math.random() * (w - 4),
            2 + Math.random() * (h - 4)
        ]);
    }
}

function updateDiagram() {
    const w = parseFloat(document.getElementById('width').value);
    const h = parseFloat(document.getElementById('height').value);
    const gap = parseFloat(document.getElementById('gap').value);
    const svg = document.getElementById('voronoi-svg');
    
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('width', w * 5); 

    if (!window.Delaunay) return;

    const delaunay = window.Delaunay.from(seeds);
    const voronoi = delaunay.voronoi([0, 0, w, h]);

    let svgContent = '';

    for (const polygon of voronoi.cellPolygons()) {
        const index = polygon.index;
        const seed = seeds[index];

        let cx = seed[0];
        let cy = seed[1];
        let pathData = [];

        for (let i = 0; i < polygon.length - 1; i++) {
            let px = polygon[i][0];
            let py = polygon[i][1];

            let insetX = px + (cx - px) * gap;
            let insetY = py + (cy - py) * gap;

            pathData.push(`${insetX.toFixed(3)},${insetY.toFixed(3)}`);
        }

        if (pathData.length > 0) {
            svgContent += `<polygon points="${pathData.join(' ')}" fill="#1d1d1f" stroke="none" />\n`;
        }
    }

    svg.innerHTML = `
        <rect width="${w}" height="${h}" fill="none" stroke="#bcbcc2" stroke-width="1"/>
        <g id="voronoi-cells">
            ${svgContent}
        </g>
    `;
}

function downloadSVG() {
    const w = document.getElementById('width').value;
    const h = document.getElementById('height').value;
    const svgElement = document.getElementById('voronoi-svg').cloneNode(true);
    
    svgElement.setAttribute('width', `${w}mm`);
    svgElement.setAttribute('height', `${h}mm`);

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    
    const blob = new Blob([`<?xml version="1.0" encoding="utf-8"?>\n${source}`], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `voronoi-lid-pattern-${w}x${h}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
