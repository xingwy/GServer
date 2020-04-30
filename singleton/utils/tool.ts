
export function getSteadyTime(): number {
    return Math.floor(process.uptime() * 1000);
}