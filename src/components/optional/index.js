/**
 * @typedef Props
 * @property {boolean} condition
 * @property {React.ReactNode} children
 *
 * @param {Props} props
 * @returns
 */
export default function Optional(props) {
  const { condition, children, fallback } = props;

  if (condition) return children;

  if (fallback) return fallback;

  return null;
}
