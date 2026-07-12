import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../services/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Drawer } from "../components/Drawer";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";
import { TableWrapper } from "../components/TableWrapper";
import { showToast } from "../components/Toast";
import {
  Award,
  Zap,
  ShoppingBag,
  Trophy,
  Plus,
  Compass,
  Gift,
  Star
} from "lucide-react";

const challengeSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  xp_reward: z.coerce.number().min(1, "XP reward must be positive"),
  start_date: z.string().min(10, "Start date is required"),
  end_date: z.string().min(10, "End date is required"),
  status: z.string().default("active"),
});

const rewardSchema = z.object({
  name: z.string().min(2, "Reward name is required"),
  description: z.string().optional(),
  points_required: z.coerce.number().min(1, "Points required must be positive"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  status: z.string().default("active"),
});

export const Gamification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"challenges" | "rewards" | "leaderboard" | "badges">("challenges");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"challenge" | "reward" | null>(null);

  const challForm = useForm({ resolver: zodResolver(challengeSchema) });
  const rewForm = useForm({ resolver: zodResolver(rewardSchema) });

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/users/me");
      setCurrentUser(res.data);
    } catch (err) {
      showToast("Failed to retrieve user profile", "error");
    }
  };

  const fetchChallenges = async () => {
    try {
      const res = await api.get("/gamification/challenges");
      setChallenges(res.data);
    } catch (err) {
      showToast("Failed to load challenges", "error");
    }
  };

  const fetchRewards = async () => {
    try {
      const res = await api.get("/rewards");
      setRewards(res.data.items || res.data);
    } catch (err) {
      showToast("Failed to fetch rewards catalogue", "error");
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get("/gamification/leaderboard");
      setLeaderboard(res.data);
    } catch (err) {
      showToast("Failed to fetch leaderboard", "error");
    }
  };

  const fetchBadges = async () => {
    try {
      const res = await api.get("/badges");
      setBadges(res.data.items || res.data);
    } catch (err) {
      showToast("Failed to load badges", "error");
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchChallenges();
    fetchRewards();
    fetchLeaderboard();
    fetchBadges();
  }, []);

  const onAddChallenge = async (data: any) => {
    try {
      await api.post("/gamification/challenges", data);
      showToast("Eco-challenge created successfully!", "success");
      setDrawerOpen(false);
      fetchChallenges();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to create challenge", "error");
    }
  };

  const onAddReward = async (data: any) => {
    try {
      await api.post("/rewards", data);
      showToast("Reward item added to catalogue!", "success");
      setDrawerOpen(false);
      fetchRewards();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to add reward item", "error");
    }
  };

  const handleParticipate = async (id: number) => {
    try {
      await api.post(`/gamification/challenges/${id}/participate`);
      showToast("Joined eco-challenge! Complete activities to earn XP.", "success");
      fetchChallenges();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to join challenge", "error");
    }
  };

  const handleCompleteChallenge = async (id: number) => {
    try {
      await api.put(`/gamification/challenges/${id}/progress?progress=100.0`);
      showToast("Challenge Completed! XP points awarded.", "success");
      fetchChallenges();
      fetchCurrentUser();
      fetchLeaderboard();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Progress update failed", "error");
    }
  };

  const handleRedeem = async (id: number) => {
    try {
      await api.post(`/gamification/rewards/${id}/redeem`);
      showToast("Reward redeemed successfully!", "success");
      fetchRewards();
      fetchCurrentUser();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Redemption failed", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gamification & Rewards</h1>
          <p className="text-sm text-muted-foreground">
            Earn XP, unlock badges, participate in green challenges, and redeem points for sustainable rewards.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => { setDrawerType("challenge"); setDrawerOpen(true); }} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus size={16} /> Create Challenge
          </Button>
          <Button onClick={() => { setDrawerType("reward"); setDrawerOpen(true); }} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus size={16} /> Add Reward Item
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <StatCard
          title="Your Total XP"
          value={currentUser?.xp_points || 0}
          icon={<Zap size={20} className="text-amber-500" />}
          variant="environmental"
        />
        <StatCard
          title="Points Balance"
          value={currentUser?.points_balance || 0}
          icon={<Star size={20} className="text-yellow-500" />}
          variant="environmental"
        />
        <StatCard
          title="Rank on Leaderboard"
          value="#1"
          icon={<Trophy size={20} className="text-indigo-500" />}
          variant="environmental"
        />
        <StatCard
          title="Redeemable Items"
          value={rewards.length}
          icon={<ShoppingBag size={20} className="text-emerald-500" />}
          variant="environmental"
        />
      </div>

      <div className="flex border-b border-border">
        {(["challenges", "rewards", "leaderboard", "badges"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize text-sm border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "challenges" && (
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="text-lg font-semibold mb-4">Active Green Challenges</h3>
          {challenges.length === 0 ? (
            <EmptyState title="No challenges active" description="Create a new challenge above to motivate teams." />
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((c) => (
                <div key={c.id} className="p-4 rounded-lg border border-border bg-background flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-base flex items-center gap-1.5">
                      <Compass className="text-indigo-500 h-4.5 w-4.5" />
                      {c.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                    <div className="mt-2 text-xs flex gap-2 text-muted-foreground">
                      <span>Ends: {new Date(c.end_date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="font-bold text-amber-600">{c.xp_reward} XP Reward</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => handleParticipate(c.id)} className="flex-1">
                      Join Challenge
                    </Button>
                    <Button size="sm" onClick={() => handleCompleteChallenge(c.id)} className="flex-1">
                      Complete (100%)
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "rewards" && (
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="text-lg font-semibold mb-4">Eco-Rewards Shop</h3>
          {rewards.length === 0 ? (
            <EmptyState title="Catalogue is empty" description="Add items to the rewards store." />
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {rewards.map((r) => (
                <div key={r.id} className="p-4 rounded-lg border border-border bg-background flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-base flex items-center gap-1.5">
                      <Gift className="text-emerald-500 h-4.5 w-4.5" />
                      {r.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                    <div className="mt-2 text-xs flex justify-between text-muted-foreground">
                      <span>Stock: <strong className="text-foreground">{r.stock} left</strong></span>
                      <span className="font-bold text-emerald-600">{r.points_required} Points</span>
                    </div>
                  </div>
                  <Button size="sm" disabled={r.stock <= 0} onClick={() => handleRedeem(r.id)} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700">
                    {r.stock > 0 ? "Redeem Item" : "Out of stock"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="text-lg font-semibold mb-4">Top Green Champions</h3>
          {leaderboard.length === 0 ? (
            <EmptyState title="Leaderboard is empty" description="Complete green actions to show up on the ranks." />
          ) : (
            <TableWrapper headers={["Rank", "Name", "Total XP Points", "Redeemable Points Balance"]}>
              {leaderboard.map((user, index) => (
                <tr key={user.id} className="border-b border-border">
                  <td className="p-4 font-bold text-indigo-600">#{index + 1}</td>
                  <td className="p-4 font-semibold">{user.first_name} {user.last_name}</td>
                  <td className="p-4 flex items-center gap-1 font-bold">
                    <Zap size={14} className="text-amber-500" /> {user.xp_points} XP
                  </td>
                  <td className="p-4 font-medium">{user.points_balance} pts</td>
                </tr>
              ))}
            </TableWrapper>
          )}
        </div>
      )}

      {activeTab === "badges" && (
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="text-lg font-semibold mb-4">Available Badges & Unlock Rules</h3>
          {badges.length === 0 ? (
            <EmptyState title="No badges defined" description="Set up badges in Master Data." />
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {badges.map((b) => (
                <div key={b.id} className="p-4 rounded-lg border border-border bg-background flex flex-col gap-2 items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-base">{b.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{b.description}</p>
                  <span className="mt-2 text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                    Rule: {b.unlock_rule}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={
        drawerType === "challenge" ? "Create Green Team Challenge" : "Add Reward Item"
      }>
        {drawerType === "challenge" && (
          <form onSubmit={challForm.handleSubmit(onAddChallenge)} className="flex flex-col gap-4">
            <Input label="Challenge Title" {...challForm.register("title")} error={challForm.formState.errors.title?.message as string} />
            <Input label="Description" {...challForm.register("description")} />
            <Input label="XP Reward" type="number" {...challForm.register("xp_reward")} error={challForm.formState.errors.xp_reward?.message as string} />
            <Input label="Start Date" type="date" {...challForm.register("start_date")} error={challForm.formState.errors.start_date?.message as string} />
            <Input label="End Date" type="date" {...challForm.register("end_date")} error={challForm.formState.errors.end_date?.message as string} />
            <Button type="submit">Publish Challenge</Button>
          </form>
        )}

        {drawerType === "reward" && (
          <form onSubmit={rewForm.handleSubmit(onAddReward)} className="flex flex-col gap-4">
            <Input label="Reward Name" {...rewForm.register("name")} error={rewForm.formState.errors.name?.message as string} />
            <Input label="Description" {...rewForm.register("description")} />
            <Input label="Points Required" type="number" {...rewForm.register("points_required")} error={rewForm.formState.errors.points_required?.message as string} />
            <Input label="Stock Count" type="number" {...rewForm.register("stock")} error={rewForm.formState.errors.stock?.message as string} />
            <Button type="submit">Save Reward Item</Button>
          </form>
        )}
      </Drawer>
    </div>
  );
};
