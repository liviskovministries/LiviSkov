// Substitua o uso de React.useId() por uma solução alternativa

// Linha ~46:
const uniqueId = Math.random().toString(36).substr(2, 9);
const chartId = `chart-${id || uniqueId}`;