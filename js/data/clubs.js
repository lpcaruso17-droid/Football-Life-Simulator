export const CLUB_LEVELS = {
    elite: {
        id: "elite",
        label: "Elite nacional",
        startingWeight: 10
    },

    large: {
        id: "large",
        label: "Grande clube",
        startingWeight: 18
    },

    medium: {
        id: "medium",
        label: "Clube médio",
        startingWeight: 28
    },

    regional: {
        id: "regional",
        label: "Clube regional",
        startingWeight: 40
    }
};


export const ACADEMY_CATEGORIES = [
    {
        id: "u11",
        label: "Sub-11",
        typicalMinAge: 9,
        typicalMaxAge: 11
    },

    {
        id: "u13",
        label: "Sub-13",
        typicalMinAge: 11,
        typicalMaxAge: 13
    },

    {
        id: "u15",
        label: "Sub-15",
        typicalMinAge: 13,
        typicalMaxAge: 15
    },

    {
        id: "u17",
        label: "Sub-17",
        typicalMinAge: 15,
        typicalMaxAge: 17
    },

    {
        id: "u20",
        label: "Sub-20",
        typicalMinAge: 17,
        typicalMaxAge: 20
    }
];


export const CLUBS = [
    {
        id: "flamengo",

        name: "Flamengo",

        cityId: "rio_rj",

        level: "elite",

        academyQuality: 94,

        facilities: 94,

        medical: 91,

        housing: 88,

        educationSupport: 82,

        exposure: 98,

        pressure: 95,

        competition: 96,

        financialPower: 96,

        philosophy:
            "technical_and_competitive",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "fluminense",

        name: "Fluminense",

        cityId: "rio_rj",

        level: "elite",

        academyQuality: 95,

        facilities: 90,

        medical: 88,

        housing: 86,

        educationSupport: 84,

        exposure: 92,

        pressure: 88,

        competition: 93,

        financialPower: 86,

        philosophy:
            "youth_development",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "vasco",

        name: "Vasco da Gama",

        cityId: "rio_rj",

        level: "large",

        academyQuality: 88,

        facilities: 82,

        medical: 80,

        housing: 80,

        educationSupport: 77,

        exposure: 88,

        pressure: 85,

        competition: 86,

        financialPower: 76,

        philosophy:
            "youth_development",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "botafogo",

        name: "Botafogo",

        cityId: "rio_rj",

        level: "large",

        academyQuality: 83,

        facilities: 83,

        medical: 82,

        housing: 79,

        educationSupport: 76,

        exposure: 86,

        pressure: 82,

        competition: 82,

        financialPower: 84,

        philosophy:
            "balanced",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "palmeiras",

        name: "Palmeiras",

        cityId: "sao_paulo_sp",

        level: "elite",

        academyQuality: 97,

        facilities: 97,

        medical: 95,

        housing: 92,

        educationSupport: 87,

        exposure: 98,

        pressure: 94,

        competition: 98,

        financialPower: 98,

        philosophy:
            "elite_development",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "corinthians",

        name: "Corinthians",

        cityId: "sao_paulo_sp",

        level: "elite",

        academyQuality: 90,

        facilities: 89,

        medical: 87,

        housing: 85,

        educationSupport: 79,

        exposure: 97,

        pressure: 96,

        competition: 93,

        financialPower: 91,

        philosophy:
            "competitive",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "sao_paulo",

        name: "São Paulo",

        cityId: "sao_paulo_sp",

        level: "elite",

        academyQuality: 96,

        facilities: 95,

        medical: 92,

        housing: 90,

        educationSupport: 88,

        exposure: 95,

        pressure: 90,

        competition: 96,

        financialPower: 90,

        philosophy:
            "youth_development",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "santos",

        name: "Santos",

        cityId: "sao_paulo_sp",

        level: "large",

        academyQuality: 94,

        facilities: 86,

        medical: 84,

        housing: 83,

        educationSupport: 82,

        exposure: 91,

        pressure: 85,

        competition: 88,

        financialPower: 78,

        philosophy:
            "technical_development",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "cruzeiro",

        name: "Cruzeiro",

        cityId: "belo_horizonte_mg",

        level: "elite",

        academyQuality: 91,

        facilities: 91,

        medical: 90,

        housing: 86,

        educationSupport: 82,

        exposure: 91,

        pressure: 86,

        competition: 91,

        financialPower: 88,

        philosophy:
            "balanced_development",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "atletico_mg",

        name: "Atlético Mineiro",

        cityId: "belo_horizonte_mg",

        level: "elite",

        academyQuality: 89,

        facilities: 94,

        medical: 93,

        housing: 87,

        educationSupport: 81,

        exposure: 93,

        pressure: 90,

        competition: 92,

        financialPower: 94,

        philosophy:
            "competitive_development",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "gremio",

        name: "Grêmio",

        cityId: "porto_alegre_rs",

        level: "elite",

        academyQuality: 93,

        facilities: 91,

        medical: 89,

        housing: 88,

        educationSupport: 82,

        exposure: 92,

        pressure: 88,

        competition: 92,

        financialPower: 87,

        philosophy:
            "youth_development",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "internacional",

        name: "Internacional",

        cityId: "porto_alegre_rs",

        level: "elite",

        academyQuality: 92,

        facilities: 91,

        medical: 90,

        housing: 87,

        educationSupport: 84,

        exposure: 92,

        pressure: 87,

        competition: 91,

        financialPower: 88,

        philosophy:
            "balanced_development",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "athletico_pr",

        name: "Athletico Paranaense",

        cityId: "curitiba_pr",

        level: "elite",

        academyQuality: 94,

        facilities: 95,

        medical: 93,

        housing: 91,

        educationSupport: 87,

        exposure: 90,

        pressure: 83,

        competition: 91,

        financialPower: 90,

        philosophy:
            "performance_development",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "coritiba",

        name: "Coritiba",

        cityId: "curitiba_pr",

        level: "large",

        academyQuality: 83,

        facilities: 81,

        medical: 78,

        housing: 77,

        educationSupport: 78,

        exposure: 80,

        pressure: 76,

        competition: 81,

        financialPower: 73,

        philosophy:
            "youth_development",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "bahia",

        name: "Bahia",

        cityId: "salvador_ba",

        level: "large",

        academyQuality: 88,

        facilities: 90,

        medical: 88,

        housing: 84,

        educationSupport: 82,

        exposure: 87,

        pressure: 81,

        competition: 86,

        financialPower: 88,

        philosophy:
            "modern_development",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "sport",

        name: "Sport Recife",

        cityId: "recife_pe",

        level: "large",

        academyQuality: 82,

        facilities: 79,

        medical: 77,

        housing: 76,

        educationSupport: 74,

        exposure: 83,

        pressure: 81,

        competition: 80,

        financialPower: 72,

        philosophy:
            "competitive",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "nautico",

        name: "Náutico",

        cityId: "recife_pe",

        level: "regional",

        academyQuality: 73,

        facilities: 68,

        medical: 67,

        housing: 64,

        educationSupport: 68,

        exposure: 71,

        pressure: 69,

        competition: 70,

        financialPower: 60,

        philosophy:
            "regional_development",

        academyCategories: [
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "fortaleza",

        name: "Fortaleza",

        cityId: "fortaleza_ce",

        level: "large",

        academyQuality: 86,

        facilities: 89,

        medical: 87,

        housing: 82,

        educationSupport: 80,

        exposure: 87,

        pressure: 80,

        competition: 84,

        financialPower: 87,

        philosophy:
            "modern_development",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "ceara",

        name: "Ceará",

        cityId: "fortaleza_ce",

        level: "medium",

        academyQuality: 80,

        facilities: 78,

        medical: 76,

        housing: 73,

        educationSupport: 74,

        exposure: 78,

        pressure: 74,

        competition: 78,

        financialPower: 70,

        philosophy:
            "regional_development",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "goias",

        name: "Goiás",

        cityId: "goiania_go",

        level: "large",

        academyQuality: 87,

        facilities: 83,

        medical: 80,

        housing: 80,

        educationSupport: 77,

        exposure: 81,

        pressure: 75,

        competition: 82,

        financialPower: 74,

        philosophy:
            "youth_development",

        academyCategories: [
            "u11",
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "vila_nova",

        name: "Vila Nova",

        cityId: "goiania_go",

        level: "medium",

        academyQuality: 74,

        facilities: 70,

        medical: 68,

        housing: 66,

        educationSupport: 69,

        exposure: 72,

        pressure: 70,

        competition: 73,

        financialPower: 62,

        philosophy:
            "regional_development",

        academyCategories: [
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "brasiliense",

        name: "Brasiliense",

        cityId: "brasilia_df",

        level: "regional",

        academyQuality: 68,

        facilities: 66,

        medical: 64,

        housing: 61,

        educationSupport: 66,

        exposure: 67,

        pressure: 62,

        competition: 69,

        financialPower: 59,

        philosophy:
            "regional_development",

        academyCategories: [
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "amazonas",

        name: "Amazonas FC",

        cityId: "manaus_am",

        level: "medium",

        academyQuality: 71,

        facilities: 72,

        medical: 70,

        housing: 67,

        educationSupport: 68,

        exposure: 74,

        pressure: 65,

        competition: 70,

        financialPower: 69,

        philosophy:
            "growth",

        academyCategories: [
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "nacional_am",

        name: "Nacional-AM",

        cityId: "manaus_am",

        level: "regional",

        academyQuality: 64,

        facilities: 61,

        medical: 59,

        housing: 56,

        educationSupport: 61,

        exposure: 62,

        pressure: 59,

        competition: 65,

        financialPower: 53,

        philosophy:
            "regional_development",

        academyCategories: [
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "paysandu",

        name: "Paysandu",

        cityId: "belem_pa",

        level: "medium",

        academyQuality: 74,

        facilities: 71,

        medical: 69,

        housing: 67,

        educationSupport: 70,

        exposure: 76,

        pressure: 72,

        competition: 74,

        financialPower: 66,

        philosophy:
            "regional_development",

        academyCategories: [
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    },

    {
        id: "remo",

        name: "Remo",

        cityId: "belem_pa",

        level: "medium",

        academyQuality: 73,

        facilities: 70,

        medical: 68,

        housing: 66,

        educationSupport: 69,

        exposure: 76,

        pressure: 72,

        competition: 74,

        financialPower: 65,

        philosophy:
            "regional_development",

        academyCategories: [
            "u13",
            "u15",
            "u17",
            "u20"
        ]
    }
];


export function getClubTemplateById(
    clubId
) {
    return (
        CLUBS.find(
            club =>
                club.id === clubId
        ) ??
        null
    );
}


export function getClubsByCity(
    cityId
) {
    return CLUBS.filter(
        club =>
            club.cityId === cityId
    );
}


export function getAcademyCategoryById(
    categoryId
) {
    return (
        ACADEMY_CATEGORIES.find(
            category =>
                category.id ===
                categoryId
        ) ??
        null
    );
}