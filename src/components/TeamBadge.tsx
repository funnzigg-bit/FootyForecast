const TeamBadge = ({ name, logo, size = 18 }: { name: string; logo?: string; size?: number }) => (
  <span className="inline-flex items-center gap-1.5">
    {logo ? (
      <img src={logo} alt={name} width={size} height={size} className="shrink-0 object-contain" loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
    ) : null}
    <span>{name}</span>
  </span>
);

export default TeamBadge;
