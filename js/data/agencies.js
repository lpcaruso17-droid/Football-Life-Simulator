export const AGENCY_TIERS = {
    regional: {
        id: "regional",
        label: "Regional"
    },

    national: {
        id: "national",
        label: "Nacional"
    },

    international: {
        id: "international",
        label: "Internacional"
    }
};


export const FOOTBALL_AGENCIES = [
    {
        id: "ponte11",

        name: "Ponte11 Sports",

        tier: "regional",

        reputation: 42,

        negotiation: 55,

        brazilNetwork: 63,

        internationalNetwork: 18,

        ethics: 78,

        youthFocus: 88,

        selectivity: 28,

        commercialPower: 32
    },

    {
        id: "horizonte_sports",

        name: "Horizonte Sports",

        tier: "regional",

        reputation: 48,

        negotiation: 61,

        brazilNetwork: 69,

        internationalNetwork: 24,

        ethics: 70,

        youthFocus: 82,

        selectivity: 35,

        commercialPower: 39
    },

    {
        id: "vertice",

        name: "Vértice Football",

        tier: "national",

        reputation: 67,

        negotiation: 73,

        brazilNetwork: 82,

        internationalNetwork: 51,

        ethics: 72,

        youthFocus: 70,

        selectivity: 53,

        commercialPower: 65
    },

    {
        id: "atlas",

        name: "Atlas Sports Management",

        tier: "national",

        reputation: 74,

        negotiation: 81,

        brazilNetwork: 87,

        internationalNetwork: 58,

        ethics: 62,

        youthFocus: 63,

        selectivity: 61,

        commercialPower: 72
    },

    {
        id: "northstar",

        name: "NorthStar Football",

        tier: "international",

        reputation: 86,

        negotiation: 89,

        brazilNetwork: 81,

        internationalNetwork: 91,

        ethics: 75,

        youthFocus: 55,

        selectivity: 76,

        commercialPower: 89
    },

    {
        id: "global_eleven",

        name: "Global Eleven",

        tier: "international",

        reputation: 93,

        negotiation: 94,

        brazilNetwork: 88,

        internationalNetwork: 97,

        ethics: 66,

        youthFocus: 49,

        selectivity: 84,

        commercialPower: 96
    }
];


export function getAgencyById(
    agencyId
) {
    return (
        FOOTBALL_AGENCIES.find(
            agency =>
                agency.id ===
                agencyId
        ) ??
        null
    );
}