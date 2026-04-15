export interface FukubikiPrize {
    id?: string;
    name: string;
    chance: number;
    stock: number;
    message: string;
}

/** ストック残数を管理するマップ（賞名 → 残数） */
const prizeStockMap = new Map<string, number>();

/**
 * 賞のストックを初期化する（設定変更時・起動時に呼ぶ）
 */
export function initializePrizeStocks(prizes: FukubikiPrize[]): void {
    prizeStockMap.clear();
    for (const prize of prizes) {
        if (prize.stock > 0) {
            prizeStockMap.set(prize.name, prize.stock);
        }
    }
}

/**
 * ストックが残っている賞を返す（stock=0 は無制限）
 */
function getAvailablePrizes(prizes: FukubikiPrize[]): FukubikiPrize[] {
    return prizes.filter((p) => {
        if (p.stock > 0) {
            const remaining = prizeStockMap.get(p.name) ?? p.stock;
            return remaining > 0;
        }
        return true;
    });
}

/**
 * 重み付き抽選で賞を選択し、ストックを消費して返す。
 * 有効な賞がなければ null を返す。
 */
export function drawFukubiki(prizes: FukubikiPrize[]): FukubikiPrize | null {
    const available = getAvailablePrizes(prizes);
    if (available.length === 0) {
        return null;
    }

    const totalWeight = available.reduce((sum, p) => sum + p.chance, 0);
    if (totalWeight <= 0) {
        return null;
    }

    let rand = Math.random() * totalWeight;
    for (const prize of available) {
        rand -= prize.chance;
        if (rand <= 0) {
            if (prize.stock > 0) {
                const remaining = prizeStockMap.get(prize.name) ?? prize.stock;
                prizeStockMap.set(prize.name, Math.max(0, remaining - 1));
            }
            return prize;
        }
    }

    // フォールバック（浮動小数点誤差対策）
    const last = available[available.length - 1];
    if (last.stock > 0) {
        const remaining = prizeStockMap.get(last.name) ?? last.stock;
        prizeStockMap.set(last.name, Math.max(0, remaining - 1));
    }
    return last;
}

/**
 * ストックマップをクリアする
 */
export function clearPrizeStocks(): void {
    prizeStockMap.clear();
}
