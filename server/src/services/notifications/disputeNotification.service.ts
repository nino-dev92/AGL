import Dispute from "../../models/Dispute";
import { createNotification } from "../notification.service";
import Teams from "../../models/Teams";

const getDisputeNotificationData = async (disputeId: string) => {
  const dispute = await Dispute.findById(disputeId)
    .populate({
      path: "match",
      select: "teamA teamB tournament round matchNumber",
      populate: [
        {
          path: "teamA",
          select: "name",
        },
        {
          path: "teamB",
          select: "name",
        },
      ],
    })
    .populate("raisedBy", "firstName lastName userName")
    .populate("resolvedBy", "firstName lastName userName");

  if (!dispute) {
    throw new Error("Dispute not found");
  }

  return dispute;
};

const getDisputeParticipantIds = async (dispute: any): Promise<string[]> => {
  const participantIds = new Set<string>();

  const match = dispute.match;

  if (!match) {
    return [];
  }

  if (dispute.raisedBy) {
    participantIds.add(dispute.raisedBy._id.toString());
  }

  const teams = await Teams.find({
    _id: { $in: [match.teamA, match.teamB] },
  }).select("manager members");

  for (const team of teams) {
    participantIds.add(team.manager.toString());

    for (const member of team.members) {
      participantIds.add(member.toString());
    }
  }

  return Array.from(participantIds);
};

export const notifyDisputeCreated = async (disputeId: string) => {
  const dispute = await getDisputeNotificationData(disputeId);

  const match = dispute.match as any;
  const recipientIds = await getDisputeParticipantIds(dispute);

  if (!match) {
    return;
  }

  await Promise.all(
    recipientIds.map((recipientId) =>
      createNotification({
        recipient: recipientId,
        type: "dispute-created",
        title: "New Match Dispute",
        message: `A dispute has been raised for the match between ${match.teamA.name} and ${match.teamB.name}.`,
        tournament: match.tournament.toString(),
        match: match._id.toString(),
        dispute: dispute._id.toString(),
      }),
    ),
  );
};

export const notifyDisputeResolved = async (disputeId: string) => {
  const dispute = await getDisputeNotificationData(disputeId);

  const match = dispute.match as any;
  const recipientIds = await getDisputeParticipantIds(dispute);

  if (!match) {
    return;
  }

  await Promise.all(
    recipientIds.map((recipientId) =>
      createNotification({
        recipient: recipientId,
        type: "dispute-resolved",
        title: "Match Dispute Resolved",
        message: `The dispute for the match between ${match.teamA.name} and ${match.teamB.name} has been resolved.`,
        tournament: match.tournament.toString(),
        match: match._id.toString(),
        dispute: dispute._id.toString(),
      }),
    ),
  );
};
