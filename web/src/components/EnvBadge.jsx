export default function EnvBadge() {
  const env = import.meta.env.VITE_APP_ENV || "unknown";
  if (env === "live") return null;

  return <div className="env-badge">{env.toUpperCase()}</div>;
}
