export const amountValidation = ({
  fiatAmount,
  cryptoAmount,
  selectedCryptoCoin,
  selectedFiatCoin,
  cryptoFields = {
    min: "min",
    max: "max",
    code: "code",
    available: "amount",
  },
  fiatFields = { code: "code", available: "amount" }
}
) => {
  switch (true) {
    case cryptoAmount === '':
      return `Enter a valid ${selectedCryptoCoin?.[cryptoFields.code]} amount`;
    case fiatAmount === '':
      return `Enter a valid ${selectedFiatCoin?.[fiatFields.code]} amount`;
    case cryptoAmount === '.':
      return `Invalid ${selectedCryptoCoin?.[cryptoFields.code]} amount`;
    case fiatAmount === '.':
      return `Invalid ${selectedFiatCoin?.[fiatFields.code]} amount`;
    case Number(cryptoAmount) < selectedCryptoCoin?.[cryptoFields.min]:
      return `You have entered an amount below the minimum limit. The minimum amount is ${selectedCryptoCoin?.[cryptoFields.min]} ${selectedCryptoCoin?.[cryptoFields.code]}`;
    case Number(cryptoAmount) > selectedCryptoCoin?.[cryptoFields.max]:
      return `The maximum limit is ${selectedCryptoCoin?.[cryptoFields.max]} ${selectedCryptoCoin?.[cryptoFields.code]}. Please contact support for higher amounts`;
    case Number(cryptoAmount) <= 0:
      return `${selectedCryptoCoin?.[cryptoFields.code]} Amount must be greater than zero.`;
    case Number(fiatAmount) <= 0:
      return `The received ${selectedFiatCoin?.[fiatFields.code]} amount must be greater than zero.`;
    case Number(cryptoAmount) > selectedCryptoCoin?.[cryptoFields.available]:
      return `Insufficient balance: You don't have enough ${selectedCryptoCoin?.[cryptoFields.code]} to sell.`;
    default:
      return "";
  }
};

export const SELL_VALIDATION_MESSAGES = {
  NO_FIAT_WALLET: "No fiat wallet selected"
}
