import { useAffiliatedContext } from "~/contexts/affiliations";

const TeamProfileButton = () => {
  const { affiliations } = useAffiliatedContext();

  return (
    affiliations && (
      <div>
        {affiliations[0]?.logo ? (
          <img
            className="rounded-full"
            alt="team-logo"
            src={affiliations[0]?.logo!}
            height={50}
            width={50}
          />
        ) : (
          <div>
            {affiliations[0]?.city.slice(0, 1)}{" "}
            {affiliations[0]?.name.slice(0, 1)}
          </div>
        )}
      </div>
    )
  );
};

export default TeamProfileButton;
