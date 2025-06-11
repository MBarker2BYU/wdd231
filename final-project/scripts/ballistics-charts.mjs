/**
 * Render trajectory chart on canvas
 * @param {string} id - Canvas element ID
 * @param {Array<{distance: number, drop: number}>} data - Trajectory data
 */
function renderChart(id, data) {
    const canvas = document.getElementById(id);
    if (!canvas?.getContext) {
        console.error('Invalid canvas element:', id);
        return;
    }
    if (!data?.length) {
        console.warn('No trajectory data to render');
        return;
    }

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const root = document.documentElement;
    const colors = {
        background: getComputedStyle(root).getPropertyValue('--form-bg').trim(),
        border: getComputedStyle(root).getPropertyValue('--osu-gray').trim(),
        grid: getComputedStyle(root).getPropertyValue('--osu-gray').trim(),
        axes: getComputedStyle(root).getPropertyValue('--osu-white').trim(),
        trajectory: getComputedStyle(root).getPropertyValue('--osu-scarlet').trim(),
        labels: getComputedStyle(root).getPropertyValue('--form-text').trim()
    };

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = colors.background;
    ctx.fillRect(padding, padding, chartWidth, chartHeight);

    const maxDistance = Math.max(...data.map(d => d.distance), 500);
    const maxDrop = Math.max(...data.map(d => Math.abs(d.drop)), 50);
    const minDrop = Math.min(...data.map(d => d.drop), -50);
    const xScale = chartWidth / maxDistance;
    const yScale = chartHeight / (maxDrop - minDrop);

    // Grid lines
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    for (let i = 100; i <= maxDistance; i += 100) {
        const x = padding + i * xScale;
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
    }
    for (let i = minDrop; i <= maxDrop; i += (maxDrop - minDrop) / 4) {
        const y = height - padding - (i - minDrop) * yScale;
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle = colors.axes;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Labels
    ctx.font = '14px "Allerta Stencil", Arial, serif';
    ctx.fillStyle = colors.labels;
    ctx.textAlign = 'center';
    ctx.fillText('Distance (yards)', width / 2, height - 20);
    ctx.save();
    ctx.translate(padding - 40, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Drop (inches)', 0, 0);
    ctx.restore();

    for (let i = 0; i <= maxDistance; i += 100) {
        ctx.fillText(i, padding + i * xScale, height - padding + 20);
    }
    ctx.textAlign = 'right';
    for (let i = minDrop; i <= maxDrop; i += (maxDrop - minDrop) / 4) {
        ctx.fillText(Math.round(i), padding - 10, height - padding - (i - minDrop) * yScale + 5);
    }

    // Trajectory
    ctx.strokeStyle = colors.trajectory;
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach(({ distance, drop }, i) => {
        const x = padding + distance * xScale;
        const y = height - padding - (drop - minDrop) * yScale;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Border
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, chartWidth, chartHeight);
}

/**
 * Get trajectory data from table
 * @param {string} id - Table element ID
 * @returns {Array<{distance: number, drop: number}>} - Parsed data
 */
function getDataFromTable(id) {
    const table = document.getElementById(id);
    if (!table?.querySelectorAll) {
        console.error('Invalid table element:', id);
        return [];
    }

    const data = [];
    table.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
            const distance = parseFloat(cells[0].textContent);
            const drop = parseFloat(cells[3].textContent);
            if (!isNaN(distance) && !isNaN(drop)) {
                data.push({ distance, drop });
            }
        }
    });
    return data;
}

/**
 * Format trajectory data
 * @param {Array<{distance: number, drop: number}>} data - Raw data
 * @returns {Array<{distance: number, drop: number}>} - Formatted data
 */
function formatTrajectoryData(data) {
    if (!Array.isArray(data) || !data.length) {
        console.warn('No trajectory data to format');
        return [];
    }
    return data.map(({ distance, drop }) => ({
        distance: parseFloat(distance),
        drop: parseFloat(drop)
    }));
}

export { renderChart, getDataFromTable, formatTrajectoryData };