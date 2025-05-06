export function extractDigits(n: number) {
  // Fix IEEE errors by rounding to 4 decimal places using toFixed, then work with string
  const fixed = Number(n.toFixed(4)); // e.g., 14.69999999999 => 14.7000
  const parts = fixed.toFixed(4).split("."); // ['14', '7000']

  const intPart = parts[0].padStart(2, "0"); // '14' => '14'; '4' => '04'
  const decPart = parts[1]; // guaranteed to be 4 digits: '7000'

  return {
    tens: +intPart[0],
    ones: +intPart[1],
    tenths: +decPart[0],
    hundredths: +decPart[1],
    thousandths: +decPart[2],
    tenthousandths: +decPart[3],
  };
}
