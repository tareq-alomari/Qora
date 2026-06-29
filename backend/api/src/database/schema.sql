-- ============================================
-- قرعة - qor3a Database Schema
-- DV Lottery Registration System
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('client', 'employee', 'admin');
CREATE TYPE order_status AS ENUM (
    'draft',
    'data_entry_complete',
    'photo_pending',
    'photo_rejected',
    'photo_accepted',
    'payment_pending',
    'payment_verification',
    'needs_correction',
    'approved',
    'submitted',
    'completed',
    'cancelled'
);
CREATE TYPE payment_method AS ENUM ('deposit', 'wallet');
CREATE TYPE payment_provider AS ENUM ('alkuraimi', 'jeeb', 'one_cash', 'mobile_money');
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected', 'refunded');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'in_app');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'read');
CREATE TYPE service_type AS ENUM ('dv_lottery', 'visa', 'translation', 'passport');

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email             VARCHAR(255) UNIQUE,
    phone             VARCHAR(20) UNIQUE NOT NULL,
    password_hash     VARCHAR(255) NOT NULL,
    full_name         VARCHAR(255),
    role              user_role DEFAULT 'client',
    is_verified       BOOLEAN DEFAULT FALSE,
    is_active         BOOLEAN DEFAULT TRUE,
    last_login_at     TIMESTAMPTZ,
    metadata          JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS (Core Entity - State Machine)
-- ============================================
CREATE TABLE orders (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type      service_type DEFAULT 'dv_lottery',
    status            order_status DEFAULT 'draft',
    total_price       DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency          VARCHAR(3) DEFAULT 'USD',
    notes             TEXT,
    metadata          JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPLICANT DATA (DV Lottery Specific)
-- ============================================
CREATE TABLE applicant_data (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id          UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,

    -- Personal Information
    first_name        VARCHAR(100),
    last_name         VARCHAR(100),
    middle_name       VARCHAR(100),
    gender            VARCHAR(10) CHECK (gender IN ('male', 'female')),
    birth_date        DATE,
    birth_country     VARCHAR(100),
    birth_city        VARCHAR(100),

    -- Contact
    email             VARCHAR(255),
    phone             VARCHAR(20),
    address_line1     TEXT,
    address_line2     TEXT,
    country           VARCHAR(100),
    city              VARCHAR(100),
    postal_code       VARCHAR(20),
    district          VARCHAR(100),

    -- Eligibility
    education_level   VARCHAR(100),
    marital_status    VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    spouse_data       JSONB DEFAULT '{}',
    children_data     JSONB DEFAULT '[]',

    -- Photo
    photo_path        VARCHAR(500),
    photo_validation  JSONB DEFAULT '{}',

    -- Submission
    confirmation_number VARCHAR(50),
    submitted_at      TIMESTAMPTZ,
    submitted_by      UUID REFERENCES users(id),

    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE payments (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount            DECIMAL(10,2) NOT NULL,
    currency          VARCHAR(3) DEFAULT 'USD',
    method            payment_method DEFAULT 'bank_transfer',
    provider          payment_provider,
    transfer_number   VARCHAR(100),
    receipt_image_path VARCHAR(500),
    status            payment_status DEFAULT 'pending',
    verified_by       UUID REFERENCES users(id),
    verified_at       TIMESTAMPTZ,
    rejection_reason  TEXT,
    notes             TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id          UUID REFERENCES orders(id) ON DELETE SET NULL,
    type              VARCHAR(50) NOT NULL,
    channel           notification_channel DEFAULT 'in_app',
    title             VARCHAR(255) NOT NULL,
    body              TEXT,
    metadata          JSONB DEFAULT '{}',
    status            notification_status DEFAULT 'pending',
    sent_at           TIMESTAMPTZ,
    read_at           TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE audit_logs (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id          UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
    action            VARCHAR(100) NOT NULL,
    from_status       order_status,
    to_status         order_status,
    metadata          JSONB DEFAULT '{}',
    ip_address        INET,
    user_agent        TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_applicant_data_order_id ON applicant_data(order_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transfer_number ON payments(transfer_number) WHERE transfer_number IS NOT NULL;
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_audit_logs_order_id ON audit_logs(order_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- UPDATED AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applicant_data_updated_at
    BEFORE UPDATE ON applicant_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (Supabase RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users: each user sees only their own record
CREATE POLICY users_own ON users
    FOR ALL USING (id = auth.uid());

-- Orders: client sees own, employee/admin sees all
CREATE POLICY orders_own ON orders
    FOR SELECT USING (user_id = auth.uid() OR auth.role() IN ('employee', 'admin'));
