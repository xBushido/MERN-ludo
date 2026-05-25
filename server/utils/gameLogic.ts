interface Token {
  id: string;
  color: string;
  position: number;
}

export const START_POS: {[key: string]: number} = {
  red: 0,
  blue: 13,
  green: 26,
  yellow: 39,
};

export const HOME_BASE: {[key: string]: number} = {
    red: 50,
    blue: 11,
    green: 24,
    yellow: 37
};

export function getNewPos(token: Token, diceValue: number, color: string) {
    const newPos = token.position + diceValue;

    if(token.position === -1) {
        if(diceValue === 6) return START_POS[color];
        return -1;
    }
    if(token.position <= HOME_BASE[color] && newPos > HOME_BASE[color]) {
        const stepsIntoBase = newPos - HOME_BASE[color];
        if(stepsIntoBase > 6) return token.position;
        else return 52 + stepsIntoBase;
    }
    if(token.position >= 52) {
        if(newPos > 57) return token.position;
        else return newPos;
    }

    return newPos % 52;
}

export function canMove(token: Token, diceValue: number): boolean {
    if(token.position === -1 && diceValue !== 6) return false;
    if(token.position === 57) return false;
    return (getNewPos(token, diceValue, token.color) !== token.position); 
}

export function hasValidMove(tokens: Token[], diceValue: number): boolean {
    return tokens.some(token => canMove(token, diceValue));
}