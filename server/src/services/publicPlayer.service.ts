import Users from "../models/Users";
import ApiError from "../utils/apiError";

export const getPublicPlayerProfile = async (username: string) => {
  const user = await Users.findOne({
    userName: username.toLowerCase(),
    role: "player",
  })
    .select(
      "firstName lastName userName avatar bio region game playerRole totalKills totalDeaths totalGames tourneysPlayed tourneysWon createdAt",
    )
    .populate("game", "name");

  if (!user) {
    throw new ApiError("Player not found", 404);
  }

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.userName,
    avatar: user.avatar
      ? {
          url: user.avatar.url,
        }
      : undefined,
    bio: user.bio,
    region: user.region,
    game: user.game,
    totalKills: user.totalKills,
    totalDeaths: user.totalDeaths,
    totalGames: user.totalGames,
    tourneysPlayed: user.tourneysPlayed,
    tourneysWon: user.tourneysWon,
    createdAt: user.createdAt,
  };
};

export const getAllPlayers = async (
  search: string,
  page: number,
  limit: number,
  country?: string,
  game?: string,
) => {
  const filter: any = {};

  const skip = (page - 1) * limit;

  filter.role = "player";

  if (search) {
    filter.userName = {
      $regex: search,
      $options: "i",
    };
  }

  if (country) {
    filter.country = country;
  }
  if (game) {
    filter.game = game;
  }

  const players = await Users.find(filter)
    .select(
      "firstName lastName userName avatar bio region game playerRole totalKills totalDeaths totalGames tourneysPlayed tourneysWon createdAt",
    )
    .populate("game", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Users.countDocuments(filter);

  return {
    players: players.map((player) => ({
      id: player._id,
      firstName: player.firstName,
      lastName: player.lastName,
      userName: player.userName,
      avatar: player.avatar
        ? {
            url: player.avatar.url,
          }
        : undefined,
      bio: player.bio,
      region: player.region,
      game: player.game,
      totalKills: player.totalKills,
      totalDeaths: player.totalDeaths,
      totalGames: player.totalGames,
      tourneysPlayed: player.tourneysPlayed,
      tourneysWon: player.tourneysWon,
      createdAt: player.createdAt,
    })),
    total,
  };
};
