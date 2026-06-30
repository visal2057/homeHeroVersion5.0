-- ============================================================================
-- Development seed: 20+ verified, active service providers per category
-- ----------------------------------------------------------------------------
-- Creates 100 service providers so that every service category has at least
-- 20 bookable providers, for testing search / filtering / booking.
--
-- For each of the 5 categories we make 20 providers whose PRIMARY category is
-- that category (-> 20 per category guaranteed). The first 8 of those 20 also
-- get a SECOND category (the next category, wrapping around), so we exercise
-- both single- and dual-category providers. Final count per category = 28.
--
-- Every provider is made fully "bookable" as defined by vw_provider_bookability:
--   * profile verification_status = APPROVED  (+ an APPROVED application record)
--   * profile manual_online = true
--   * an ACTIVE membership row
--   * no active ban
--
-- Each provider gets a unique Sri Lankan first name, so the data reads
-- naturally, e.g. full name "Kamal Perera", username "kamal_sp",
-- email "kamalsp@gmail.com". All seed accounts share the password
-- "Password123!"; we use that one shared password hash as the marker to find
-- and remove seed rows (a real user would never have this exact hash).
--
-- Run:  psql -h localhost -U postgres -d homehero_db -f database/seeds/development_providers.sql
-- Safe to run twice: the guard at the top skips if seed data already exists.
-- ============================================================================

DO $$
DECLARE
    -- bcrypt hash (cost 12) of the password "Password123!"
    v_pw          text := '$2a$12$mNfIDhXTyEyHMBrEWcVKWeSbe9T.BCK3q4cj8jyLwE0WhT5lMyQjG';

    -- 100 unique Sri Lankan first names (one per provider, indexed by v_seq).
    v_first_names text[] := ARRAY[
        'Kamal','Ashen','Ajith','Nuwan','Sachith','Kasun','Tharindu','Dinesh','Roshan','Chathura',
        'Lasith','Sandun','Pradeep','Gayan','Nuwanga','Isuru','Dhanushka','Thilina','Buddhika','Charith',
        'Supun','Janaka','Nimal','Sunil','Mahesh','Chaminda','Sampath','Hashan','Lahiru','Malith',
        'Nadeesh','Oshada','Pasan','Ravindu','Sahan','Tharaka','Udara','Vimukthi','Yasiru','Akila',
        'Binara','Chamod','Damith','Eranga','Heshan','Imesh','Janith','Kavindu','Lakmal','Manoj',
        'Nipun','Oshan','Pubudu','Ranil','Sanjaya','Tharusha','Upul','Vishwa','Waruna','Yohan',
        'Amila','Chathuranga','Dasun','Geeth','Harsha','Kalana','Lasantha','Madhawa','Naveen','Praveen',
        'Rasanga','Senura','Thisara','Vinod','Asela','Chamath','Dilan','Gihan','Hiran','Kavinda',
        'Lakshan','Menaka','Nuwantha','Pasindu','Raveen','Shehan','Theekshana','Udith','Vimal','Wasana',
        'Yasas','Anuradha','Bhanuka','Chinthaka','Duminda','Gayantha','Hasitha','Ishara','Jeewan','Kavishka'
    ];

    -- Common Sri Lankan surnames, cycled through for the full name.
    v_surnames    text[] := ARRAY[
        'Perera','Silva','Fernando','Bandara','Jayawardena','Wickramasinghe','Rajapaksa','Gunasekara',
        'Dissanayake','Ranatunga','Senanayake','Kumara','Mendis','Peiris','Wijesinghe','Herath',
        'Ekanayake','Amarasinghe','Karunaratne','Gunawardena'
    ];

    v_admin_id    bigint;      -- who "reviewed" the verification applications
    v_rule1_id    smallint;    -- pricing rule for 1 category
    v_rule2_id    smallint;    -- pricing rule for 2 categories

    v_cat         int;         -- current primary category (1..5)
    v_i           int;         -- provider index within the category (1..20)
    v_seq         int := 0;    -- global counter -> picks the name, builds login
    v_uid         bigint;      -- user_id of the provider just created
    v_is_dual     boolean;     -- does this provider get a second category?
    v_second_cat  int;         -- the second category, when dual
    v_count       smallint;    -- 1 or 2 categories
    v_rule_id     smallint;    -- pricing rule matching v_count
    v_price       numeric(12,2);

    v_first       text;        -- this provider's first name
    v_surname     text;        -- this provider's surname
    v_handle      text;        -- lowercased first name, used in login + email
BEGIN
    -- Idempotency guard: every seed account shares v_pw, so use it to detect
    -- whether we have already seeded.
    IF EXISTS (SELECT 1 FROM users WHERE password_hash = v_pw) THEN
        RAISE NOTICE 'Seed providers already exist - skipping.';
        RETURN;
    END IF;

    -- Look up reference rows instead of hardcoding their generated ids.
    SELECT user_id INTO v_admin_id
    FROM users
    WHERE role_id IN (SELECT role_id FROM roles
                      WHERE role_code IN ('VERIFICATION_ADMIN', 'SYSTEM_ADMIN'))
    ORDER BY user_id
    LIMIT 1;

    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'No admin user found to review verification applications.';
    END IF;

    SELECT membership_pricing_rule_id INTO v_rule1_id
    FROM membership_pricing_rules WHERE category_count = 1;
    SELECT membership_pricing_rule_id INTO v_rule2_id
    FROM membership_pricing_rules WHERE category_count = 2;

    -- Outer loop: one block of 20 providers per category.
    FOR v_cat IN 1..5 LOOP
        FOR v_i IN 1..20 LOOP
            v_seq     := v_seq + 1;
            v_is_dual := (v_i <= 8);   -- first 8 of each 20 are dual-category

            -- Pick this provider's name. First names are unique per v_seq;
            -- surnames are cycled so they can repeat (which is realistic).
            v_first   := v_first_names[v_seq];
            v_surname := v_surnames[((v_seq - 1) % array_length(v_surnames, 1)) + 1];
            v_handle  := lower(v_first);

            -- 1) The user account (role 2 = SERVICE_PROVIDER).
            --    Login is built from the first name, e.g. kamal_sp / kamalsp@gmail.com.
            --    Token "HpNNNN" satisfies the 6-char upper+lower+digit rule.
            INSERT INTO users (role_id, username, email, password_hash,
                               user_token, full_name, phone, profile_image_url)
            VALUES (2,
                    v_handle || '_sp',
                    v_handle || 'sp@gmail.com',
                    v_pw,
                    'Hp' || to_char(v_seq, 'FM0000'),
                    v_first || ' ' || v_surname,
                    '+9477' || lpad(v_seq::text, 7, '0'),
                    -- cycle through the 20 photos in storage/public/profile-images
                    '/public/profile-images/seed_'
                        || lpad((((v_seq - 1) % 20) + 1)::text, 2, '0') || '.jpg')
            RETURNING user_id INTO v_uid;

            -- 2) The provider profile: verified + online so it is bookable.
            INSERT INTO service_provider_profiles
                (provider_user_id, home_district_id, service_district_id,
                 bio, work_hours_details, hourly_charge_estimate,
                 manual_online, verification_status, verified_at)
            VALUES (v_uid,
                    ((v_seq % 25) + 1),                 -- spread across 25 districts
                    ((v_seq % 25) + 1),
                    'Experienced service provider available for bookings. '
                        || 'Seed account for development and testing.',
                    'Mon-Fri 8am-6pm',
                    1000 + ((v_seq % 20) * 50),         -- varied hourly estimate
                    true,
                    'APPROVED',
                    now());

            -- 3) Category assignment(s): primary, plus an optional second.
            INSERT INTO provider_service_categories (provider_user_id, service_category_id)
            VALUES (v_uid, v_cat);

            IF v_is_dual THEN
                v_second_cat := (v_cat % 5) + 1;        -- next category, wrapping
                INSERT INTO provider_service_categories (provider_user_id, service_category_id)
                VALUES (v_uid, v_second_cat);
                v_count   := 2;
                v_rule_id := v_rule2_id;
                v_price   := 9998.00;
            ELSE
                v_count   := 1;
                v_rule_id := v_rule1_id;
                v_price   := 4999.00;
            END IF;

            -- 4) An ACTIVE membership (1 month, +3 day grace). Sequence 1 = first.
            INSERT INTO provider_memberships
                (provider_user_id, membership_pricing_rule_id, membership_sequence_number,
                 payment_type, category_count_snapshot, price_amount, membership_status,
                 starts_at, expires_at, grace_ends_at)
            VALUES (v_uid, v_rule_id, 1,
                    'FIRST_PAYMENT', v_count, v_price, 'ACTIVE',
                    now(),
                    now() + interval '1 month',
                    now() + interval '1 month' + interval '3 days');

            -- 5) The matching APPROVED verification application (attempt 1).
            INSERT INTO sp_verification_applications
                (provider_user_id, attempt_number, verification_status,
                 police_station_name, police_report_date,
                 terms_version, terms_accepted_at, submitted_at,
                 reviewed_by_user_id, reviewed_at)
            VALUES (v_uid, 1, 'APPROVED',
                    'Colombo Police Station', current_date - 10,
                    'v1.0', now(), now(),
                    v_admin_id, now());
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Seeded % service providers (100 expected).', v_seq;
END $$;


-- ============================================================================
-- CLEANUP (run manually to remove the seed data).
-- Seed accounts are identified by their shared password hash.
-- Delete children before parents so it works regardless of FK cascade rules.
-- ----------------------------------------------------------------------------
-- DELETE FROM provider_service_categories
--  WHERE provider_user_id IN (SELECT user_id FROM users
--    WHERE password_hash = '$2a$12$mNfIDhXTyEyHMBrEWcVKWeSbe9T.BCK3q4cj8jyLwE0WhT5lMyQjG');
-- DELETE FROM provider_memberships
--  WHERE provider_user_id IN (SELECT user_id FROM users
--    WHERE password_hash = '$2a$12$mNfIDhXTyEyHMBrEWcVKWeSbe9T.BCK3q4cj8jyLwE0WhT5lMyQjG');
-- DELETE FROM sp_verification_applications
--  WHERE provider_user_id IN (SELECT user_id FROM users
--    WHERE password_hash = '$2a$12$mNfIDhXTyEyHMBrEWcVKWeSbe9T.BCK3q4cj8jyLwE0WhT5lMyQjG');
-- DELETE FROM service_provider_profiles
--  WHERE provider_user_id IN (SELECT user_id FROM users
--    WHERE password_hash = '$2a$12$mNfIDhXTyEyHMBrEWcVKWeSbe9T.BCK3q4cj8jyLwE0WhT5lMyQjG');
-- DELETE FROM users
--  WHERE password_hash = '$2a$12$mNfIDhXTyEyHMBrEWcVKWeSbe9T.BCK3q4cj8jyLwE0WhT5lMyQjG';
-- ============================================================================
