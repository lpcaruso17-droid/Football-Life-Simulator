const UINT32_RANGE = 4294967296;

function normalizeSeed(seed) {
    const numericSeed = Number(seed);

    if (!Number.isFinite(numericSeed)) {
        return 1;
    }

    const normalized = Math.trunc(numericSeed) >>> 0;

    return normalized === 0
        ? 0x6d2b79f5
        : normalized;
}


export function createSeed() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.getRandomValues === "function"
    ) {
        const values = new Uint32Array(1);

        crypto.getRandomValues(values);

        return normalizeSeed(values[0]);
    }

    const performanceValue =
        typeof performance !== "undefined"
            ? Math.floor(performance.now() * 1000)
            : 0;

    return normalizeSeed(
        Date.now() ^ performanceValue
    );
}


export function createRngState(seed = createSeed()) {
    const normalizedSeed = normalizeSeed(seed);

    return {
        seed: normalizedSeed,
        state: normalizedSeed,
        draws: 0
    };
}


export function nextRandom(rngState) {
    if (
        !rngState ||
        typeof rngState.state !== "number"
    ) {
        throw new TypeError(
            "Estado de RNG inválido."
        );
    }

    const current =
        rngState.state >>> 0;

    const next =
        (
            Math.imul(current, 1664525) +
            1013904223
        ) >>> 0;

    rngState.state = next;
    rngState.draws =
        (rngState.draws ?? 0) + 1;

    return next / UINT32_RANGE;
}


export function randomInt(
    rngState,
    min,
    max
) {
    const minimum = Math.ceil(min);
    const maximum = Math.floor(max);

    if (maximum < minimum) {
        throw new RangeError(
            "O valor máximo deve ser maior ou igual ao mínimo."
        );
    }

    return Math.floor(
        nextRandom(rngState) *
        (maximum - minimum + 1)
    ) + minimum;
}


export function randomFloat(
    rngState,
    min = 0,
    max = 1
) {
    return (
        min +
        nextRandom(rngState) *
        (max - min)
    );
}


export function chance(
    rngState,
    probability
) {
    const normalizedProbability =
        Math.max(
            0,
            Math.min(1, probability)
        );

    return (
        nextRandom(rngState) <
        normalizedProbability
    );
}


export function pick(
    rngState,
    items
) {
    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {
        return null;
    }

    const index = randomInt(
        rngState,
        0,
        items.length - 1
    );

    return items[index];
}


export function weightedPick(
    rngState,
    items,
    weightGetter = item =>
        item?.weight ?? 1
) {
    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {
        return null;
    }

    const weightedItems =
        items
            .map(item => ({
                item,
                weight: Math.max(
                    0,
                    Number(
                        weightGetter(item)
                    ) || 0
                )
            }))
            .filter(
                entry =>
                    entry.weight > 0
            );

    if (
        weightedItems.length === 0
    ) {
        return pick(
            rngState,
            items
        );
    }

    const totalWeight =
        weightedItems.reduce(
            (
                total,
                entry
            ) =>
                total +
                entry.weight,
            0
        );

    let roll =
        nextRandom(rngState) *
        totalWeight;

    for (
        const entry of weightedItems
    ) {
        roll -= entry.weight;

        if (roll <= 0) {
            return entry.item;
        }
    }

    return weightedItems[
        weightedItems.length - 1
    ].item;
}


export function shuffle(
    rngState,
    items
) {
    const result = [...items];

    for (
        let index =
            result.length - 1;
        index > 0;
        index--
    ) {
        const swapIndex =
            randomInt(
                rngState,
                0,
                index
            );

        [
            result[index],
            result[swapIndex]
        ] = [
            result[swapIndex],
            result[index]
        ];
    }

    return result;
}