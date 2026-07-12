import React from "react";
import { StatCard } from "../components/StatCard";
import { TableWrapper } from "../components/TableWrapper";
import { Trophy, Award } from "lucide-react";
import { Button } from "../components/Button";

export const Gamification: React.FC = () => {
  const leaderboardHeaders = ["Rank", "Department", "Active Badges", "Emission Offsets (kg)", "Carbon Neutrality Point Rate", "Actions"];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-esg-gamification">EcoPilot Gamification League</h1>
        <p className="text-sm text-muted-foreground/80">
          Foster organizational culture by engaging departments in sustainability goals, carbon reduction competitions, and achievement rewards.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StatCard
          title="Top Performing Team"
          value="Product Engineering"
          change={12.4}
          icon={<Trophy size={20} />}
          variant="gamification"
        />
        <StatCard
          title="Active Corporate Challenges"
          value="6 Challenges"
          change={0}
          icon={<Trophy size={20} />}
          variant="gamification"
        />
        <StatCard
          title="Total Green Points Issued"
          value="18,490 PTS"
          change={44.8}
          icon={<Trophy size={20} />}
          variant="gamification"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Department Sustainability Leaderboard</h2>
          <span className="text-xs font-medium bg-secondary text-muted-foreground px-2 py-1 rounded">
            Competitive Leaderboard
          </span>
        </div>

        <TableWrapper headers={leaderboardHeaders}>
          <tr>
            <td className="p-4 font-semibold text-amber-500 flex items-center gap-1.5">
              <Trophy size={14} /> #1
            </td>
            <td className="p-4 font-medium">Product Design & Engineering</td>
            <td className="p-4">12 Badges</td>
            <td className="p-4">14,200 kg</td>
            <td className="p-4 text-emerald-600 dark:text-emerald-400 font-semibold">+82.4% / Quarter</td>
            <td className="p-4">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                <Award size={12} /> View Awards
              </Button>
            </td>
          </tr>
          <tr>
            <td className="p-4 font-semibold text-slate-400 flex items-center gap-1.5">
              #2
            </td>
            <td className="p-4 font-medium">Finance Operations</td>
            <td className="p-4">9 Badges</td>
            <td className="p-4">8,900 kg</td>
            <td className="p-4 text-emerald-600 dark:text-emerald-400 font-semibold">+34.1% / Quarter</td>
            <td className="p-4">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                <Award size={12} /> View Awards
              </Button>
            </td>
          </tr>
        </TableWrapper>
      </div>
    </div>
  );
};
