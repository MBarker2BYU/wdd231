export function renderChart(trajectoryData) {
    const canvas = chartingElements.canvas;

    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        console.error('Canvas element is not initialized or is not a valid HTMLCanvasElement.');
        return;
    }

    const ctx = canvas.getContext('2d');
    const root = document.documentElement;
    const colors = {
        background: getComputedStyle(root).getPropertyValue('--form-bg').trim(),
        border: getComputedStyle(root).getPropertyValue('--osu-gray').trim(),
        grid: getComputedStyle(root).getPropertyValue('--osu-gray').trim(),
        axes: getComputedStyle(root).getPropertyValue('--osu-white').trim(),
        trajectory: getComputedStyle(root).getPropertyValue('--osu-scarlet').trim(),
        labels: getComputedStyle(root).getPropertyValue('--form-text').trim()
    };

    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    const chartWidth = parseInt(width - 2 * padding);
    const chartHeight = parseInt(height - 2 * padding);

    // Fill the chart background
    ctx.fillStyle = colors.background;
    ctx.fillRect(padding, padding, chartWidth, chartHeight);

    // Draw chart structure
    const maxDistance = trajectoryData.length > 0 ? Math.max(...trajectoryData.map(d => d.distance)) : 500;
    const maxDrop = trajectoryData.length > 0 ? Math.max(...trajectoryData.map(d => Math.abs(d.drop))) : 50;
    const minDrop = trajectoryData.length > 0 ? Math.min(...trajectoryData.map(d => d.drop)) : -50;

    const xScale = chartWidth / maxDistance;
    const yScale = chartHeight / (maxDrop - minDrop);

    // Draw grid lines
    ctx.beginPath();
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    for (let i = 100; i <= maxDistance; i += 100) {
        const x = padding + i * xScale;
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
    }

    const dropStep = (maxDrop - minDrop) / 4;
    for (let i = minDrop; i <= maxDrop; i += dropStep) {
        const y = height - padding - (i - minDrop) * yScale;
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = colors.axes;
    ctx.lineWidth = 1;
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding); // X-axis
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding); // Y-axis
    ctx.stroke();

    // Draw axis labels
    ctx.font = '14px "Allerta Stencil", Arial, serif';
    ctx.fillStyle = colors.labels; // Now defined

    // X-axis label
    ctx.textAlign = 'center';
    ctx.fillText('Distance (yards)', width / 2, height - 20); // Adjusted to avoid clipping

    // Y-axis label (rotated)
    ctx.save();
    ctx.translate(padding - 40, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Drop (inches)', 0, 0);
    ctx.restore();

    // X-axis tick labels
    for (let i = 0; i <= maxDistance; i += 100) {
        const x = padding + i * xScale;
        ctx.fillText(i.toString(), x, height - padding + 20);
    }

    // Y-axis tick labels
    const dropStepLabel = (maxDrop - minDrop) / 4;
    ctx.textAlign = 'right';
    for (let i = minDrop; i <= maxDrop; i += dropStepLabel) {
        const y = height - padding - (i - minDrop) * yScale;
        ctx.fillText(Math.round(i).toString(), padding - 10, y + 5);
    }

    // Draw trajectory line
    if (trajectoryData && trajectoryData.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = colors.trajectory;
        ctx.lineWidth = 2;
        trajectoryData.forEach((point, index) => {
            const x = padding + point.distance * xScale;
            const y = height - padding - (point.drop - minDrop) * yScale;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
    }

    // Draw border
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, chartWidth, chartHeight);
}

export function formatTrajectoryData(originalTrajectoryData) {
    if (!Array.isArray(originalTrajectoryData) || originalTrajectoryData.length === 0) {
        console.warn('No trajectory data available to format.');
        return [];
    }

    const trajectoryData = [];

    originalTrajectoryData.forEach(data => {
        trajectoryData.push({ datance: data.distance, drop: -Math.abs(data.drop) });
    });

    return trajectoryData;
}


function renderChartFromTable() {
    const table = chartingElements.table;

    if (!table || !(table instanceof HTMLTableElement)) {
        console.error('Table element is not initialized or is not a valid HTMLTableElement.');
        return;
    }

    const trajectoryData = [];
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
            const distance = parseFloat(cells[0].textContent);
            const drop = parseFloat(cells[3].textContent);
            if (!isNaN(distance) && !isNaN(drop)) {
                trajectoryData.push({ distance, drop: -Math.abs(drop) });
            }
        }
    });

    renderChart(trajectoryData.length > 0 ? trajectoryData : []);
}