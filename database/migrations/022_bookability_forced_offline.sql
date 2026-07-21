-- Bakes forced_offline into vw_provider_bookability's is_bookable/bookability_reason
-- and exposes it as its own column. Previously forced_offline was only readable by
-- joining service_provider_profiles directly, so Go Online (availability.service.js)
-- had no way to see it, and is_bookable's "not forcefully offline" condition (required
-- independently by spec alongside verified/not-banned/valid-membership) was only ever
-- true by coincidence, since forceOfflineAfterGrace always sets manual_online=false in
-- the same update as forced_offline=true.
CREATE OR REPLACE VIEW vw_provider_bookability AS
 SELECT spp.provider_user_id,
    (spp.verification_status = 'APPROVED'::verification_status) AS is_verified,
    ((m.membership_status = 'ACTIVE'::membership_status) OR ((m.membership_status = 'ACTIVE'::membership_status) AND (now() <= m.grace_ends_at)) OR ((m.membership_status = 'EXPIRED'::membership_status) AND (now() <= m.grace_ends_at))) AS has_valid_membership_or_grace,
    (ub.user_ban_id IS NOT NULL) AS has_active_ban,
    spp.manual_online,
    ((spp.verification_status = 'APPROVED'::verification_status) AND (spp.manual_online = true) AND (spp.forced_offline = false) AND (ub.user_ban_id IS NULL) AND ((m.membership_status = 'ACTIVE'::membership_status) OR ((m.membership_status = 'EXPIRED'::membership_status) AND (now() <= m.grace_ends_at)))) AS is_bookable,
        CASE
            WHEN (spp.verification_status <> 'APPROVED'::verification_status) THEN 'Not verified'::text
            WHEN (ub.user_ban_id IS NOT NULL) THEN 'Banned'::text
            WHEN (spp.forced_offline = true) THEN 'Forced offline (membership expired)'::text
            WHEN (NOT spp.manual_online) THEN 'Provider offline'::text
            WHEN (m.membership_id IS NULL) THEN 'No membership'::text
            WHEN ((m.membership_status = 'EXPIRED'::membership_status) AND (now() > m.grace_ends_at)) THEN 'Membership expired'::text
            ELSE 'Available'::text
        END AS bookability_reason,
    spp.forced_offline
   FROM ((service_provider_profiles spp
     LEFT JOIN vw_current_provider_membership m USING (provider_user_id))
     LEFT JOIN user_bans ub ON (((ub.user_id = spp.provider_user_id) AND (ub.ban_status = 'ACTIVE'::ban_status))));
