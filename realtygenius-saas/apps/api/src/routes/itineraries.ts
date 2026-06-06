import { Router } from "express";
import { randomBytes } from "crypto";
import { z } from "zod";
import { transaction, query } from "../db/pool.js";
import { requireAuth } from "../http/auth.js";
import { optimizeViewingRoute } from "../services/maps.js";
import { sendWhatsApp } from "../services/notifications.js";

export const itinerariesRouter = Router();
itinerariesRouter.use(requireAuth);

itinerariesRouter.post("/", async (req, res) => {
  const body = z.object({
    buyerId: z.string().uuid(),
    title: z.string(),
    viewingDate: z.string(),
    startAt: z.string(),
    propertyIds: z.array(z.string().uuid()).min(2).max(8)
  }).parse(req.body);

  const props = await query<{ id: string; address: string; latitude: number; longitude: number }>(
    "SELECT id, address, latitude, longitude FROM properties WHERE agent_id = $1 AND id = ANY($2::uuid[])",
    [req.user!.id, body.propertyIds]
  );
  const route = await optimizeViewingRoute(props.rows.map((property) => ({
    propertyId: property.id,
    address: property.address,
    latitude: Number(property.latitude),
    longitude: Number(property.longitude)
  })), body.startAt);

  const created = await transaction(async (client) => {
    const itinerary = await client.query(
      `INSERT INTO viewing_itineraries (agent_id, buyer_id, title, viewing_date, share_token, route_summary)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user!.id, body.buyerId, body.title, body.viewingDate, randomBytes(18).toString("hex"), route]
    );

    let cursor = new Date(body.startAt);
    for (const stop of route.orderedStops) {
      cursor = new Date(cursor.getTime() + stop.travelMinutes * 60000);
      await client.query(
        `INSERT INTO itinerary_stops (itinerary_id, property_id, stop_order, starts_at, travel_minutes)
         VALUES ($1,$2,$3,$4,$5)`,
        [itinerary.rows[0].id, stop.propertyId, stop.order, cursor.toISOString(), stop.travelMinutes]
      );
      cursor = new Date(cursor.getTime() + 30 * 60000);
    }

    return itinerary.rows[0];
  });

  res.status(201).json(created);
});

itinerariesRouter.post("/:id/request-confirmations", async (req, res) => {
  const stops = await query<{ id: string; landlord_phone: string; starts_at: string; title: string }>(
    `SELECT s.id, s.landlord_phone, s.starts_at, p.title
     FROM itinerary_stops s JOIN properties p ON p.id = s.property_id
     JOIN viewing_itineraries i ON i.id = s.itinerary_id
     WHERE i.id = $1 AND i.agent_id = $2`,
    [req.params.id, req.user!.id]
  );

  const sent = await Promise.all(stops.rows.filter((s) => s.landlord_phone).map((stop) =>
    sendWhatsApp(
      stop.landlord_phone,
      `Hi, requesting viewing for ${stop.title} at ${new Date(stop.starts_at).toLocaleString("en-MY")}. Please confirm.`,
      { agentTriggered: true }
    )
  ));

  await query("UPDATE viewing_itineraries SET status = 'requested' WHERE id = $1 AND agent_id = $2", [req.params.id, req.user!.id]);
  res.json({ sent });
});

itinerariesRouter.get("/:shareToken/public", async (req, res) => {
  const itinerary = await query(
    `SELECT i.*, b.name buyer_name FROM viewing_itineraries i
     JOIN buyers b ON b.id = i.buyer_id
     WHERE i.share_token = $1`,
    [req.params.shareToken]
  );
  const stops = await query(
    `SELECT s.*, p.title, p.address, p.asking_price, p.image_url
     FROM itinerary_stops s JOIN properties p ON p.id = s.property_id
     WHERE s.itinerary_id = $1 ORDER BY s.stop_order`,
    [itinerary.rows[0].id]
  );
  res.json({ itinerary: itinerary.rows[0], stops: stops.rows });
});
