
export function getSteadyTime(): number {
    return Math.floor(process.uptime() * 1000);
}

export function getLocalTime(): number {
    return 0;
}