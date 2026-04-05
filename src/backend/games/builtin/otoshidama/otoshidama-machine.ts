import { wait } from "../../../utils";

export async function otoshidama(otoshidamaSpec: string): Promise<number> {
    await wait(2000);

    const otoshidamaSpecArray = otoshidamaSpec
        .split("\n")
        .map(v => parseInt(v.trim(), 10))
        .filter(v => !isNaN(v));

    if (otoshidamaSpecArray.length < 1) {
        return 0;
    }

    const seed = Date.now();
    const randomIndex = Math.floor(seed % otoshidamaSpecArray.length);
    return otoshidamaSpecArray[randomIndex];
}
