// // If isHighPrecision is true and value is 5,00,000, then the final output will be 0.5M
// // If isHighPrecision is false and value is 5,00,000, then the final output will be 500k
// export default function numberFormatter(value, startFrom = 'M', isHighPrecision = false) {
//     const getValueCondition = (forSuffix) => {
//         switch (forSuffix) {
//             case 'Q': return !isHighPrecision ? value >= 1000000000000000 : value >= 1000000000000;
//             case 'T': return !isHighPrecision ? value >= 1000000000000 : value >= 100000000000
//             case 'B': return !isHighPrecision ? value >= 1000000000 : value >= 100000000
//             case 'M': return !isHighPrecision ? value >= 1000000 : value >= 100000
//             default: return value >= 1000;
//         }
//     }

//     const getStartFromList = () => {
//         switch (startFrom) {
//             case 'Q': return ['Q', 'T', 'B', 'M'];
//             case 'T': return ['T', 'B', 'M']
//             case 'B': return ['B', 'M']
//             case 'M': return ['M']
//             default: return ['Q', 'T', 'B', 'M'];
//         }
//     }
//     const startFromList = getStartFromList()
//     if (getValueCondition('Q') && startFromList.includes('Q')) {
//         return { number: (value / 1000000000000000), suffix: 'Q' }
//     }
//     if (getValueCondition('T') && startFromList.includes('T')) {
//         return { number: (value / 1000000000000), suffix: 'T' }
//     }
//     if (getValueCondition('B') && startFromList.includes('B')) {
//         return { number: (value / 1000000000), suffix: 'B' }
//     }
//     if (getValueCondition('M') && startFromList.includes('M')) {
//         return { number: (value / 1000000), suffix: 'M' }
//     }
//     if (value >= 1000) {
//         return { number: (value / 1000), suffix: 'K' }
//     }
//     return { number: value, suffix: '' };
// }




export default function numberFormatter(value, startFrom = 'M', isHighPrecision = false) {
    const suffixes = [
        { key: 'Q', divisor: 1e15, min: isHighPrecision ? 1e12 : 1e15 },
        { key: 'T', divisor: 1e12, min: isHighPrecision ? 1e11 : 1e12 },
        { key: 'B', divisor: 1e9, min: isHighPrecision ? 1e8 : 1e9 },
        { key: 'M', divisor: 1e6, min: isHighPrecision ? 1e5 : 1e6 },
        { key: 'K', divisor: 1e3, min: 1e3 }
    ];

    const getStartFromList = () => {
        switch (startFrom) {
            case 'Q': return ['Q', 'T', 'B', 'M', 'K'];
            case 'T': return ['T', 'B', 'M', 'K'];
            case 'B': return ['B', 'M', 'K'];
            case 'M': return ['M', 'K'];
            default: return ['Q', 'T', 'B', 'M', 'K'];
        }
    };

    const startFromList = getStartFromList();

    for (const { key, divisor, min } of suffixes) {
        if (value >= min && startFromList.includes(key)) {
            const integerPart = Math.floor(value / divisor);
            const remainder = value % divisor;
            const decimals = Math.floor((remainder * 100) / divisor); // Truncate, no rounding
            const formatted = `${integerPart}.${decimals.toString().padStart(2, '0')}`;
            return { number: formatted, suffix: key };
        }
    }

    // For values less than 1000, just return the value as-is
    return { number: value.toString(), suffix: '' };
}

