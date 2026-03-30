import { useParams } from 'react-router-dom'

import TeamUGV from './TeamsPages/TeamUGV'
import TeamAUV from './TeamsPages/TeamAUV'
import TeamInferno from './TeamsPages/TeamInferno'
import TeamRaftaar from './TeamsPages/TeamRaftaar'
// import UAV from './TeamsPages/TeamUAV'
// import others...

const teamComponents = {
  UGV: TeamUGV,
  AUV: TeamAUV,
  RAFTAAR: TeamRaftaar,
  INFERNO: TeamInferno,
  // add more
}

export default function TeamPage() {
  const { teamName } = useParams()

  const TeamComponent = teamComponents[teamName]

  if (!TeamComponent) {
    return <div style={{ color: "white", padding: "40px" }}>Team not found</div>
  }

  return <TeamComponent />
}