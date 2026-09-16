export const FOOTBALL_POSITIONS = [
    {
        id: "gk",
        label: "Goleiro",
        group: "goalkeeper"
    },

    {
        id: "rb",
        label: "Lateral Direito",
        group: "defender"
    },

    {
        id: "cb",
        label: "Zagueiro",
        group: "defender"
    },

    {
        id: "lb",
        label: "Lateral Esquerdo",
        group: "defender"
    },

    {
        id: "dm",
        label: "Volante",
        group: "midfielder"
    },

    {
        id: "cm",
        label: "Meia",
        group: "midfielder"
    },

    {
        id: "rw",
        label: "Ponta Direita",
        group: "forward"
    },

    {
        id: "lw",
        label: "Ponta Esquerda",
        group: "forward"
    },

    {
        id: "st",
        label: "Centroavante",
        group: "forward"
    }
];


export function getPositionById(
    positionId
) {
    return (
        FOOTBALL_POSITIONS.find(
            position =>
                position.id ===
                positionId
        ) ?? null
    );
}