export const BRAZILIAN_CITIES = [
    {
        id: "rio_rj",
        name: "Rio de Janeiro",
        state: "RJ",
        region: "Sudeste",
        footballMarket: 95,
        costOfLiving: 88
    },

    {
        id: "sao_paulo_sp",
        name: "São Paulo",
        state: "SP",
        region: "Sudeste",
        footballMarket: 100,
        costOfLiving: 95
    },

    {
        id: "belo_horizonte_mg",
        name: "Belo Horizonte",
        state: "MG",
        region: "Sudeste",
        footballMarket: 85,
        costOfLiving: 72
    },

    {
        id: "brasilia_df",
        name: "Brasília",
        state: "DF",
        region: "Centro-Oeste",
        footballMarket: 65,
        costOfLiving: 82
    },

    {
        id: "goiania_go",
        name: "Goiânia",
        state: "GO",
        region: "Centro-Oeste",
        footballMarket: 68,
        costOfLiving: 63
    },

    {
        id: "porto_alegre_rs",
        name: "Porto Alegre",
        state: "RS",
        region: "Sul",
        footballMarket: 86,
        costOfLiving: 74
    },

    {
        id: "curitiba_pr",
        name: "Curitiba",
        state: "PR",
        region: "Sul",
        footballMarket: 80,
        costOfLiving: 72
    },

    {
        id: "salvador_ba",
        name: "Salvador",
        state: "BA",
        region: "Nordeste",
        footballMarket: 77,
        costOfLiving: 64
    },

    {
        id: "recife_pe",
        name: "Recife",
        state: "PE",
        region: "Nordeste",
        footballMarket: 76,
        costOfLiving: 65
    },

    {
        id: "fortaleza_ce",
        name: "Fortaleza",
        state: "CE",
        region: "Nordeste",
        footballMarket: 81,
        costOfLiving: 62
    },

    {
        id: "manaus_am",
        name: "Manaus",
        state: "AM",
        region: "Norte",
        footballMarket: 57,
        costOfLiving: 67
    },

    {
        id: "belem_pa",
        name: "Belém",
        state: "PA",
        region: "Norte",
        footballMarket: 60,
        costOfLiving: 61
    }
];


export function getCityById(cityId) {
    return (
        BRAZILIAN_CITIES.find(
            city => city.id === cityId
        ) ?? null
    );
}