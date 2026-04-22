CREATE DATABASE textil;
GO

ALTER DATABASE textil SET RECOVERY SIMPLE;
GO

USE textil;
GO

-- ============================================================================
-- RAW MQTT MESSAGES (auditoría / replay)
-- ============================================================================
CREATE TABLE mqtt_raw_messages (
    id          BIGINT IDENTITY(1,1) NOT NULL,
    received_at DATETIME2(3)         NOT NULL DEFAULT SYSUTCDATETIME(),
    topic       VARCHAR(500)         NOT NULL,
    payload     VARCHAR(4000)        NOT NULL,
    client      VARCHAR(50)          NULL,

    CONSTRAINT PK_mqtt_raw PRIMARY KEY CLUSTERED (id)
);

CREATE INDEX idx_mqtt_raw_time ON mqtt_raw_messages (received_at DESC);
GO

SELECT '✅ Table mqtt_raw_messages created' AS Result;
GO

-- ============================================================================
-- PARSE ERRORS
-- ============================================================================
CREATE TABLE parse_errors (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    raw_id      BIGINT               NOT NULL,
    received_at DATETIME2(3)         NOT NULL DEFAULT SYSUTCDATETIME(),
    topic       VARCHAR(500)         NOT NULL,
    error_code  VARCHAR(50)          NOT NULL,
    detail      VARCHAR(500)         NULL
);

CREATE INDEX idx_parse_errors_time ON parse_errors (received_at DESC);
GO

SELECT '✅ Table parse_errors created' AS Result;
GO

-- ============================================================================
-- TELEMETRY HISTORY
-- ============================================================================
CREATE TABLE telemetry_history (
    [timestamp]     DATETIME2(3)    NOT NULL,
    equipment_id    VARCHAR(100)    NOT NULL,
    variable        VARCHAR(100)    NOT NULL,

    value_float     FLOAT           NULL,
    value_int       BIGINT          NULL,
    value_string    NVARCHAR(255)   NULL,
    value_bool      BIT             NULL,

    datatype        VARCHAR(20)     NOT NULL,
    unit            VARCHAR(20)     NULL,
    quality         VARCHAR(10)     NOT NULL DEFAULT 'GOOD',

    CONSTRAINT PK_telemetry
        PRIMARY KEY CLUSTERED (equipment_id, variable, [timestamp])
        WITH (FILLFACTOR = 90)
);

CREATE INDEX idx_telemetry_time
ON telemetry_history ([timestamp] DESC)
WITH (FILLFACTOR = 90);
GO

SELECT '✅ Table telemetry_history created' AS Result;
GO

