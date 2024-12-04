Intl.NumberFormat.prototype.format = function (value) {
  // add space in the currency symbol
  return this.format(value).replace(/^(\D+)/g, "$1 ");
};

const amount = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export default amount;

export const format = (value) => amount.format(value).replace(/^(\D+)/g, "$1 ");

export const decimal = new Intl.NumberFormat("en-PH", {});
