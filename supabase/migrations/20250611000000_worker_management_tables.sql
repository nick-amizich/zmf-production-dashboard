-- Create worker availability table
CREATE TABLE IF NOT EXISTS worker_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    shift TEXT CHECK (shift IN ('morning', 'afternoon', 'evening')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(worker_id, date)
);

-- Create worker notifications table
CREATE TABLE IF NOT EXISTS worker_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_worker_availability_date ON worker_availability(date);
CREATE INDEX IF NOT EXISTS idx_worker_availability_worker_date ON worker_availability(worker_id, date);
CREATE INDEX IF NOT EXISTS idx_worker_notifications_worker ON worker_notifications(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_notifications_unread ON worker_notifications(worker_id, is_read) WHERE NOT is_read;

-- Enable RLS
ALTER TABLE worker_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for worker_availability
CREATE POLICY "Workers can view all availability" ON worker_availability
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Workers can manage their own availability" ON worker_availability
    FOR ALL TO authenticated
    USING (
        worker_id IN (
            SELECT id FROM workers WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Managers can manage all availability" ON worker_availability
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workers
            WHERE auth_user_id = auth.uid()
            AND role = 'manager'
        )
    );

-- RLS policies for worker_notifications
CREATE POLICY "Workers can view their own notifications" ON worker_notifications
    FOR SELECT TO authenticated
    USING (
        worker_id IN (
            SELECT id FROM workers WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Workers can update their own notifications" ON worker_notifications
    FOR UPDATE TO authenticated
    USING (
        worker_id IN (
            SELECT id FROM workers WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "System can create notifications" ON worker_notifications
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for worker_availability
CREATE TRIGGER update_worker_availability_updated_at BEFORE UPDATE ON worker_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();