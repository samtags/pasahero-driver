const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

const format = (value) =>
  currencyFormatter.format(value).replace(/^(\D+)/g, "$1 ");

const amount = {
  format,
};

export default amount;

export const decimal = new Intl.NumberFormat("en-PH", {});
