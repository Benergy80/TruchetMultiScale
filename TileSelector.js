class TileSelector {
    constructor() {
        this.selectedTiles = new Set();
        this.container = createDiv('');
        this.container.id('tile-selector-container');
        
        this.grid = createDiv('');
        this.grid.class('tile-grid');
        this.grid.parent(this.container);

        this.tileTypes = ['/', '\\', '-', '|', '+', '+.', 'x.',
                         'fne', 'fsw', 'fnw', 'fse',
                         'tn', 'ts', 'te', 'tw'];
                         
        this.createTileOptions();
    }

    createSvg(type, size = 40) {
        const padding = 8;
        const center = size / 2;
        const radius = size * 0.55;

        let path = '';
        switch(type) {
            case '/':
                path = `M ${padding} ${padding} L ${size-padding} ${size-padding}`;
                break;
            case '\\':
                path = `M ${size-padding} ${padding} L ${padding} ${size-padding}`;
                break;
            case '-':
                path = `M ${padding} ${center} L ${size-padding} ${center}`;
                break;
            case '|':
                path = `M ${center} ${padding} L ${center} ${size-padding}`;
                break;
            case '+':
                path = `M ${padding} ${center} L ${size-padding} ${center} M ${center} ${padding} L ${center} ${size-padding}`;
                break;
            case '+.':
                path = `M ${padding} ${padding} H ${size-padding} V ${size-padding} H ${padding} Z`;
                break;
            case 'x.':
                return `<svg viewBox="0 0 ${size} ${size}"><rect x="${padding}" y="${padding}" width="${size-2*padding}" height="${size-2*padding}" fill="black"/></svg>`;
            case 'fne':
                path = `M ${size-padding} ${padding} A ${radius} ${radius} 0 0 1 ${size-padding} ${size-padding}`;
                break;
            case 'fsw':
                path = `M ${padding} ${size-padding} A ${radius} ${radius} 0 0 1 ${padding} ${padding}`;
                break;
            case 'fnw':
                path = `M ${padding} ${padding} A ${radius} ${radius} 0 0 0 ${size-padding} ${padding}`;
                break;
            case 'fse':
                path = `M ${size-padding} ${size-padding} A ${radius} ${radius} 0 0 0 ${padding} ${size-padding}`;
                break;
            case 'tn':
                path = `M ${padding} ${center} L ${size-padding} ${center} M ${center} ${padding} L ${center} ${center}`;
                break;
            case 'ts':
                path = `M ${padding} ${center} L ${size-padding} ${center} M ${center} ${center} L ${center} ${size-padding}`;
                break;
            case 'te':
                path = `M ${center} ${padding} L ${center} ${size-padding} M ${center} ${center} L ${size-padding} ${center}`;
                break;
            case 'tw':
                path = `M ${center} ${padding} L ${center} ${size-padding} M ${padding} ${center} L ${center} ${center}`;
                break;
        }
        return `<svg viewBox="0 0 ${size} ${size}"><path d="${path}" stroke="black" stroke-width="2" fill="none"/></svg>`;
    }

    createTileOptions() {
        this.tileTypes.forEach(type => {
            const option = createDiv('');
            option.class('tile-option');
            option.parent(this.grid);
            option.html(this.createSvg(type));
            
            option.mousePressed(() => {
                const isSelected = option.hasClass('selected');
                if (isSelected) {
                    option.removeClass('selected');
                    this.selectedTiles.delete(type);
                } else {
                    option.addClass('selected');
                    this.selectedTiles.add(type);
                }
                
                if (window.updateAllowedTileTypes) {
                    window.updateAllowedTileTypes(Array.from(this.selectedTiles));
                }
            });
        });
    }
}
