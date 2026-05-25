export function coinsCalculator(rank: number, total_players: number): number {
    if(total_players === 4) {
        if(rank === 1) return 100;
        if(rank === 2) return 50;
        if(rank === 3) return 25;
        return 0;
    }
    else if(total_players === 3) {
        if(rank === 1) return 50;
        if(rank === 2) return 25;
        return 0;
    }
    else if(total_players === 2) {
        if(rank === 1) return 25;
        return 0;
    }
    return 0;
}