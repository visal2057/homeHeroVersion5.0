--
-- PostgreSQL database dump
--

\restrict jpcGasqii4alsmn0mjLaNP6AfC1lz85SAxPbrhn9iRJlxoAI3OjaOXU9TK3wV13

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: announcement_audience; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.announcement_audience AS ENUM (
    'ALL_USERS',
    'CLIENTS',
    'SERVICE_PROVIDERS'
);


--
-- Name: announcement_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.announcement_status AS ENUM (
    'DRAFT',
    'SCHEDULED',
    'ACTIVE',
    'ARCHIVED'
);


--
-- Name: ban_request_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ban_request_status AS ENUM (
    'PENDING',
    'IMPLEMENTED',
    'REJECTED',
    'CANCELLED'
);


--
-- Name: ban_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ban_status AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'REVOKED'
);


--
-- Name: ban_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ban_type AS ENUM (
    'TEMPORARY',
    'PERMANENT'
);


--
-- Name: booking_payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_payment_status AS ENUM (
    'SUCCESS',
    'EXTERNAL_CONFIRMED',
    'REFUNDED'
);


--
-- Name: booking_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'CANCELLED',
    'COMPLETED'
);


--
-- Name: complaint_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.complaint_status AS ENUM (
    'SUBMITTED',
    'UNDER_REVIEW',
    'RESOLVED',
    'BAN_RECOMMENDED',
    'CLOSED'
);


--
-- Name: email_delivery_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.email_delivery_status AS ENUM (
    'QUEUED',
    'SENT',
    'FAILED'
);


--
-- Name: membership_payment_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.membership_payment_type AS ENUM (
    'FIRST_PAYMENT',
    'RENEWAL'
);


--
-- Name: membership_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.membership_status AS ENUM (
    'PENDING_PAYMENT',
    'ACTIVE',
    'EXPIRED',
    'CANCELLED'
);


--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'CASH',
    'CARD'
);


--
-- Name: payment_txn_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_txn_status AS ENUM (
    'SUCCESS',
    'FAILED',
    'REFUNDED'
);


--
-- Name: revenue_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.revenue_type AS ENUM (
    'MEMBERSHIP',
    'CLIENT_PAYMENT_COMMISSION'
);


--
-- Name: site_asset_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.site_asset_type AS ENUM (
    'HOME_HERO_IMAGE',
    'LOGIN_SIDE_IMAGE'
);


--
-- Name: user_account_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_account_status AS ENUM (
    'ACTIVE',
    'DEACTIVATED'
);


--
-- Name: verification_doc_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.verification_doc_type AS ENUM (
    'FACE_PHOTO',
    'NIC_FRONT',
    'NIC_BACK',
    'POLICE_REPORT'
);


--
-- Name: verification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.verification_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: trg_booking_status_history(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_booking_status_history() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' OR OLD.booking_status IS DISTINCT FROM NEW.booking_status THEN
        INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by_user_id)
        VALUES (
            NEW.booking_id,
            CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.booking_status END,
            NEW.booking_status,
            NEW.cancelled_by_user_id
        );
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: trg_check_client_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_check_client_role() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (SELECT role_id FROM users WHERE user_id = NEW.client_user_id) !=
       (SELECT role_id FROM roles WHERE role_code = 'CLIENT') THEN
        RAISE EXCEPTION 'User % does not have the CLIENT role', NEW.client_user_id;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: trg_check_provider_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_check_provider_role() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (SELECT role_id FROM users WHERE user_id = NEW.provider_user_id) !=
       (SELECT role_id FROM roles WHERE role_code = 'SERVICE_PROVIDER') THEN
        RAISE EXCEPTION 'User % does not have the SERVICE_PROVIDER role', NEW.provider_user_id;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: trg_max_three_portfolio_images(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_max_three_portfolio_images() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (SELECT COUNT(*) FROM portfolio_post_images WHERE portfolio_post_id = NEW.portfolio_post_id) >= 3 THEN
        RAISE EXCEPTION 'Portfolio post % already has 3 images', NEW.portfolio_post_id;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: trg_max_two_categories(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_max_two_categories() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (SELECT COUNT(*) FROM provider_service_categories
        WHERE provider_user_id = NEW.provider_user_id) >= 2 THEN
        RAISE EXCEPTION 'Provider % already has 2 service categories', NEW.provider_user_id;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: trg_validate_booking_transition(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_validate_booking_transition() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.booking_status = NEW.booking_status THEN RETURN NEW; END IF;
    IF OLD.booking_status IN ('REJECTED','CANCELLED','COMPLETED') THEN
        RAISE EXCEPTION 'Cannot transition from terminal status %', OLD.booking_status;
    END IF;
    IF OLD.booking_status = 'PENDING' AND NEW.booking_status NOT IN ('ACCEPTED','REJECTED','CANCELLED') THEN
        RAISE EXCEPTION 'Invalid transition PENDING → %', NEW.booking_status;
    END IF;
    IF OLD.booking_status = 'ACCEPTED' AND NEW.booking_status NOT IN ('COMPLETED','CANCELLED') THEN
        RAISE EXCEPTION 'Invalid transition ACCEPTED → %', NEW.booking_status;
    END IF;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcement_reads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcement_reads (
    announcement_id bigint NOT NULL,
    user_id bigint NOT NULL,
    read_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    announcement_id bigint NOT NULL,
    title character varying(200) NOT NULL,
    message_body text NOT NULL,
    audience public.announcement_audience NOT NULL,
    announcement_status public.announcement_status DEFAULT 'DRAFT'::public.announcement_status NOT NULL,
    scheduled_for timestamp with time zone,
    published_at timestamp with time zone,
    archived_at timestamp with time zone,
    created_by_user_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: announcements_announcement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.announcements ALTER COLUMN announcement_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.announcements_announcement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    audit_log_id bigint NOT NULL,
    actor_user_id bigint,
    action_code character varying(100) NOT NULL,
    entity_type character varying(80) NOT NULL,
    entity_id bigint,
    description text NOT NULL,
    metadata jsonb,
    ip_address inet,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_logs_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.audit_logs ALTER COLUMN audit_log_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.audit_logs_audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_sessions (
    session_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id bigint NOT NULL,
    refresh_token_hash text NOT NULL,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone
);


--
-- Name: ban_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ban_requests (
    ban_request_id bigint NOT NULL,
    complaint_id bigint NOT NULL,
    requested_user_id bigint NOT NULL,
    requested_by_user_id bigint NOT NULL,
    ban_type public.ban_type NOT NULL,
    requested_ends_at timestamp with time zone,
    reason text NOT NULL,
    request_status public.ban_request_status DEFAULT 'PENDING'::public.ban_request_status NOT NULL,
    reviewed_by_user_id bigint,
    reviewed_at timestamp with time zone,
    system_admin_note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_ban_ends_at CHECK ((((ban_type = 'TEMPORARY'::public.ban_type) AND (requested_ends_at IS NOT NULL)) OR ((ban_type = 'PERMANENT'::public.ban_type) AND (requested_ends_at IS NULL))))
);


--
-- Name: ban_requests_ban_request_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.ban_requests ALTER COLUMN ban_request_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.ban_requests_ban_request_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: booking_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_images (
    booking_image_id bigint NOT NULL,
    booking_id bigint NOT NULL,
    storage_path text NOT NULL,
    original_filename character varying(255) NOT NULL,
    mime_type character varying(120) NOT NULL,
    file_size_bytes bigint NOT NULL,
    display_order smallint DEFAULT 1 NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: booking_images_booking_image_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.booking_images ALTER COLUMN booking_image_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.booking_images_booking_image_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: booking_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_locations (
    booking_id bigint NOT NULL,
    address_snapshot text NOT NULL,
    latitude_snapshot numeric(9,6) NOT NULL,
    longitude_snapshot numeric(9,6) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: booking_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_payments (
    booking_payment_id bigint NOT NULL,
    booking_id bigint NOT NULL,
    payment_method public.payment_method NOT NULL,
    service_amount numeric(12,2),
    platform_fee numeric(12,2) GENERATED ALWAYS AS (
CASE
    WHEN (payment_method = 'CARD'::public.payment_method) THEN round((service_amount * 0.05), 2)
    ELSE (0)::numeric
END) STORED,
    total_amount numeric(12,2) GENERATED ALWAYS AS (
CASE
    WHEN (service_amount IS NULL) THEN NULL::numeric
    ELSE (service_amount +
    CASE
        WHEN (payment_method = 'CARD'::public.payment_method) THEN round((service_amount * 0.05), 2)
        ELSE (0)::numeric
    END)
END) STORED,
    currency_code character(3) DEFAULT 'LKR'::bpchar NOT NULL,
    payment_status public.booking_payment_status NOT NULL,
    gateway_reference character varying(200),
    card_brand character varying(40),
    card_last_four character(4),
    payee_account_last_four_snapshot character(4),
    payee_bank_snapshot character varying(150),
    payee_branch_snapshot character varying(150),
    payee_name_snapshot character varying(180),
    client_name_snapshot character varying(150) NOT NULL,
    provider_name_snapshot character varying(150) NOT NULL,
    category_name_snapshot character varying(80) NOT NULL,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: booking_payments_booking_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.booking_payments ALTER COLUMN booking_payment_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.booking_payments_booking_payment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: booking_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_status_history (
    booking_status_history_id bigint NOT NULL,
    booking_id bigint NOT NULL,
    old_status public.booking_status,
    new_status public.booking_status NOT NULL,
    changed_by_user_id bigint,
    change_reason text,
    changed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: booking_status_history_booking_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.booking_status_history ALTER COLUMN booking_status_history_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.booking_status_history_booking_status_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    booking_id bigint NOT NULL,
    client_user_id bigint NOT NULL,
    provider_user_id bigint NOT NULL,
    service_category_id smallint NOT NULL,
    job_description text NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    booking_status public.booking_status DEFAULT 'PENDING'::public.booking_status NOT NULL,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    responded_at timestamp with time zone,
    accepted_at timestamp with time zone,
    rejected_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    completed_at timestamp with time zone,
    cancelled_by_user_id bigint,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bookings_booking_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.bookings ALTER COLUMN booking_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.bookings_booking_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: client_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_locations (
    client_location_id bigint NOT NULL,
    client_user_id bigint NOT NULL,
    address_text text NOT NULL,
    latitude numeric(9,6) NOT NULL,
    longitude numeric(9,6) NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_latitude CHECK (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))),
    CONSTRAINT chk_longitude CHECK (((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric)))
);


--
-- Name: client_locations_client_location_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.client_locations ALTER COLUMN client_location_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.client_locations_client_location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: client_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_profiles (
    client_user_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: complaint_verdicts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaint_verdicts (
    complaint_id bigint NOT NULL,
    verification_admin_user_id bigint NOT NULL,
    investigation_notes text,
    verdict_text text NOT NULL,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: complaints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaints (
    complaint_id bigint NOT NULL,
    complainant_user_id bigint NOT NULL,
    target_user_id bigint NOT NULL,
    related_booking_id bigint,
    complaint_details text NOT NULL,
    complaint_status public.complaint_status DEFAULT 'SUBMITTED'::public.complaint_status NOT NULL,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    opened_by_user_id bigint,
    opened_at timestamp with time zone,
    acknowledgement_email_sent_at timestamp with time zone,
    resolved_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_complaint_self CHECK ((complainant_user_id <> target_user_id))
);


--
-- Name: complaints_complaint_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.complaints ALTER COLUMN complaint_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.complaints_complaint_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    contact_message_id bigint NOT NULL,
    full_name character varying(150) NOT NULL,
    email public.citext NOT NULL,
    subject character varying(200) NOT NULL,
    message_body text NOT NULL,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    is_resolved boolean DEFAULT false NOT NULL,
    resolved_at timestamp with time zone
);


--
-- Name: contact_messages_contact_message_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.contact_messages ALTER COLUMN contact_message_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.contact_messages_contact_message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: districts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.districts (
    district_id smallint NOT NULL,
    district_name public.citext NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: districts_district_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.districts ALTER COLUMN district_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.districts_district_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: email_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_logs (
    email_log_id bigint NOT NULL,
    recipient_user_id bigint,
    recipient_email_snapshot public.citext NOT NULL,
    template_code character varying(80) NOT NULL,
    email_subject character varying(255) NOT NULL,
    delivery_status public.email_delivery_status DEFAULT 'QUEUED'::public.email_delivery_status NOT NULL,
    related_entity_type character varying(60),
    related_entity_id bigint,
    attempt_count smallint DEFAULT 0 NOT NULL,
    last_error text,
    queued_at timestamp with time zone DEFAULT now() NOT NULL,
    sent_at timestamp with time zone
);


--
-- Name: email_logs_email_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.email_logs ALTER COLUMN email_log_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.email_logs_email_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: membership_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership_payments (
    membership_payment_id bigint NOT NULL,
    membership_id bigint NOT NULL,
    amount_paid numeric(12,2) NOT NULL,
    currency_code character(3) DEFAULT 'LKR'::bpchar NOT NULL,
    transaction_status public.payment_txn_status NOT NULL,
    gateway_reference character varying(200),
    card_brand character varying(40),
    card_last_four character(4),
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: membership_payments_membership_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.membership_payments ALTER COLUMN membership_payment_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.membership_payments_membership_payment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: membership_pricing_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership_pricing_rules (
    membership_pricing_rule_id smallint NOT NULL,
    category_count smallint NOT NULL,
    first_payment_amount numeric(12,2) NOT NULL,
    renewal_amount numeric(12,2) NOT NULL,
    duration_months smallint DEFAULT 1 NOT NULL,
    grace_days smallint DEFAULT 3 NOT NULL,
    currency_code character(3) DEFAULT 'LKR'::bpchar NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT membership_pricing_rules_category_count_check CHECK ((category_count = ANY (ARRAY[1, 2])))
);


--
-- Name: membership_pricing_rules_membership_pricing_rule_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.membership_pricing_rules ALTER COLUMN membership_pricing_rule_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.membership_pricing_rules_membership_pricing_rule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    password_reset_id bigint NOT NULL,
    user_id bigint NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: password_reset_tokens_password_reset_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.password_reset_tokens ALTER COLUMN password_reset_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.password_reset_tokens_password_reset_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: portfolio_post_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolio_post_images (
    portfolio_post_image_id bigint NOT NULL,
    portfolio_post_id bigint NOT NULL,
    storage_path text NOT NULL,
    original_filename character varying(255) NOT NULL,
    mime_type character varying(120) NOT NULL,
    file_size_bytes bigint NOT NULL,
    display_order smallint NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT portfolio_post_images_display_order_check CHECK ((display_order = ANY (ARRAY[1, 2, 3])))
);


--
-- Name: portfolio_post_images_portfolio_post_image_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.portfolio_post_images ALTER COLUMN portfolio_post_image_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.portfolio_post_images_portfolio_post_image_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: portfolio_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolio_posts (
    portfolio_post_id bigint NOT NULL,
    booking_id bigint NOT NULL,
    provider_user_id bigint NOT NULL,
    title character varying(180) NOT NULL,
    description text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: portfolio_posts_portfolio_post_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.portfolio_posts ALTER COLUMN portfolio_post_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.portfolio_posts_portfolio_post_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: provider_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_memberships (
    membership_id bigint NOT NULL,
    provider_user_id bigint NOT NULL,
    membership_pricing_rule_id smallint NOT NULL,
    membership_sequence_number integer NOT NULL,
    payment_type public.membership_payment_type NOT NULL,
    category_count_snapshot smallint NOT NULL,
    price_amount numeric(12,2) NOT NULL,
    currency_code character(3) DEFAULT 'LKR'::bpchar NOT NULL,
    membership_status public.membership_status DEFAULT 'PENDING_PAYMENT'::public.membership_status NOT NULL,
    starts_at timestamp with time zone,
    expires_at timestamp with time zone,
    grace_ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_grace_after_expiry CHECK (((grace_ends_at IS NULL) OR (grace_ends_at >= expires_at))),
    CONSTRAINT provider_memberships_category_count_snapshot_check CHECK ((category_count_snapshot = ANY (ARRAY[1, 2])))
);


--
-- Name: provider_memberships_membership_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.provider_memberships ALTER COLUMN membership_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.provider_memberships_membership_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: provider_payment_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_payment_settings (
    provider_user_id bigint NOT NULL,
    account_number_ciphertext text NOT NULL,
    account_number_last_four character(4) NOT NULL,
    bank_name character varying(150) NOT NULL,
    branch_name character varying(150) NOT NULL,
    account_holder_name character varying(180) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: provider_service_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_service_categories (
    provider_user_id bigint NOT NULL,
    service_category_id smallint NOT NULL,
    selected_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: provider_unavailable_periods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_unavailable_periods (
    unavailable_period_id bigint NOT NULL,
    provider_user_id bigint NOT NULL,
    unavailable_from date NOT NULL,
    unavailable_to date NOT NULL,
    reason character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_unavail_dates CHECK ((unavailable_to >= unavailable_from))
);


--
-- Name: provider_unavailable_periods_unavailable_period_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.provider_unavailable_periods ALTER COLUMN unavailable_period_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.provider_unavailable_periods_unavailable_period_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: revenue_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.revenue_entries (
    revenue_entry_id bigint NOT NULL,
    revenue_type public.revenue_type NOT NULL,
    booking_payment_id bigint,
    membership_payment_id bigint,
    amount numeric(12,2) NOT NULL,
    currency_code character(3) DEFAULT 'LKR'::bpchar NOT NULL,
    recognized_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_one_revenue_source CHECK (((((booking_payment_id IS NOT NULL))::integer + ((membership_payment_id IS NOT NULL))::integer) = 1)),
    CONSTRAINT revenue_entries_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: revenue_entries_revenue_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.revenue_entries ALTER COLUMN revenue_entry_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.revenue_entries_revenue_entry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    review_id bigint NOT NULL,
    booking_id bigint NOT NULL,
    rating smallint NOT NULL,
    review_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.reviews ALTER COLUMN review_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.reviews_review_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    role_id smallint NOT NULL,
    role_code character varying(40) NOT NULL,
    role_name character varying(80) NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.roles ALTER COLUMN role_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.roles_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_categories (
    service_category_id smallint NOT NULL,
    category_code character varying(40) NOT NULL,
    category_name character varying(80) NOT NULL,
    description text,
    icon_key character varying(100),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: service_categories_service_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.service_categories ALTER COLUMN service_category_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.service_categories_service_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: service_provider_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_provider_profiles (
    provider_user_id bigint NOT NULL,
    home_district_id smallint NOT NULL,
    service_district_id smallint NOT NULL,
    bio text NOT NULL,
    work_hours_details text NOT NULL,
    hourly_charge_estimate numeric(12,2),
    manual_online boolean DEFAULT false NOT NULL,
    verification_status public.verification_status DEFAULT 'PENDING'::public.verification_status NOT NULL,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT service_provider_profiles_hourly_charge_estimate_check CHECK ((hourly_charge_estimate >= (0)::numeric))
);


--
-- Name: site_media_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_media_assets (
    site_media_asset_id bigint NOT NULL,
    asset_type public.site_asset_type NOT NULL,
    storage_path text NOT NULL,
    original_filename character varying(255) NOT NULL,
    mime_type character varying(120) NOT NULL,
    file_size_bytes bigint NOT NULL,
    alt_text character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    uploaded_by_user_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: site_media_assets_site_media_asset_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.site_media_assets ALTER COLUMN site_media_asset_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.site_media_assets_site_media_asset_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sp_verification_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sp_verification_applications (
    verification_application_id bigint CONSTRAINT sp_verification_application_verification_application_i_not_null NOT NULL,
    provider_user_id bigint NOT NULL,
    attempt_number smallint NOT NULL,
    verification_status public.verification_status DEFAULT 'PENDING'::public.verification_status NOT NULL,
    police_station_name character varying(180) NOT NULL,
    police_report_date date NOT NULL,
    terms_version character varying(40) NOT NULL,
    terms_accepted_at timestamp with time zone NOT NULL,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_by_user_id bigint,
    reviewed_at timestamp with time zone,
    rejection_reason text
);


--
-- Name: sp_verification_applications_verification_application_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.sp_verification_applications ALTER COLUMN verification_application_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.sp_verification_applications_verification_application_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sp_verification_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sp_verification_documents (
    verification_document_id bigint NOT NULL,
    verification_application_id bigint NOT NULL,
    document_type public.verification_doc_type NOT NULL,
    storage_path text NOT NULL,
    original_filename character varying(255) NOT NULL,
    mime_type character varying(120) NOT NULL,
    file_size_bytes bigint NOT NULL,
    checksum_sha256 character varying(64),
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sp_verification_documents_verification_document_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.sp_verification_documents ALTER COLUMN verification_document_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.sp_verification_documents_verification_document_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_bans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_bans (
    user_ban_id bigint NOT NULL,
    user_id bigint NOT NULL,
    source_ban_request_id bigint,
    imposed_by_user_id bigint NOT NULL,
    ban_type public.ban_type NOT NULL,
    starts_at timestamp with time zone DEFAULT now() NOT NULL,
    ends_at timestamp with time zone,
    reason text NOT NULL,
    ban_status public.ban_status DEFAULT 'ACTIVE'::public.ban_status NOT NULL,
    revoked_by_user_id bigint,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_ban_ends CHECK ((((ban_type = 'TEMPORARY'::public.ban_type) AND (ends_at IS NOT NULL) AND (ends_at > starts_at)) OR ((ban_type = 'PERMANENT'::public.ban_type) AND (ends_at IS NULL))))
);


--
-- Name: user_bans_user_ban_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.user_bans ALTER COLUMN user_ban_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.user_bans_user_ban_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id bigint NOT NULL,
    role_id smallint NOT NULL,
    username public.citext NOT NULL,
    email public.citext NOT NULL,
    password_hash text NOT NULL,
    user_token character varying(6) NOT NULL,
    full_name character varying(150) NOT NULL,
    phone character varying(20) NOT NULL,
    profile_image_url text,
    account_status public.user_account_status DEFAULT 'ACTIVE'::public.user_account_status NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_token_format CHECK ((((user_token)::text ~ '^[A-Za-z0-9]{6}$'::text) AND ((user_token)::text ~ '[A-Z]'::text) AND ((user_token)::text ~ '[a-z]'::text) AND ((user_token)::text ~ '[0-9]'::text)))
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN user_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: vw_booking_overview; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_booking_overview AS
 SELECT b.booking_id,
    b.client_user_id,
    cu.full_name AS client_name,
    cu.user_token AS client_token,
    b.provider_user_id,
    pu.full_name AS provider_name,
    pu.user_token AS provider_token,
    sc.category_name AS service_category,
    b.scheduled_at,
    b.booking_status,
    bp.payment_method,
    bp.payment_status,
    b.requested_at,
    b.completed_at
   FROM ((((public.bookings b
     JOIN public.users cu ON ((cu.user_id = b.client_user_id)))
     JOIN public.users pu ON ((pu.user_id = b.provider_user_id)))
     JOIN public.service_categories sc ON ((sc.service_category_id = b.service_category_id)))
     LEFT JOIN public.booking_payments bp ON ((bp.booking_id = b.booking_id)));


--
-- Name: vw_current_provider_membership; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_current_provider_membership AS
 SELECT DISTINCT ON (provider_user_id) provider_user_id,
    membership_id,
    membership_status,
    starts_at,
    expires_at,
    grace_ends_at,
    category_count_snapshot,
    ((now() >= expires_at) AND (now() <= grace_ends_at)) AS is_in_grace_period
   FROM public.provider_memberships
  ORDER BY provider_user_id, membership_sequence_number DESC;


--
-- Name: vw_latest_provider_verification; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_latest_provider_verification AS
 SELECT DISTINCT ON (provider_user_id) provider_user_id,
    verification_status,
    verification_application_id AS latest_application_id,
    submitted_at,
    reviewed_at,
    rejection_reason
   FROM public.sp_verification_applications
  ORDER BY provider_user_id, attempt_number DESC;


--
-- Name: vw_monthly_revenue; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_monthly_revenue AS
 SELECT (EXTRACT(year FROM recognized_at))::integer AS revenue_year,
    (EXTRACT(month FROM recognized_at))::integer AS revenue_month,
    COALESCE(sum(amount) FILTER (WHERE (revenue_type = 'MEMBERSHIP'::public.revenue_type)), (0)::numeric) AS membership_income,
    COALESCE(sum(amount) FILTER (WHERE (revenue_type = 'CLIENT_PAYMENT_COMMISSION'::public.revenue_type)), (0)::numeric) AS commission_income,
    COALESCE(sum(amount), (0)::numeric) AS total_income
   FROM public.revenue_entries
  GROUP BY ((EXTRACT(year FROM recognized_at))::integer), ((EXTRACT(month FROM recognized_at))::integer)
  ORDER BY ((EXTRACT(year FROM recognized_at))::integer) DESC, ((EXTRACT(month FROM recognized_at))::integer) DESC;


--
-- Name: vw_provider_bookability; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_provider_bookability AS
 SELECT spp.provider_user_id,
    (spp.verification_status = 'APPROVED'::public.verification_status) AS is_verified,
    ((m.membership_status = 'ACTIVE'::public.membership_status) OR ((m.membership_status = 'ACTIVE'::public.membership_status) AND (now() <= m.grace_ends_at)) OR ((m.membership_status = 'EXPIRED'::public.membership_status) AND (now() <= m.grace_ends_at))) AS has_valid_membership_or_grace,
    (ub.user_ban_id IS NOT NULL) AS has_active_ban,
    spp.manual_online,
    ((spp.verification_status = 'APPROVED'::public.verification_status) AND (spp.manual_online = true) AND (ub.user_ban_id IS NULL) AND ((m.membership_status = 'ACTIVE'::public.membership_status) OR ((m.membership_status = 'EXPIRED'::public.membership_status) AND (now() <= m.grace_ends_at)))) AS is_bookable,
        CASE
            WHEN (spp.verification_status <> 'APPROVED'::public.verification_status) THEN 'Not verified'::text
            WHEN (ub.user_ban_id IS NOT NULL) THEN 'Banned'::text
            WHEN (NOT spp.manual_online) THEN 'Provider offline'::text
            WHEN (m.membership_id IS NULL) THEN 'No membership'::text
            WHEN ((m.membership_status = 'EXPIRED'::public.membership_status) AND (now() > m.grace_ends_at)) THEN 'Membership expired'::text
            ELSE 'Available'::text
        END AS bookability_reason
   FROM ((public.service_provider_profiles spp
     LEFT JOIN public.vw_current_provider_membership m USING (provider_user_id))
     LEFT JOIN public.user_bans ub ON (((ub.user_id = spp.provider_user_id) AND (ub.ban_status = 'ACTIVE'::public.ban_status))));


--
-- Name: vw_provider_search; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_provider_search AS
 SELECT spp.provider_user_id,
    u.full_name AS provider_name,
    u.user_token AS provider_token,
    u.profile_image_url,
    sc.service_category_id,
    sc.category_name AS service_category_name,
    d.district_id AS service_district_id,
    d.district_name,
    spp.hourly_charge_estimate,
    round(avg(r.rating), 2) AS average_rating,
    count(b.booking_id) FILTER (WHERE (b.booking_status = 'COMPLETED'::public.booking_status)) AS completed_job_count,
    count(b.booking_id) FILTER (WHERE ((b.booking_status = 'COMPLETED'::public.booking_status) AND (date_trunc('month'::text, b.completed_at) = date_trunc('month'::text, now())))) AS current_month_completed_jobs,
    u.created_at AS registered_at,
    (u.created_at >= (now() - '1 mon'::interval)) AS is_newcomer,
    bk.is_bookable
   FROM (((((((public.service_provider_profiles spp
     JOIN public.users u ON ((u.user_id = spp.provider_user_id)))
     JOIN public.provider_service_categories psc ON ((psc.provider_user_id = spp.provider_user_id)))
     JOIN public.service_categories sc ON ((sc.service_category_id = psc.service_category_id)))
     JOIN public.districts d ON ((d.district_id = spp.service_district_id)))
     LEFT JOIN public.bookings b ON ((b.provider_user_id = spp.provider_user_id)))
     LEFT JOIN public.reviews r ON ((r.booking_id = b.booking_id)))
     LEFT JOIN public.vw_provider_bookability bk ON ((bk.provider_user_id = spp.provider_user_id)))
  GROUP BY spp.provider_user_id, u.full_name, u.user_token, u.profile_image_url, sc.service_category_id, sc.category_name, d.district_id, d.district_name, spp.hourly_charge_estimate, u.created_at, bk.is_bookable;


--
-- Name: vw_provider_statistics; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_provider_statistics AS
 SELECT spp.provider_user_id,
    count(b.booking_id) FILTER (WHERE (b.booking_status = 'COMPLETED'::public.booking_status)) AS total_completed_jobs,
    count(b.booking_id) FILTER (WHERE ((b.booking_status = 'COMPLETED'::public.booking_status) AND (date_trunc('month'::text, b.completed_at) = date_trunc('month'::text, now())))) AS current_month_completed_jobs,
    count(b.booking_id) FILTER (WHERE (b.booking_status = 'ACCEPTED'::public.booking_status)) AS accepted_booking_count,
    count(b.booking_id) FILTER (WHERE (b.booking_status = 'REJECTED'::public.booking_status)) AS rejected_booking_count,
    round(avg(r.rating), 2) AS average_rating,
    count(r.review_id) AS review_count
   FROM ((public.service_provider_profiles spp
     LEFT JOIN public.bookings b ON ((b.provider_user_id = spp.provider_user_id)))
     LEFT JOIN public.reviews r ON ((r.booking_id = b.booking_id)))
  GROUP BY spp.provider_user_id;


--
-- Name: announcement_reads announcement_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_reads
    ADD CONSTRAINT announcement_reads_pkey PRIMARY KEY (announcement_id, user_id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (announcement_id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (audit_log_id);


--
-- Name: auth_sessions auth_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_pkey PRIMARY KEY (session_id);


--
-- Name: auth_sessions auth_sessions_refresh_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_refresh_token_hash_key UNIQUE (refresh_token_hash);


--
-- Name: ban_requests ban_requests_complaint_id_requested_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ban_requests
    ADD CONSTRAINT ban_requests_complaint_id_requested_user_id_key UNIQUE (complaint_id, requested_user_id);


--
-- Name: ban_requests ban_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ban_requests
    ADD CONSTRAINT ban_requests_pkey PRIMARY KEY (ban_request_id);


--
-- Name: booking_images booking_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_images
    ADD CONSTRAINT booking_images_pkey PRIMARY KEY (booking_image_id);


--
-- Name: booking_locations booking_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_locations
    ADD CONSTRAINT booking_locations_pkey PRIMARY KEY (booking_id);


--
-- Name: booking_payments booking_payments_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_payments
    ADD CONSTRAINT booking_payments_booking_id_key UNIQUE (booking_id);


--
-- Name: booking_payments booking_payments_gateway_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_payments
    ADD CONSTRAINT booking_payments_gateway_reference_key UNIQUE (gateway_reference);


--
-- Name: booking_payments booking_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_payments
    ADD CONSTRAINT booking_payments_pkey PRIMARY KEY (booking_payment_id);


--
-- Name: booking_status_history booking_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_status_history
    ADD CONSTRAINT booking_status_history_pkey PRIMARY KEY (booking_status_history_id);


--
-- Name: bookings bookings_booking_id_provider_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_booking_id_provider_user_id_key UNIQUE (booking_id, provider_user_id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (booking_id);


--
-- Name: client_locations client_locations_client_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_locations
    ADD CONSTRAINT client_locations_client_user_id_key UNIQUE (client_user_id);


--
-- Name: client_locations client_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_locations
    ADD CONSTRAINT client_locations_pkey PRIMARY KEY (client_location_id);


--
-- Name: client_profiles client_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_profiles
    ADD CONSTRAINT client_profiles_pkey PRIMARY KEY (client_user_id);


--
-- Name: complaint_verdicts complaint_verdicts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_verdicts
    ADD CONSTRAINT complaint_verdicts_pkey PRIMARY KEY (complaint_id);


--
-- Name: complaints complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (complaint_id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (contact_message_id);


--
-- Name: districts districts_district_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_district_name_key UNIQUE (district_name);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (district_id);


--
-- Name: email_logs email_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_pkey PRIMARY KEY (email_log_id);


--
-- Name: membership_payments membership_payments_gateway_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_payments
    ADD CONSTRAINT membership_payments_gateway_reference_key UNIQUE (gateway_reference);


--
-- Name: membership_payments membership_payments_membership_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_payments
    ADD CONSTRAINT membership_payments_membership_id_key UNIQUE (membership_id);


--
-- Name: membership_payments membership_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_payments
    ADD CONSTRAINT membership_payments_pkey PRIMARY KEY (membership_payment_id);


--
-- Name: membership_pricing_rules membership_pricing_rules_category_count_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_pricing_rules
    ADD CONSTRAINT membership_pricing_rules_category_count_key UNIQUE (category_count);


--
-- Name: membership_pricing_rules membership_pricing_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_pricing_rules
    ADD CONSTRAINT membership_pricing_rules_pkey PRIMARY KEY (membership_pricing_rule_id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (password_reset_id);


--
-- Name: password_reset_tokens password_reset_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: portfolio_post_images portfolio_post_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_post_images
    ADD CONSTRAINT portfolio_post_images_pkey PRIMARY KEY (portfolio_post_image_id);


--
-- Name: portfolio_post_images portfolio_post_images_portfolio_post_id_display_order_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_post_images
    ADD CONSTRAINT portfolio_post_images_portfolio_post_id_display_order_key UNIQUE (portfolio_post_id, display_order);


--
-- Name: portfolio_posts portfolio_posts_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_posts
    ADD CONSTRAINT portfolio_posts_booking_id_key UNIQUE (booking_id);


--
-- Name: portfolio_posts portfolio_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_posts
    ADD CONSTRAINT portfolio_posts_pkey PRIMARY KEY (portfolio_post_id);


--
-- Name: provider_memberships provider_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_memberships
    ADD CONSTRAINT provider_memberships_pkey PRIMARY KEY (membership_id);


--
-- Name: provider_memberships provider_memberships_provider_user_id_membership_sequence_n_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_memberships
    ADD CONSTRAINT provider_memberships_provider_user_id_membership_sequence_n_key UNIQUE (provider_user_id, membership_sequence_number);


--
-- Name: provider_payment_settings provider_payment_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_payment_settings
    ADD CONSTRAINT provider_payment_settings_pkey PRIMARY KEY (provider_user_id);


--
-- Name: provider_service_categories provider_service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_service_categories
    ADD CONSTRAINT provider_service_categories_pkey PRIMARY KEY (provider_user_id, service_category_id);


--
-- Name: provider_unavailable_periods provider_unavailable_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_unavailable_periods
    ADD CONSTRAINT provider_unavailable_periods_pkey PRIMARY KEY (unavailable_period_id);


--
-- Name: provider_unavailable_periods provider_unavailable_periods_provider_user_id_daterange_excl; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_unavailable_periods
    ADD CONSTRAINT provider_unavailable_periods_provider_user_id_daterange_excl EXCLUDE USING gist (provider_user_id WITH =, daterange(unavailable_from, unavailable_to, '[]'::text) WITH &&);


--
-- Name: revenue_entries revenue_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenue_entries
    ADD CONSTRAINT revenue_entries_pkey PRIMARY KEY (revenue_entry_id);


--
-- Name: reviews reviews_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_booking_id_key UNIQUE (booking_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: roles roles_role_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_code_key UNIQUE (role_code);


--
-- Name: service_categories service_categories_category_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_category_code_key UNIQUE (category_code);


--
-- Name: service_categories service_categories_category_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_category_name_key UNIQUE (category_name);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (service_category_id);


--
-- Name: service_provider_profiles service_provider_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_provider_profiles
    ADD CONSTRAINT service_provider_profiles_pkey PRIMARY KEY (provider_user_id);


--
-- Name: site_media_assets site_media_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_media_assets
    ADD CONSTRAINT site_media_assets_pkey PRIMARY KEY (site_media_asset_id);


--
-- Name: sp_verification_applications sp_verification_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sp_verification_applications
    ADD CONSTRAINT sp_verification_applications_pkey PRIMARY KEY (verification_application_id);


--
-- Name: sp_verification_applications sp_verification_applications_provider_user_id_attempt_numbe_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sp_verification_applications
    ADD CONSTRAINT sp_verification_applications_provider_user_id_attempt_numbe_key UNIQUE (provider_user_id, attempt_number);


--
-- Name: sp_verification_documents sp_verification_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sp_verification_documents
    ADD CONSTRAINT sp_verification_documents_pkey PRIMARY KEY (verification_document_id);


--
-- Name: sp_verification_documents sp_verification_documents_verification_application_id_docum_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sp_verification_documents
    ADD CONSTRAINT sp_verification_documents_verification_application_id_docum_key UNIQUE (verification_application_id, document_type);


--
-- Name: users uq_user_token; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_user_token UNIQUE (user_token);


--
-- Name: user_bans user_bans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bans
    ADD CONSTRAINT user_bans_pkey PRIMARY KEY (user_ban_id);


--
-- Name: user_bans user_bans_source_ban_request_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bans
    ADD CONSTRAINT user_bans_source_ban_request_id_key UNIQUE (source_ban_request_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: ix_al_action_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_al_action_code ON public.audit_logs USING btree (action_code);


--
-- Name: ix_al_actor_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_al_actor_user_id ON public.audit_logs USING btree (actor_user_id);


--
-- Name: ix_al_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_al_created_at ON public.audit_logs USING btree (created_at);


--
-- Name: ix_ann_published_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_ann_published_at ON public.announcements USING btree (published_at);


--
-- Name: ix_ann_scheduled_for; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_ann_scheduled_for ON public.announcements USING btree (scheduled_for);


--
-- Name: ix_ann_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_ann_status ON public.announcements USING btree (announcement_status);


--
-- Name: ix_bk_category_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_bk_category_status ON public.bookings USING btree (service_category_id, booking_status);


--
-- Name: ix_bk_client_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_bk_client_status ON public.bookings USING btree (client_user_id, booking_status);


--
-- Name: ix_bk_completed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_bk_completed_at ON public.bookings USING btree (completed_at);


--
-- Name: ix_bk_provider_sched; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_bk_provider_sched ON public.bookings USING btree (provider_user_id, scheduled_at);


--
-- Name: ix_bk_provider_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_bk_provider_status ON public.bookings USING btree (provider_user_id, booking_status);


--
-- Name: ix_bk_requested_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_bk_requested_at ON public.bookings USING btree (requested_at);


--
-- Name: ix_bp_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_bp_booking_id ON public.booking_payments USING btree (booking_id);


--
-- Name: ix_bp_paid_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_bp_paid_at ON public.booking_payments USING btree (paid_at);


--
-- Name: ix_br_request_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_br_request_status ON public.ban_requests USING btree (request_status);


--
-- Name: ix_bsh_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_bsh_booking_id ON public.booking_status_history USING btree (booking_id);


--
-- Name: ix_cm_complainant_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_cm_complainant_user_id ON public.complaints USING btree (complainant_user_id);


--
-- Name: ix_cm_complaint_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_cm_complaint_status ON public.complaints USING btree (complaint_status);


--
-- Name: ix_cm_submitted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_cm_submitted_at ON public.complaints USING btree (submitted_at);


--
-- Name: ix_cm_target_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_cm_target_user_id ON public.complaints USING btree (target_user_id);


--
-- Name: ix_el_recipient_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_el_recipient_user_id ON public.email_logs USING btree (recipient_user_id);


--
-- Name: ix_mpy_paid_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_mpy_paid_at ON public.membership_payments USING btree (paid_at);


--
-- Name: ix_pm_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pm_expires_at ON public.provider_memberships USING btree (expires_at);


--
-- Name: ix_pm_grace_ends_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pm_grace_ends_at ON public.provider_memberships USING btree (grace_ends_at);


--
-- Name: ix_pm_membership_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pm_membership_status ON public.provider_memberships USING btree (membership_status);


--
-- Name: ix_pm_provider_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pm_provider_user_id ON public.provider_memberships USING btree (provider_user_id);


--
-- Name: ix_portfolio_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_portfolio_created_at ON public.portfolio_posts USING btree (created_at);


--
-- Name: ix_portfolio_provider_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_portfolio_provider_id ON public.portfolio_posts USING btree (provider_user_id);


--
-- Name: ix_psc_service_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_psc_service_category_id ON public.provider_service_categories USING btree (service_category_id);


--
-- Name: ix_pup_provider_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pup_provider_user_id ON public.provider_unavailable_periods USING btree (provider_user_id);


--
-- Name: ix_rev_recognized_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_rev_recognized_at ON public.revenue_entries USING btree (recognized_at);


--
-- Name: ix_rev_revenue_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_rev_revenue_type ON public.revenue_entries USING btree (revenue_type);


--
-- Name: ix_spp_home_district_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_spp_home_district_id ON public.service_provider_profiles USING btree (home_district_id);


--
-- Name: ix_spp_manual_online; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_spp_manual_online ON public.service_provider_profiles USING btree (manual_online);


--
-- Name: ix_spp_service_district_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_spp_service_district_id ON public.service_provider_profiles USING btree (service_district_id);


--
-- Name: ix_spp_verification_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_spp_verification_status ON public.service_provider_profiles USING btree (verification_status);


--
-- Name: ix_sva_provider_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_sva_provider_user_id ON public.sp_verification_applications USING btree (provider_user_id);


--
-- Name: ix_sva_submitted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_sva_submitted_at ON public.sp_verification_applications USING btree (submitted_at);


--
-- Name: ix_sva_verification_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_sva_verification_status ON public.sp_verification_applications USING btree (verification_status);


--
-- Name: ix_ub_ends_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_ub_ends_at ON public.user_bans USING btree (ends_at);


--
-- Name: ix_ub_user_ban_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_ub_user_ban_status ON public.user_bans USING btree (user_id, ban_status);


--
-- Name: ix_users_account_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_users_account_status ON public.users USING btree (account_status);


--
-- Name: ix_users_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_users_created_at ON public.users USING btree (created_at);


--
-- Name: ix_users_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_users_role_id ON public.users USING btree (role_id);


--
-- Name: uix_active_home_hero; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uix_active_home_hero ON public.site_media_assets USING btree (asset_type) WHERE ((is_active = true) AND (asset_type = 'HOME_HERO_IMAGE'::public.site_asset_type));


--
-- Name: uix_active_login_side; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uix_active_login_side ON public.site_media_assets USING btree (asset_type) WHERE ((is_active = true) AND (asset_type = 'LOGIN_SIDE_IMAGE'::public.site_asset_type));


--
-- Name: uix_one_active_ban; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uix_one_active_ban ON public.user_bans USING btree (user_id) WHERE (ban_status = 'ACTIVE'::public.ban_status);


--
-- Name: uix_one_active_membership; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uix_one_active_membership ON public.provider_memberships USING btree (provider_user_id) WHERE (membership_status = 'ACTIVE'::public.membership_status);


--
-- Name: uix_one_pending_verification; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uix_one_pending_verification ON public.sp_verification_applications USING btree (provider_user_id) WHERE (verification_status = 'PENDING'::public.verification_status);


--
-- Name: uix_portfolio_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uix_portfolio_booking_id ON public.portfolio_posts USING btree (booking_id);


--
-- Name: uix_provider_accepted_time; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uix_provider_accepted_time ON public.bookings USING btree (provider_user_id, scheduled_at) WHERE (booking_status = 'ACCEPTED'::public.booking_status);


--
-- Name: uix_rev_booking_payment; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uix_rev_booking_payment ON public.revenue_entries USING btree (booking_payment_id) WHERE (booking_payment_id IS NOT NULL);


--
-- Name: uix_rev_membership_payment; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uix_rev_membership_payment ON public.revenue_entries USING btree (membership_payment_id) WHERE (membership_payment_id IS NOT NULL);


--
-- Name: uix_reviews_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uix_reviews_booking_id ON public.reviews USING btree (booking_id);


--
-- Name: uix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uix_users_email ON public.users USING btree (email);


--
-- Name: uix_users_user_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uix_users_user_token ON public.users USING btree (user_token);


--
-- Name: uix_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uix_users_username ON public.users USING btree (username);


--
-- Name: bookings trg_booking_status_history_ins; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_booking_status_history_ins AFTER INSERT OR UPDATE OF booking_status ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.trg_booking_status_history();


--
-- Name: bookings trg_booking_status_transition; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_booking_status_transition BEFORE UPDATE OF booking_status ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.trg_validate_booking_transition();


--
-- Name: client_profiles trg_client_profiles_role; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_client_profiles_role BEFORE INSERT OR UPDATE ON public.client_profiles FOR EACH ROW EXECUTE FUNCTION public.trg_check_client_role();


--
-- Name: portfolio_post_images trg_portfolio_image_limit; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_portfolio_image_limit BEFORE INSERT ON public.portfolio_post_images FOR EACH ROW EXECUTE FUNCTION public.trg_max_three_portfolio_images();


--
-- Name: provider_service_categories trg_provider_category_limit; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_provider_category_limit BEFORE INSERT ON public.provider_service_categories FOR EACH ROW EXECUTE FUNCTION public.trg_max_two_categories();


--
-- Name: service_provider_profiles trg_provider_profiles_role; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_provider_profiles_role BEFORE INSERT OR UPDATE ON public.service_provider_profiles FOR EACH ROW EXECUTE FUNCTION public.trg_check_provider_role();


--
-- Name: announcement_reads announcement_reads_announcement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_reads
    ADD CONSTRAINT announcement_reads_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES public.announcements(announcement_id);


--
-- Name: announcement_reads announcement_reads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_reads
    ADD CONSTRAINT announcement_reads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: announcements announcements_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: audit_logs audit_logs_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(user_id);


--
-- Name: auth_sessions auth_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: ban_requests ban_requests_complaint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ban_requests
    ADD CONSTRAINT ban_requests_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(complaint_id);


--
-- Name: ban_requests ban_requests_requested_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ban_requests
    ADD CONSTRAINT ban_requests_requested_by_user_id_fkey FOREIGN KEY (requested_by_user_id) REFERENCES public.users(user_id);


--
-- Name: ban_requests ban_requests_requested_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ban_requests
    ADD CONSTRAINT ban_requests_requested_user_id_fkey FOREIGN KEY (requested_user_id) REFERENCES public.users(user_id);


--
-- Name: ban_requests ban_requests_reviewed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ban_requests
    ADD CONSTRAINT ban_requests_reviewed_by_user_id_fkey FOREIGN KEY (reviewed_by_user_id) REFERENCES public.users(user_id);


--
-- Name: booking_images booking_images_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_images
    ADD CONSTRAINT booking_images_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id);


--
-- Name: booking_locations booking_locations_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_locations
    ADD CONSTRAINT booking_locations_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id);


--
-- Name: booking_payments booking_payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_payments
    ADD CONSTRAINT booking_payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id);


--
-- Name: booking_status_history booking_status_history_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_status_history
    ADD CONSTRAINT booking_status_history_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id);


--
-- Name: booking_status_history booking_status_history_changed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_status_history
    ADD CONSTRAINT booking_status_history_changed_by_user_id_fkey FOREIGN KEY (changed_by_user_id) REFERENCES public.users(user_id);


--
-- Name: bookings bookings_cancelled_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_cancelled_by_user_id_fkey FOREIGN KEY (cancelled_by_user_id) REFERENCES public.users(user_id);


--
-- Name: bookings bookings_client_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_client_user_id_fkey FOREIGN KEY (client_user_id) REFERENCES public.client_profiles(client_user_id);


--
-- Name: bookings bookings_provider_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_provider_user_id_fkey FOREIGN KEY (provider_user_id) REFERENCES public.service_provider_profiles(provider_user_id);


--
-- Name: bookings bookings_provider_user_id_service_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_provider_user_id_service_category_id_fkey FOREIGN KEY (provider_user_id, service_category_id) REFERENCES public.provider_service_categories(provider_user_id, service_category_id);


--
-- Name: client_locations client_locations_client_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_locations
    ADD CONSTRAINT client_locations_client_user_id_fkey FOREIGN KEY (client_user_id) REFERENCES public.client_profiles(client_user_id);


--
-- Name: client_profiles client_profiles_client_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_profiles
    ADD CONSTRAINT client_profiles_client_user_id_fkey FOREIGN KEY (client_user_id) REFERENCES public.users(user_id);


--
-- Name: complaint_verdicts complaint_verdicts_complaint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_verdicts
    ADD CONSTRAINT complaint_verdicts_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(complaint_id);


--
-- Name: complaint_verdicts complaint_verdicts_verification_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_verdicts
    ADD CONSTRAINT complaint_verdicts_verification_admin_user_id_fkey FOREIGN KEY (verification_admin_user_id) REFERENCES public.users(user_id);


--
-- Name: complaints complaints_complainant_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_complainant_user_id_fkey FOREIGN KEY (complainant_user_id) REFERENCES public.users(user_id);


--
-- Name: complaints complaints_opened_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_opened_by_user_id_fkey FOREIGN KEY (opened_by_user_id) REFERENCES public.users(user_id);


--
-- Name: complaints complaints_related_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_related_booking_id_fkey FOREIGN KEY (related_booking_id) REFERENCES public.bookings(booking_id);


--
-- Name: complaints complaints_target_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES public.users(user_id);


--
-- Name: email_logs email_logs_recipient_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_recipient_user_id_fkey FOREIGN KEY (recipient_user_id) REFERENCES public.users(user_id);


--
-- Name: membership_payments membership_payments_membership_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_payments
    ADD CONSTRAINT membership_payments_membership_id_fkey FOREIGN KEY (membership_id) REFERENCES public.provider_memberships(membership_id);


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: portfolio_post_images portfolio_post_images_portfolio_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_post_images
    ADD CONSTRAINT portfolio_post_images_portfolio_post_id_fkey FOREIGN KEY (portfolio_post_id) REFERENCES public.portfolio_posts(portfolio_post_id);


--
-- Name: portfolio_posts portfolio_posts_booking_id_provider_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_posts
    ADD CONSTRAINT portfolio_posts_booking_id_provider_user_id_fkey FOREIGN KEY (booking_id, provider_user_id) REFERENCES public.bookings(booking_id, provider_user_id);


--
-- Name: portfolio_posts portfolio_posts_provider_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_posts
    ADD CONSTRAINT portfolio_posts_provider_user_id_fkey FOREIGN KEY (provider_user_id) REFERENCES public.service_provider_profiles(provider_user_id);


--
-- Name: provider_memberships provider_memberships_membership_pricing_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_memberships
    ADD CONSTRAINT provider_memberships_membership_pricing_rule_id_fkey FOREIGN KEY (membership_pricing_rule_id) REFERENCES public.membership_pricing_rules(membership_pricing_rule_id);


--
-- Name: provider_memberships provider_memberships_provider_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_memberships
    ADD CONSTRAINT provider_memberships_provider_user_id_fkey FOREIGN KEY (provider_user_id) REFERENCES public.service_provider_profiles(provider_user_id);


--
-- Name: provider_payment_settings provider_payment_settings_provider_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_payment_settings
    ADD CONSTRAINT provider_payment_settings_provider_user_id_fkey FOREIGN KEY (provider_user_id) REFERENCES public.service_provider_profiles(provider_user_id);


--
-- Name: provider_service_categories provider_service_categories_provider_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_service_categories
    ADD CONSTRAINT provider_service_categories_provider_user_id_fkey FOREIGN KEY (provider_user_id) REFERENCES public.service_provider_profiles(provider_user_id);


--
-- Name: provider_service_categories provider_service_categories_service_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_service_categories
    ADD CONSTRAINT provider_service_categories_service_category_id_fkey FOREIGN KEY (service_category_id) REFERENCES public.service_categories(service_category_id);


--
-- Name: provider_unavailable_periods provider_unavailable_periods_provider_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_unavailable_periods
    ADD CONSTRAINT provider_unavailable_periods_provider_user_id_fkey FOREIGN KEY (provider_user_id) REFERENCES public.service_provider_profiles(provider_user_id);


--
-- Name: revenue_entries revenue_entries_booking_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenue_entries
    ADD CONSTRAINT revenue_entries_booking_payment_id_fkey FOREIGN KEY (booking_payment_id) REFERENCES public.booking_payments(booking_payment_id);


--
-- Name: revenue_entries revenue_entries_membership_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenue_entries
    ADD CONSTRAINT revenue_entries_membership_payment_id_fkey FOREIGN KEY (membership_payment_id) REFERENCES public.membership_payments(membership_payment_id);


--
-- Name: reviews reviews_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id);


--
-- Name: service_provider_profiles service_provider_profiles_home_district_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_provider_profiles
    ADD CONSTRAINT service_provider_profiles_home_district_id_fkey FOREIGN KEY (home_district_id) REFERENCES public.districts(district_id);


--
-- Name: service_provider_profiles service_provider_profiles_provider_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_provider_profiles
    ADD CONSTRAINT service_provider_profiles_provider_user_id_fkey FOREIGN KEY (provider_user_id) REFERENCES public.users(user_id);


--
-- Name: service_provider_profiles service_provider_profiles_service_district_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_provider_profiles
    ADD CONSTRAINT service_provider_profiles_service_district_id_fkey FOREIGN KEY (service_district_id) REFERENCES public.districts(district_id);


--
-- Name: site_media_assets site_media_assets_uploaded_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_media_assets
    ADD CONSTRAINT site_media_assets_uploaded_by_user_id_fkey FOREIGN KEY (uploaded_by_user_id) REFERENCES public.users(user_id);


--
-- Name: sp_verification_applications sp_verification_applications_provider_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sp_verification_applications
    ADD CONSTRAINT sp_verification_applications_provider_user_id_fkey FOREIGN KEY (provider_user_id) REFERENCES public.service_provider_profiles(provider_user_id);


--
-- Name: sp_verification_applications sp_verification_applications_reviewed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sp_verification_applications
    ADD CONSTRAINT sp_verification_applications_reviewed_by_user_id_fkey FOREIGN KEY (reviewed_by_user_id) REFERENCES public.users(user_id);


--
-- Name: sp_verification_documents sp_verification_documents_verification_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sp_verification_documents
    ADD CONSTRAINT sp_verification_documents_verification_application_id_fkey FOREIGN KEY (verification_application_id) REFERENCES public.sp_verification_applications(verification_application_id);


--
-- Name: user_bans user_bans_imposed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bans
    ADD CONSTRAINT user_bans_imposed_by_user_id_fkey FOREIGN KEY (imposed_by_user_id) REFERENCES public.users(user_id);


--
-- Name: user_bans user_bans_revoked_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bans
    ADD CONSTRAINT user_bans_revoked_by_user_id_fkey FOREIGN KEY (revoked_by_user_id) REFERENCES public.users(user_id);


--
-- Name: user_bans user_bans_source_ban_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bans
    ADD CONSTRAINT user_bans_source_ban_request_id_fkey FOREIGN KEY (source_ban_request_id) REFERENCES public.ban_requests(ban_request_id);


--
-- Name: user_bans user_bans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bans
    ADD CONSTRAINT user_bans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


--
-- PostgreSQL database dump complete
--

\unrestrict jpcGasqii4alsmn0mjLaNP6AfC1lz85SAxPbrhn9iRJlxoAI3OjaOXU9TK3wV13

